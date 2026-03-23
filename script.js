// Initialize DOM Elements
const barcodeInput = document.getElementById('barcodeInput');
const statusMessage = document.getElementById('statusMessage');
const scanLog = document.getElementById('scanLog');

// Focus management
document.addEventListener('click', (e) => {
    // Only force focus if they aren't clicking the admin link or interacting with the camera
    if (e.target.tagName !== 'A' && !e.target.closest('#reader')) {
        barcodeInput.focus();
    }
});

// Load existing data on startup to display recent logs
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

// Display last 5 scans in log
attendanceData.slice().reverse().slice(0, 5).forEach(record => {
    // We only display time part in recent scans for cleaner UI
    const timeOnly = record.timestamp.split(' ')[1] || record.timestamp;
    addToLog(record.barcode, timeOnly);
});

barcodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const barcode = barcodeInput.value.trim();

        if (barcode) {
            saveAttendance(barcode);
            barcodeInput.value = '';
            barcodeInput.focus();
        }
    }
});

function saveAttendance(barcode) {
    try {
        const now = new Date();
        // Standardized formatting YYYY-MM-DD HH:MM:SS
        const timestamp = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, '0') + "-" +
            String(now.getDate()).padStart(2, '0') + " " +
            String(now.getHours()).padStart(2, '0') + ":" +
            String(now.getMinutes()).padStart(2, '0') + ":" +
            String(now.getSeconds()).padStart(2, '0');

        const record = { barcode: barcode, timestamp: timestamp };

        // Save dynamically to localStorage directly in browser without server
        attendanceData.push(record);
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));

        showStatus('Attendance recorded locally', 'success');

        // Add to top of UI log
        addToLog(barcode, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    } catch (error) {
        showStatus('Local storage error. Browser might be blocking data.', 'error');
        console.error('Storage Error:', error);
    }
}

function showStatus(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = `status-message show ${type}`;
    setTimeout(() => { statusMessage.classList.remove('show'); }, 2500);
}

function addToLog(barcode, formattedTime) {
    const li = document.createElement('li');

    const idSpan = document.createElement('span');
    idSpan.textContent = `ID: ${barcode}`;

    const timeSpan = document.createElement('span');
    timeSpan.textContent = formattedTime;
    timeSpan.className = 'log-time';

    li.appendChild(idSpan);
    li.appendChild(timeSpan);
    scanLog.prepend(li);
}

// Html5QrcodeScanner Initialization
let lastScannedCode = null;
let lastScannedTime = 0;

function onScanSuccess(decodedText, decodedResult) {
    const now = Date.now();
    // Prevent duplicate scans within 2 seconds
    if (decodedText !== lastScannedCode || (now - lastScannedTime > 2000)) {
        lastScannedCode = decodedText;
        lastScannedTime = now;

        // Show in input briefly and save
        barcodeInput.value = decodedText;
        saveAttendance(decodedText);

        // We do not clear the input right away so user sees it, 
        // saveAttendance already handles logic, maybe we can clear it after 1s
        setTimeout(() => {
            if (barcodeInput.value === decodedText) {
                barcodeInput.value = '';
            }
        }, 1000);
    }
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 100 } },
    /* verbose= */ false
);
html5QrcodeScanner.render(onScanSuccess);
