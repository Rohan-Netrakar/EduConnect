document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const gridContainer = document.getElementById('virtual-grid');
  const gridContent = document.getElementById('virtual-grid-content');
  const studentCountElement = document.getElementById('student-count');
  const studentFaceLogsContainer = document.getElementById('student-face-logs');
  const faceLogTemplate = document.getElementById('face-log-template').content;
  const stopClassBtn = document.getElementById('stop-class-btn');
  const studentSearch = document.getElementById('student-search');
  const sortEngagementBtn = document.getElementById('sort-engagement');
  
  // Virtualization constants
  const CARD_HEIGHT = 450;
  const CARD_MARGIN = 24;
  let visibleStudents = [];
  let allStudents = [];
  let sortDescending = true;
  
  // Persistent student data storage
  const studentDataMap = new Map();
  
  // Add cache busting to QR code
  const qrImg = document.getElementById('class-qr');
  if (qrImg) {
    qrImg.src = `${qrImg.src}?t=${Date.now()}`;
  }

  // Get class ID from the page
  const classId = document.querySelector('script[classId]')?.getAttribute('classId') || 
                  new URLSearchParams(window.location.search).get('classId');
  
  if (!classId) {
    alert('Class ID not found. Please create a class first.');
    return;
  }
  
  // Initialize engagement chart
  let engagementChart = null;
  const ctx = document.getElementById('engagement-chart')?.getContext('2d');
  if (ctx) {
    engagementChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Class Engagement',
          data: [],
          borderColor: '#4361ee',
          tension: 0.3,
          fill: true,
          backgroundColor: 'rgba(67, 97, 238, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: value => `${value}%`
            }
          }
        }
      }
    });
  }
  
  // Initialize virtualization
  function initVirtualGrid() {
    gridContent.innerHTML = '';
    gridContainer.addEventListener('scroll', updateVirtualGrid);
    
    if (studentSearch) {
      studentSearch.addEventListener('input', filterStudents);
    }
    
    if (sortEngagementBtn) {
      sortEngagementBtn.addEventListener('click', toggleSort);
    }
  }

  // Filter students
  function filterStudents() {
    const searchTerm = studentSearch.value.toLowerCase();
    visibleStudents = Array.from(studentDataMap.values()).filter(student => 
      student.name.toLowerCase().includes(searchTerm)
    );
    sortStudents();
    updateVirtualGrid();
  }

  // Toggle sort order
  function toggleSort() {
    sortDescending = !sortDescending;
    sortStudents();
    updateVirtualGrid();
  }

  // Sort students by engagement
  function sortStudents() {
    visibleStudents.sort((a, b) => 
      sortDescending ? b.engagement - a.engagement : a.engagement - b.engagement
    );
  }

  // Update virtual grid
  function updateVirtualGrid() {
    if (!visibleStudents.length) {
      gridContent.innerHTML = '<div class="no-students">No students match your search</div>';
      return;
    }
    
    const scrollTop = gridContainer.scrollTop;
    const containerHeight = gridContainer.clientHeight;
    const visibleCount = Math.ceil(containerHeight / (CARD_HEIGHT + CARD_MARGIN)) + 2;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / (CARD_HEIGHT + CARD_MARGIN)) - 1);
    const endIndex = Math.min(visibleStudents.length, startIndex + visibleCount);
    
    const totalHeight = visibleStudents.length * (CARD_HEIGHT + CARD_MARGIN);
    gridContent.style.height = `${totalHeight}px`;
    
    let html = '';
    for (let i = startIndex; i < endIndex; i++) {
      const student = visibleStudents[i];
      const topPosition = i * (CARD_HEIGHT + CARD_MARGIN);
      
      html += `
        <div class="virtual-grid-item" style="top: ${topPosition}px; height: ${CARD_HEIGHT}px">
          ${createStudentCardHTML(student)}
        </div>
      `;
    }
    
    gridContent.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const studentId = this.closest('.student-card').dataset.studentId;
        socket.emit('intervene', { studentId, classId });
      });
    });
    
    // Initialize charts
    document.querySelectorAll('.student-chart').forEach(canvas => {
      const card = canvas.closest('.student-card');
      const studentId = card.dataset.studentId;
      const student = studentDataMap.get(studentId);
      
      if (student) {
        // Destroy existing chart
        if (student.chart) {
          student.chart.destroy();
        }
        
        // Create new chart
        student.chart = createStudentChart(canvas, student);
      }
    });
  }

  // Create student chart
  function createStudentChart(canvas, student) {
    const history = student.history || [];
    const joinTime = student.joinedAt;
    const disconnectTime = student.disconnectTime;
    
    // Calculate session duration
    const currentTime = Date.now();
    const sessionDuration = disconnectTime 
      ? disconnectTime - joinTime 
      : student.disconnected ? currentTime - joinTime : currentTime - joinTime;
    
    // Generate time labels (10 divisions)
    const timeLabels = [];
    for (let i = 0; i <= 10; i++) {
      const time = (sessionDuration * i) / 10;
      const minutes = Math.floor(time / 60000);
      const seconds = Math.floor((time % 60000) / 1000);
      timeLabels.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    
    // Prepare data points
    const dataPoints = [];
    if (history.length > 0) {
      for (let i = 0; i <= 10; i++) {
        const index = Math.min(history.length - 1, Math.floor((i / 10) * (history.length - 1)));
        dataPoints.push(Math.round(history[index] * 100));
      }
    }
    
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          label: 'Engagement',
          data: dataPoints,
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.3,
          fill: true,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: value => `${value}%`
            }
          }
        }
      }
    });
  }

  // Create student card HTML
  function createStudentCardHTML(student) {
    const percentage = Math.round(student.engagement * 100);
    const engagementColor = getEngagementColor(student.engagement);
    const isDisconnected = student.disconnected;
    
    return `
      <div class="student-card" data-student-id="${student.id}">
        ${isDisconnected ? '<div class="disconnected-badge">Disconnected</div>' : ''}
        <div class="engagement-score" style="background: ${engagementColor}">${percentage}%</div>
        <div class="card-header">
          <div class="face-preview">
            <img class="face-image" src="${student.faceImage || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBNyw3IDAgMCwxIDE5LDExQTcsNyAwIDAsMSAxMiwxOEE3LDcgMCAwLDEgNSwxMUE3LDcgMCAwLDEgMTIsNE0xMiw2QTUsNSAwIDAsMCA3LDExQTUsNSAwIDAsMCAxMiwxNkE1LDUgMCAwLDAgMTcsMTFBNSw1IDAgMCwwIDEyLDZNMTIsOEEzLDMgMCAwLDEgMTUsMTFBNCw0IDAgMCwxIDEyLDE1QTQsNCAwIDAsMSA5LDExQTMsMyAwIDAsMSAxMiw4WiIgLz48L3N2Zz4='}" alt="Face of ${student.name}">
          </div>
          <div>
            <h3 class="student-name">${student.name}</h3>
          </div>
        </div>
        <div class="card-body">
          <div class="engagement-display">
            <div class="engagement-label">
              <span>Engagement Level</span>
            </div>
            <div class="engagement-meter">
              <div class="engagement-bar" style="width: ${percentage}%; background: ${getEngagementGradient(student.engagement)}"></div>
            </div>
          </div>
          
          <div class="student-graph-container">
            <h4><i class="fas fa-chart-line"></i> Engagement Timeline</h4>
            <canvas class="student-chart" height="100"></canvas>
          </div>
          
          <div class="intervention-panel" style="display: ${student.engagement < 0.5 ? 'block' : 'none'}">
            <h4><i class="fas fa-lightbulb"></i> Suggested Interventions</h4>
            <ul class="intervention-list">
              <li>Ask direct question</li>
              <li>Provide simplified example</li>
              <li>Start quick group discussion</li>
              <li>Check for understanding</li>
            </ul>
            <button class="action-btn" ${isDisconnected ? 'disabled' : ''}>
              <i class="fas fa-bolt"></i>
              Apply Intervention
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Handle stop class button
  if (stopClassBtn) {
    stopClassBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to stop this class? All student sessions will be ended.')) {
        stopClassBtn.disabled = true;
        stopClassBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Stopping...';
        socket.emit('teacher-stop-class', classId);
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    });
  }
  
  // Socket event handlers
  socket.on('init', (data) => {
    // Store all student data persistently
    data.students.forEach(student => {
      studentDataMap.set(student.id, {
        ...student,
        history: student.history || [],
        disconnectTime: student.disconnected ? Date.now() : null
      });
    });
    
    updateStudents();
    updateStudentCount(studentDataMap.size);
    initVirtualGrid();
    updateVirtualGrid();
  });
  
  socket.on('update', (data) => {
    // Update existing students and add new ones
    data.students.forEach(student => {
      const existing = studentDataMap.get(student.id) || {};
      studentDataMap.set(student.id, {
        ...existing,
        ...student,
        history: student.history || existing.history || [],
        disconnectTime: student.disconnected ? (existing.disconnectTime || Date.now()) : null
      });
    });
    
    updateStudents();
    updateStudentCount(studentDataMap.size);
    updateChart();
    updateVirtualGrid();
  });
  
  socket.on('intervention-applied', ({studentId, studentName}) => {
    const studentCard = document.querySelector(`.student-card[data-student-id="${studentId}"]`);
    if (studentCard) {
      const panel = studentCard.querySelector('.intervention-panel');
      if (panel) {
        panel.style.display = 'block';
        panel.style.backgroundColor = '#ffeb3b';
        setTimeout(() => {
          panel.style.backgroundColor = '#fff8e6';
        }, 1000);
      }
      
      // Show notification
      alert(`Intervention applied to ${studentName}`);
    }
  });
  
  socket.on('new-face-image', (data) => {
    const { studentId, studentName, imageData } = data;
    const sanitizedId = studentId.replace(/[^a-z0-9-]/gi, '_');
    
    // Create container if it doesn't exist
    let container = document.querySelector(`#face-log-container-${sanitizedId}`);
    if (!container) {
      const clone = faceLogTemplate.cloneNode(true);
      
      clone.querySelector('.student-name').textContent = studentName;
      const containerElement = clone.querySelector('.face-log-container');
      containerElement.id = `face-log-container-${sanitizedId}`;
      
      studentFaceLogsContainer.appendChild(clone);
      
      // Remove "no logs" message if it exists
      const noLogs = studentFaceLogsContainer.querySelector('.no-face-logs');
      if (noLogs) noLogs.remove();
      
      container = containerElement;
    }
    
    // Create and add new face log image
    const faceLogItem = document.createElement('div');
    faceLogItem.className = 'face-log-item';
    
    const img = document.createElement('img');
    img.className = 'face-log-img';
    img.src = `data:image/jpeg;base64,${imageData}`;
    img.alt = `Face capture of ${studentName}`;
    img.ariaLabel = `Face capture of ${studentName}`;
    
    faceLogItem.appendChild(img);
    container.appendChild(faceLogItem);
    
    // Scroll to the end
    container.scrollLeft = container.scrollWidth;
  });
  
  socket.on('student-disconnected', (studentId) => {
    const student = studentDataMap.get(studentId);
    if (student) {
      student.disconnected = true;
      student.disconnectTime = Date.now();
      studentDataMap.set(studentId, student);
      
      updateStudents();
      updateVirtualGrid();
    }
    
    // Remove face logs
    const sanitizedId = studentId.replace(/[^a-z0-9-]/gi, '_');
    const container = document.querySelector(`#face-log-container-${sanitizedId}`);
    if (container) {
      const studentLog = container.closest('.student-face-log');
      if (studentLog) {
        studentLog.remove();
      }
    }
    
    // Show "no logs" message if all students are gone
    if (document.querySelectorAll('.student-face-log').length === 0) {
      studentFaceLogsContainer.innerHTML = 
        '<div class="no-face-logs">No face logs available</div>';
    }
  });
  
  socket.on('update-student-count', (count) => {
    updateStudentCount(count);
  });
  
  // Helper functions
  function updateStudents() {
    allStudents = Array.from(studentDataMap.values());
    
    // Update visibleStudents while maintaining search filter
    const searchTerm = studentSearch ? studentSearch.value.toLowerCase() : '';
    visibleStudents = allStudents.filter(student => 
      student.name.toLowerCase().includes(searchTerm)
    );
    sortStudents();
  }
  
  function updateChart() {
    if (!engagementChart || allStudents.length === 0) return;
    
    const avgEngagement = allStudents.reduce((sum, student) => 
      sum + student.engagement, 0) / allStudents.length;
    const percentage = Math.round(avgEngagement * 100);
    
    const data = engagementChart.data.datasets[0].data;
    if (data.length >= 10) {
      engagementChart.data.labels.shift();
      data.shift();
    }
    
    engagementChart.data.labels.push(`T+${engagementChart.data.labels.length}`);
    data.push(percentage);
    
    engagementChart.update();
  }
  
  function updateStudentCount(count) {
    if (studentCountElement) {
      studentCountElement.textContent = count;
    }
  }
  
  function getEngagementGradient(score) {
    if (score >= 0.7) return 'linear-gradient(to right, #06d6a0, #4CAF50)';
    if (score >= 0.5) return 'linear-gradient(to right, #ffd166, #FFC107)';
    return 'linear-gradient(to right, #ef476f, #F44336)';
  }
  
  function getEngagementColor(score) {
    if (score >= 0.7) return '#06d6a0';
    if (score >= 0.5) return '#ffd166';
    return '#ef476f';
  }
  
  // Initial connection
  socket.emit('join-dashboard', classId);
  
  // Periodically update student list
  setInterval(() => {
    socket.emit('join-dashboard', classId);
  }, 10000);
});