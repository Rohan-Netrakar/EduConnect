# 📚 Classroom Engagement System

> **AI-powered platform for real-time student engagement analysis**  
> GitHub: [https://github.com/edu-connect/classroom-engagement-system](https://github.com/edu-connect/classroom-engagement-system)

---

## 🔍 System Overview

The Classroom Engagement System transforms education through computer vision and AI. By analyzing facial expressions and behavioral cues in real-time, it provides educators with actionable insights to improve teaching effectiveness and student participation.

---

## ✨ Key Features

- 📊 Real-time engagement tracking using facial analysis  
- 👨‍🏫 Interactive teacher dashboard with student insights  
- 📱 QR code-based classroom access system  
- 🚨 Intervention system for disengaged students  
- 📈 Historical engagement analytics  
- 🌐 Cross-device compatibility (laptops, tablets, smartphones)  
- ☁️ Public access via Cloudflare Tunnels  

---

## ⚙️ Prerequisites

| Tool        | Version | Download Link |
|-------------|---------|----------------|
| Node.js     | 18.x    | [https://nodejs.org/](https://nodejs.org/) |
| Python      | 3.10    | [https://www.python.org/downloads/](https://www.python.org/downloads/) |
| Git         | Latest  | [https://git-scm.com/](https://git-scm.com/) |
| Cloudflared | Latest  | [Cloudflare Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) |

---

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/edu-connect/classroom-engagement-system.git
   cd classroom-engagement-system
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python environment:**
   ```bash
   python -m venv venv
   ```

   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```

   - **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install opencv-python numpy mediapipe
   ```

---

## 🚀 Running the Application

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Visit the app:**  
   [http://localhost:3000](http://localhost:3000)

---

## 🌍 Make Localhost Public with Cloudflare

1. **Install Cloudflared:**

   - **Windows:**
     ```bash
     winget install --id Cloudflare.cloudflared
     ```

   - **Mac (Homebrew):**
     ```bash
     brew install cloudflare/cloudflare/cloudflared
     ```

   - **Linux:**
     ```bash
     sudo apt install cloudflared
     ```

2. **Verify installation:**
   ```bash
   cloudflared --version
   ```

3. **Create a public tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. **Authenticate and follow prompts to name your tunnel.**

5. **Share the generated public URL (e.g., https://your-tunnel.trycloudflare.com).**

---

## 👩‍🏫 Usage Guide

### 🧑‍🏫 Teacher Workflow:
1. Go to: [http://localhost:3000/create-class](http://localhost:3000/create-class)  
2. Share QR code or join link with students  
3. Monitor the real-time engagement dashboard  
4. Intervene if students are detected as disengaged  

### 🧑‍🎓 Student Workflow:
1. Scan QR code or visit the join link  
2. Enter your name and join the class  
3. Allow camera access  
4. Attend the session and stay engaged  

---

## 🧠 Technical Architecture

- **Frontend:** HTML5, CSS3, JavaScript, Chart.js  
- **Backend:** Node.js, Express, Socket.IO  
- **AI Engine:** Python, OpenCV, MediaPipe  
- **Real-time Communication:** WebSockets  
- **Deployment:** Cloudflare Tunnels  

### 📈 Data Flow:
1. Student client → WebSockets → Node.js server  
2. Node.js server → Python AI processor  
3. Processed data → Real-time teacher dashboard  

---

## 📄 Documentation & Resources

- 🎥 [Demo Video](https://drive.google.com/file/d/1ABCxyz123/preview)  
- 📊 [Presentation Slides](https://docs.google.com/presentation/d/1F4eDcGbA/edit)  
- 📕 [Project Report](https://drive.google.com/file/d/1sEfGhIjKl/preview)  
- 📚 [API Documentation](https://github.com/edu-connect/classroom-engagement-system/docs)  
- ☁️ [Cloudflare Tunnel Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)  

---

## ⚖️ License

MIT License – See `LICENSE` file for details  
© 2025 Classroom Engagement System Team  

---

## ✅ Get Started

Ready to transform your classroom?

1. Follow the installation guide  
2. Create your first class: [http://localhost:3000/create-class](http://localhost:3000/create-class)  
3. Share the QR code and start engaging!

---
