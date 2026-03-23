document.getElementById('adminForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const status = document.getElementById('loginStatus');

    // FOSS logic: Simple local client-side password just for demonstration of preventing casual access.
    // In a real serverless app, true security is impossible, but this deters normal users without a backend.
    if (password === 'admin123') { // Example password
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        status.textContent = 'Access granted. Redirecting...';
        status.className = 'status-message show success';
        setTimeout(() => {
            window.location.href = 'view.html';
        }, 1000);
    } else {
        status.textContent = 'Incorrect password.';
        status.className = 'status-message show error';
        setTimeout(() => { status.classList.remove('show'); }, 2000);
    }
});
