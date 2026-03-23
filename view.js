// Check admin session instantly to prevent unauthorized data views
if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
    window.location.replace('admin.html');
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.replace('admin.html');
});

// Load and render data
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];

function renderTable() {
    tableBody.innerHTML = '';

    if (attendanceData.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    attendanceData.forEach((record, index) => {
        const row = document.createElement('tr');

        const cellIndex = document.createElement('td');
        cellIndex.textContent = index + 1;

        const cellBarcode = document.createElement('td');
        cellBarcode.textContent = record.barcode;

        const cellTime = document.createElement('td');
        cellTime.textContent = record.timestamp;

        row.appendChild(cellIndex);
        row.appendChild(cellBarcode);
        row.appendChild(cellTime);

        tableBody.appendChild(row);
    });
}

// Initial render
renderTable();

// Export to CSV functionally equivalent to Excel
document.getElementById('exportBtn').addEventListener('click', () => {
    if (attendanceData.length === 0) {
        alert("No data to export!");
        return;
    }

    // Create CSV content with UTF-8 BOM for Excel compatibility (FOSS standard)
    let csvContent = '\uFEFF';
    csvContent += "Student ID / Barcode,Timestamp\r\n";

    attendanceData.forEach(record => {
        // Escape quotes to prevent CSV injection format bugs
        const safeBarcode = String(record.barcode).replace(/"/g, '""');
        const safeTime = String(record.timestamp).replace(/"/g, '""');
        csvContent += `"${safeBarcode}","${safeTime}"\r\n`;
    });

    // Create a Blob and trigger a purely client-side download without a server
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Clear Data functionality with prompt
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm("Are you sure you want to completely wipe all documented attendance data? This cannot be undone.")) {
        localStorage.removeItem('attendanceData');
        attendanceData = [];
        renderTable();
    }
});
