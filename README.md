
# 📚 Classroom Engagement System – EduConnect

> **An AI-powered platform for real-time student engagement analysis**  
> 🔗 GitHub Repository: [https://github.com/Rohan-Netrakar/EduConnect](https://github.com/Rohan-Netrakar/EduConnect)

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![License](https://img.shields.io/badge/License-MIT-purple.svg)
![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web--Based-orange)

---

## 🔍 Overview

**EduConnect** transforms traditional classrooms using AI and computer vision. It leverages **MediaPipe** and **OpenCV** to analyze student facial expressions in real-time, providing teachers with actionable insights to foster better engagement and interactive learning.

---

## ✨ Key Features

- 📡 Real-time facial engagement tracking
- 👨‍🏫 Dynamic teacher dashboard with live student data
- 📱 Seamless student login via QR code
- 🚨 Disengagement alerts and attention analytics
- 📈 Historical engagement data storage and review
- 🌐 Cloudflare tunnel integration for remote accessibility
- 💻 Fully responsive design (laptops, tablets, phones)
- 🔄 Real-time communication using Socket.IO

---

## 🧰 Prerequisites

| Tool        | Version | Download Link |
|-------------|---------|----------------|
| Node.js     | 18.x    | [https://nodejs.org/](https://nodejs.org/) |
| Python      | 3.10    | [https://python.org/](https://python.org/) |
| Git         | Latest  | [https://git-scm.com/](https://git-scm.com/) |
| Cloudflared | Latest  | [Cloudflare Tunnel Setup](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) |

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Rohan-Netrakar/EduConnect.git
cd EduConnect
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install opencv-python numpy mediapipe
```

---

## 🚀 Run the Application

### Start the Local Server

```bash
node server.js
```

✅ Open your browser and go to:  
[http://localhost:3000](http://localhost:3000)

---

## 🌍 Expose Locally with Cloudflare Tunnel

### Install Cloudflared

**Windows:**

```bash
winget install --id Cloudflare.cloudflared
```

**macOS:**

```bash
brew install cloudflare/cloudflare/cloudflared
```

**Linux (APT):**

```bash
sudo apt install cloudflared
```

### Create a Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

📎 Share the generated URL with students (e.g., `https://yourname.trycloudflare.com`)

---

## 👩‍🏫 How to Use

### 👨‍🏫 Teacher Workflow

1. Open: [http://localhost:3000/create-class](http://localhost:3000/create-class)
2. Enter a class name and click **Create Class**
3. Share the QR code or join link with students
4. Monitor live engagement dashboard
5. Use disengagement alerts to intervene in real-time

### 👩‍🎓 Student Workflow

1. Scan QR code or visit shared link
2. Enter your name and allow camera access
3. Join the class and remain engaged on screen

---

## 🧠 Architecture

### 📦 Tech Stack

| Layer         | Technologies                             |
|---------------|-------------------------------------------|
| Frontend      | HTML5, CSS3, JavaScript, Chart.js, EJS    |
| Backend       | Node.js, Express.js, Socket.IO            |
| AI Processor  | Python, OpenCV, MediaPipe                 |
| Communication | WebSockets                                |
| Deployment    | Cloudflare Tunnel                         |

---

## 🔄 Data Flow Diagram

```plaintext
[Student Camera Feed]
        ↓
[Student Client (Browser)]
        ↓ WebSocket
[Node.js Server] ←→ [Python AI Engine (MediaPipe + OpenCV)]
        ↓
[Teacher Dashboard (Real-time Data + Charts)]
```

---

## 📂 Folder Structure

```bash
EduConnect/
├── public/            # Static files (HTML, CSS, JS)
├── views/             # EJS templates for rendering pages
├── engagement_analyzer.py       # Python file to process video frames
├── server.js          # Main backend server (Express + Socket.IO)
├── package.json       # Node.js dependencies
├── README.md          # Project documentation
└── ...
```

---

## 📄 Documentation & Resources

- 🎥 [Demo Video](https://drive.google.com/file/d/1ABCxyz123/preview)
- 📊 [Presentation Slides](https://docs.google.com/presentation/d/1F4eDcGbA/edit)
- 📕 [Final Report](https://drive.google.com/file/d/1sEfGhIjKl/preview)
- ☁️ [Cloudflare Tunnel Setup Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)

---

## ✅ Quick Start Checklist

1. ✅ Clone the repository  
2. ✅ Install all Node.js and Python dependencies  
3. ✅ Run `node server.js`  
4. ✅ Access `http://localhost:3000` in your browser  
5. ✅ Use Cloudflare Tunnel for remote sharing  
6. ✅ Start a class, share QR, and monitor engagement in real-time

---

## ⚖️ License

This project is licensed under the **MIT License**.  
See the [`LICENSE`](LICENSE) file for details.

---

> Made with ❤️ by the BugSmashers Team — Empowering smarter, more connected classrooms using AI.
