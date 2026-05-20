document.addEventListener('DOMContentLoaded', () => {

    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const tableBody = document.getElementById('tableBody');

    // 1. Check Login Status
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }

    // 2. Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminId').value;
        const password = document.getElementById('adminPassword').value;

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
            } else {
                loginError.innerText = data.message;
                loginError.style.display = 'block';
            }
        } catch (err) {
            loginError.innerText = "Error connecting to server. Is it running?";
            loginError.style.display = 'block';
        }
    });

    // 3. Logout Logic
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        document.getElementById('adminPassword').value = '';
    });

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        loadPayslips();
    }

    // 4. Load & Search Payslips
    async function loadPayslips(searchQuery = '') {
        try {
            const res = await fetch(`http://localhost:3000/api/payslips?search=${encodeURIComponent(searchQuery)}`);
            const payslips = await res.json();

            tableBody.innerHTML = '';

            if (payslips.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No employees found.</td></tr>';
                return;
            }

            payslips.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.id}</td>
                    <td><strong>${p.name || '-'}</strong></td>
                    <td>${p.persNo || '-'}</td>
                    <td>${p.designation || '-'}</td>
                    <td>${p.email || '-'}</td>
                    <td>${p.payPeriodFrom || ''} to ${p.payPeriodTo || ''}</td>
                    <td>₹${p.netPay || '0.00'}</td>
                    <td>
                        <button class="btn btn-sm btn-edit edit-btn" title="Edit" data-id="${p.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" title="Delete" data-id="${p.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Attach listeners to new buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deletePayslip);
            });
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', editPayslip);
            });

        } catch (err) {
            console.error("Failed to load payslips", err);
        }
    }

    searchBtn.addEventListener('click', () => {
        loadPayslips(searchInput.value);
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadPayslips(searchInput.value);
    });

    // 5. Delete Logic
    async function deletePayslip(e) {
        const btn = e.currentTarget || e.target;
        const id = btn.getAttribute('data-id');
        const tr = btn.closest('tr');
        if (confirm(`Are you sure you want to delete payslip record ID ${id}?`)) {
            try {
                const res = await fetch(`http://localhost:3000/api/payslips/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    if (tr) tr.remove();
                } else {
                    alert("Failed to delete record.");
                }
            } catch (err) {
                console.error("Delete error", err);
                alert("Error connecting to server.");
            }
        }
    }

    // 6. Edit Logic (Redirect to generator with data or just alert for now)
    function editPayslip(e) {
        const btn = e.currentTarget || e.target;
        const id = btn.getAttribute('data-id');
        window.location.href = `payslip.html?edit=${id}`;
    }

});
