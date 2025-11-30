const express = require("express");
const socketIO = require("socket.io");
const { spawn } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 3000;

// Store class sessions persistently
const classSessions = new Map();

// Python AI Processor
const pythonProcess = spawn(process.env.PYTHON || "python3", [
  path.join(__dirname, "engagement_analyzer.py"),
]);
// const pythonPath = path.join(__dirname, "venv", "Scripts", "python.exe");

// // Python AI Processor
// const pythonProcess = spawn(pythonPath, [
//   path.join(__dirname, "engagement_analyzer.py"),
// ]);


const pendingRequests = new Map();

// Buffer for stdout data
let stdoutBuffer = "";

pythonProcess.stdout.on("data", (data) => {
  stdoutBuffer += data.toString();

  while (true) {
    const newlineIndex = stdoutBuffer.indexOf("\n");
    if (newlineIndex === -1) break;

    const line = stdoutBuffer.substring(0, newlineIndex).trim();
    stdoutBuffer = stdoutBuffer.substring(newlineIndex + 1);
    if (!line) continue;

    try {
      const result = JSON.parse(line);
      if (result.error) {
        console.error("Python error:", result.error);
        continue;
      }

      const request = pendingRequests.get(result.requestId);
      if (request) {
        pendingRequests.delete(result.requestId);
        clearTimeout(request.timeout);
        request.resolve(result);
      }
    } catch (e) {
      console.error("Error parsing Python output:", e);
      console.error("Problematic data:", line);
    }
  }
});

pythonProcess.stderr.on("data", (data) => {
  console.error("Python stderr:", data.toString());
});

pythonProcess.on("error", (err) => {
  console.error("Failed to start Python process:", err);
});

pythonProcess.on("close", (code) => {
  console.log(`Python process exited with code ${code}`);
});

// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.render('index');
});

app.get("/create-class", (req, res) => {
  const classId = uuidv4();
  const className = req.query.name || "Computer Science 101";

  classSessions.set(classId, {
    className,
    students: new Map(),
    startTime: Date.now(),
  });

  res.redirect(`/teacher-dashboard?classId=${classId}`);
});

app.get("/teacher-dashboard", (req, res) => {
  const classId = req.query.classId;
  const classData = classSessions.get(classId);

  if (!classData) {
    return res.status(404).send("Class not found. Create a class first.");
  }

  // Add dynamic protocol handling
  const protocol = req.secure ? 'https' : 'http';
  const host = req.headers.host;
  const joinUrl = `${protocol}://${host}/student-register?classId=${classId}`;

  res.render("dashboard", {
    classId,
    className: classData.className,
    date: new Date().toLocaleDateString(),
    host,
    joinUrl
  });
});

app.get("/student-register", (req, res) => {
  const classId = req.query.classId;
  const classData = classSessions.get(classId);

  if (!classData) {
    return res.status(404).send("Class not found. Check the class ID.");
  }

  res.render("student-register", { classId });
});

app.get("/student-client", (req, res) => {
  const { classId, studentId } = req.query;
  const classData = classSessions.get(classId);

  if (!classData || !classData.students.has(studentId)) {
    return res.status(404).send("Student not found in this class");
  }

  const student = classData.students.get(studentId);
  
  res.render("student-client", {
    classId,
    studentId,
    studentName: student.name,
  });
});

app.get("/goodbye", (req, res) => {
  res.send(`
    <h1>Session Ended</h1>
    <p>Your classroom session has ended. You can now close this window.</p>
    <p><a href="/">Return to Home</a></p>
  `);
});

app.get("/qr", async (req, res) => {
  try {
    const classId = req.query.classId;
    const url = `http://${req.headers.host}/student-register?classId=${classId}`;

    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      width: 300,
    });

    res.type("png");
    res.send(Buffer.from(qr.split(",")[1], "base64"));
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).send("Error generating QR code");
  }
});

app.post("/join-class", (req, res) => {
  const { classId, studentName } = req.body;
  const classData = classSessions.get(classId);

  if (!classData) {
    return res.json({ success: false, message: "Class not found" });
  }

  const studentId = `s${classData.students.size + 1}`;

  classData.students.set(studentId, {
    id: studentId,
    name: studentName,
    engagement: 0.75,
    history: [0.75],
    lastUpdate: Date.now(),
    faceImage: "",
    joinedAt: Date.now(),
    active: true,
    disconnected: false
  });

  res.json({
    success: true,
    studentId,
    className: classData.className,
    clientUrl: `http://${req.headers.host}/student-client?classId=${classId}&studentId=${studentId}`,
  });
});

