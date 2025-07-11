%% Classroom Engagement System
% AI-powered platform for real-time student engagement analysis
% GitHub: https://github.com/edu-connect/classroom-engagement-system

%% System Overview
%{
The Classroom Engagement System transforms education through computer vision 
and AI. By analyzing facial expressions and behavioral cues in real-time, 
it provides educators with actionable insights to improve teaching 
effectiveness and student participation.
%}

%% Features
features = {
    '📊 Real-time engagement tracking using facial analysis';
    '👨‍🏫 Interactive teacher dashboard with student insights';
    '📱 QR code-based classroom access system';
    '🚨 Intervention system for disengaged students';
    '📈 Historical engagement analytics';
    '🌐 Cross-device compatibility (laptops, tablets, smartphones)';
    '☁️ Public access via Cloudflare Tunnels'
};

disp(' ');
disp('=== KEY FEATURES ===');
celldisp(features);
disp(' ');

%% Prerequisites
prereqs = {
    struct('name', 'Node.js', 'version', '18.x', 'url', 'https://nodejs.org/');
    struct('name', 'Python', 'version', '3.10', 'url', 'https://www.python.org/downloads/');
    struct('name', 'Git', 'version', 'Latest', 'url', 'https://git-scm.com/');
    struct('name', 'Cloudflared', 'version', 'Latest', 'url', 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
};

disp('=== PREREQUISITES ===');
for i = 1:length(prereqs)
    fprintf('%d. %s (%s) - %s\n', i, prereqs{i}.name, prereqs{i}.version, prereqs{i}.url);
end
disp(' ');

%% Installation
disp('=== INSTALLATION ===');
disp('1. Clone repository:');
disp('   git clone https://github.com/edu-connect/classroom-engagement-system.git');
disp('   cd classroom-engagement-system');
disp(' ');
disp('2. Install Node dependencies:');
disp('   npm install');
disp(' ');
disp('3. Set up Python environment:');
disp('   python -m venv venv');
disp(' ');
disp('   # Windows:');
disp('   venv\Scripts\activate');
disp(' ');
disp('   # Mac/Linux:');
disp('   source venv/bin/activate');
disp(' ');
disp('4. Install Python dependencies:');
disp('   pip install opencv-python numpy mediapipe');
disp(' ');

%% Running the Application
disp('=== RUNNING THE APPLICATION ===');
disp('Start the server:');
disp('   node server.js');
disp(' ');
disp('Access locally at: http://localhost:3000');
disp(' ');

%% Making Localhost Public with Cloudflare
disp('=== MAKING LOCALHOST PUBLIC ===');
disp('1. Install Cloudflared:');
disp('   # Windows:');
disp('   winget install --id Cloudflare.cloudflared');
disp(' ');
disp('   # Mac (Homebrew):');
disp('   brew install cloudflare/cloudflare/cloudflared');
disp(' ');
disp('   # Linux:');
disp('   sudo apt install cloudflared');
disp(' ');
disp('2. Verify installation:');
disp('   cloudflared --version');
disp(' ');
disp('3. Create public tunnel:');
disp('   cloudflared tunnel --url http://localhost:3000');
disp(' ');
disp('4. Follow prompts to authenticate and name your tunnel');
disp(' ');
disp('5. Share the generated URL (e.g., https://your-tunnel-name.trycloudflare.com)');
disp(' ');

%% Usage Guide
disp('=== USAGE GUIDE ===');
disp('TEACHER WORKFLOW:');
disp('   1. Create classroom: http://localhost:3000/create-class');
disp('   2. Share QR code/join link with students');
disp('   3. Monitor real-time engagement dashboard');
disp('   4. Apply interventions when needed');
disp(' ');
disp('STUDENT WORKFLOW:');
disp('   1. Scan QR code or visit join link');
disp('   2. Register with name');
disp('   3. Enable camera access');
disp('   4. Participate in class session');
disp(' ');

%% Technical Architecture
disp('=== TECHNICAL ARCHITECTURE ===');
architecture = {
    'Frontend: HTML5, CSS3, JavaScript, Chart.js';
    'Backend: Node.js, Express, Socket.IO';
    'AI Engine: Python, OpenCV, MediaPipe';
    'Real-time Communication: WebSockets';
    'Deployment: Cloudflare Tunnels';
    'Data Flow:';
    '   1. Student client → WebSockets → Node server';
    '   2. Node server → Python AI processor';
    '   3. AI analysis → Teacher dashboard'
};

celldisp(architecture);
disp(' ');

%% Documentation
disp('=== DOCUMENTATION & RESOURCES ===');
resources = {
    struct('type', 'Demo Video', 'url', 'https://drive.google.com/file/d/1ABCxyz123/preview');
    struct('type', 'Presentation Slides', 'url', 'https://docs.google.com/presentation/d/1F4eDcGbA/edit');
    struct('type', 'Project Report', 'url', 'https://drive.google.com/file/d/1sEfGhIjKl/preview');
    struct('type', 'API Documentation', 'url', 'https://github.com/edu-connect/classroom-engagement-system/docs');
    struct('type', 'Cloudflare Tunnels Guide', 'url', 'https://developers.cloudflare.com/cloudflare-one/connections/connect-apps');
};

for i = 1:length(resources)
    fprintf('%s: %s\n', resources{i}.type, resources{i}.url);
end
disp(' ');

%% License
disp('=== LICENSE ===');
disp('MIT License - See LICENSE file for details');
disp('Copyright (c) 2025 Classroom Engagement System Team');
disp(' ');

%% Get Started
disp('=== GET STARTED ===');
disp('Ready to transform your classroom?');
disp('1. Set up the system using the installation steps above');
disp('2. Create your first class: http://localhost:3000/create-class');
disp('3. Invite students using the generated QR code');
disp(' ');