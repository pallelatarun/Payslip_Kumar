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
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminId').value.trim();
        const password = document.getElementById('adminPassword').value;
        // Set your demo admin credentials here!
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.innerText = "Invalid Admin ID or Password";
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

    // 4. Load & Search Payslips (from localStorage)
    function getPayslips() {
        return JSON.parse(localStorage.getItem('payslips') || '[]');
    }

    function savePayslips(payslips) {
        localStorage.setItem('payslips', JSON.stringify(payslips));
    }

    function loadPayslips(searchQuery = '') {
        let payslips = getPayslips();

        // Filter based on search query
        if (searchQuery && searchQuery.trim().length > 0) {
            const q = searchQuery.toLowerCase();
            payslips = payslips.filter(p =>
                (p.id && p.id.toLowerCase().includes(q)) ||
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q))
            );
        }

        tableBody.innerHTML = '';

        if (payslips.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No employees found.</td></tr>';
            return;
        }

        payslips.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id || ''}</td>
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
    }

    searchBtn.addEventListener('click', () => {
        loadPayslips(searchInput.value);
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadPayslips(searchInput.value);
    });

    // 5. Delete Logic
    function deletePayslip(e) {
        const btn = e.currentTarget || e.target;
        const id = btn.getAttribute('data-id');
        const tr = btn.closest('tr');
        if (confirm(`Are you sure you want to delete payslip record ID ${id}?`)) {
            let payslips = getPayslips();
            payslips = payslips.filter(p => p.id !== id);
            savePayslips(payslips);
            if (tr) tr.remove();
        }
    }

    // 6. Edit Logic (redirect to payslip.html with ?edit=id)
    function editPayslip(e) {
        const btn = e.currentTarget || e.target;
        const id = btn.getAttribute('data-id');
        window.location.href = `payslip.html?edit=${id}`;
    }

});