// Socket.IO for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("join-dashboard", (classId) => {
    console.log(`Dashboard connected for class ${classId}`);
    socket.join(`class-${classId}`);

    const classData = classSessions.get(classId);
    if (classData) {
      socket.emit("init", {
        students: Array.from(classData.students.values()).map(student => ({
          id: student.id,
          name: student.name,
          engagement: student.engagement,
          faceImage: student.faceImage,
          history: student.history || [],
          joinedAt: student.joinedAt,
          disconnected: student.disconnected
        }))
      });
    }
  });

  socket.on("join-classroom", ({ classId, studentId }) => {
    const classData = classSessions.get(classId);
    if (classData && classData.students.has(studentId)) {
      const student = classData.students.get(studentId);
      student.active = true;
      student.disconnected = false;
      student.lastUpdate = Date.now();
      
      socket.join(`student-${studentId}`);
      console.log(`Student ${studentId} connected to class ${classId}`);

      // Send updated student list to dashboard
      io.to(`class-${classId}`).emit("update", {
        students: Array.from(classData.students.values()).map(student => ({
          id: student.id,
          name: student.name,
          engagement: student.engagement,
          faceImage: student.faceImage,
          history: student.history || [],
          joinedAt: student.joinedAt,
          disconnected: student.disconnected
        }))
      });
    }
  });

  socket.on("student-frame", async ({ classId, studentId, imageData }) => {
    const classData = classSessions.get(classId);
    if (!classData || !classData.students.has(studentId)) return;

    const student = classData.students.get(studentId);
    // Don't process if student has left the session
    if (!student.active || student.disconnected) return;

    try {
      const base64Data = imageData.split(",")[1];
      if (!base64Data) throw new Error("Invalid image data format");

      const result = await new Promise((resolve, reject) => {
        const requestId = uuidv4();
        const timeout = setTimeout(() => {
          pendingRequests.delete(requestId);
          reject(new Error("AI processing timeout"));
        }, 15000);

        pendingRequests.set(requestId, { resolve, reject, timeout });

        pythonProcess.stdin.write(
          JSON.stringify({
            requestId,
            image: base64Data,
          }) + "\n",
          (err) => {
            if (err) {
              clearTimeout(timeout);
              pendingRequests.delete(requestId);
              reject(err);
            }
          }
        );
      });

      // Handle case when student is not detected in frame
      if (result.engagement === null || result.engagement === undefined) {
        student.engagement = 0; // Set to 0 when not in frame
        student.history.push(0);
        student.lastUpdate = Date.now();
        student.faceImage = ""; // Clear face image

        io.to(`student-${studentId}`).emit("engagement-update", {
          engagement: 0,
          ear: 0,
          mar: 0,
          debug_image: "",
          face_image: "",
        });
      } else {
        // Existing successful processing logic
        student.engagement = result.engagement;
        student.history.push(result.engagement);
        student.lastUpdate = Date.now();
        student.faceImage = `data:image/jpeg;base64,${result.face_image}`;

        io.to(`student-${studentId}`).emit("engagement-update", {
          engagement: result.engagement,
          ear: result.ear,
          mar: result.mar,
          debug_image: `data:image/jpeg;base64,${result.debug_image}`,
          face_image: student.faceImage,
        });
      }

      // Send updated student list to dashboard
      io.to(`class-${classId}`).emit("update", {
        students: Array.from(classData.students.values()).map(student => ({
          id: student.id,
          name: student.name,
          engagement: student.engagement,
          faceImage: student.faceImage,
          history: student.history || [],
          joinedAt: student.joinedAt,
          disconnected: student.disconnected
        }))
      });
      
      // Send face image to dashboard
      if (result.face_image) {
        io.to(`class-${classId}`).emit("new-face-image", {
          studentId,
          studentName: student.name,
          imageData: result.face_image
        });
      }
    } catch (e) {
      console.error("Error processing frame:", e);
    }
  });

  socket.on("intervene", ({ studentId, classId }) => {
    const classData = classSessions.get(classId);
    if (classData && classData.students.has(studentId)) {
      const student = classData.students.get(studentId);
      console.log(`Intervention applied for ${student.name}`);

      io.to(`student-${studentId}`).emit("intervention", {
        message: `Teacher is checking on you!`,
      });

      io.to(`class-${classId}`).emit("intervention-applied", {
        studentId,
        studentName: student.name,
      });
    }
  });

  // Handle student stopping session
  socket.on("student-stop", ({ classId, studentId }) => {
    const classData = classSessions.get(classId);
    if (classData && classData.students.has(studentId)) {
      const student = classData.students.get(studentId);
      student.active = false;
      student.disconnected = true;
      console.log(
        `Student ${studentId} (${student.name}) stopped their session`
      );

      // Notify teacher dashboard
      io.to(`class-${classId}`).emit("update", {
        students: Array.from(classData.students.values()).map(student => ({
          id: student.id,
          name: student.name,
          engagement: student.engagement,
          faceImage: student.faceImage,
          history: student.history || [],
          joinedAt: student.joinedAt,
          disconnected: student.disconnected
        }))
      });
      
      // Notify student client
      io.to(`student-${studentId}`).emit("session-ended");
    }
  });

  // Handle teacher stopping class
  socket.on("teacher-stop-class", (classId) => {
    const classData = classSessions.get(classId);
    if (classData) {
      console.log(`Teacher stopped class ${classId}`);

      // Notify all students in the class
      io.to(`class-${classId}`).emit("class-stopped");

      // Mark all students as inactive
      classData.students.forEach(student => {
        student.active = false;
        student.disconnected = true;
      });

      // Remove class after delay to allow final updates
      setTimeout(() => {
        classSessions.delete(classId);
      }, 5000);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at http://localhost:${PORT}`);
});