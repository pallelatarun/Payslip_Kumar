const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create Admin table
        db.run(`CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            resetToken TEXT,
            resetTokenExpiry DATETIME
        )`, () => {
            // Insert default admin: ID: admin, Password: password123
            db.run(`INSERT OR IGNORE INTO admin (username, password) VALUES ('admin', 'password123')`);
            db.run(`ALTER TABLE admin ADD COLUMN resetToken TEXT`, () => { });
            db.run(`ALTER TABLE admin ADD COLUMN resetTokenExpiry DATETIME`, () => { });
        });

        // Create Payslips table
        db.run(`CREATE TABLE IF NOT EXISTS payslips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            persNo TEXT,
            email TEXT,
            designation TEXT,
            department TEXT,
            pan TEXT,
            doj TEXT,
            payPeriodFrom TEXT,
            payPeriodTo TEXT,
            paidDays TEXT,
            pfNo TEXT,
            uan TEXT,
            
            basicPay TEXT,
            grossPay TEXT,
            hra TEXT,
            mealCoupon TEXT,
            travelAllowance TEXT,
            totalEarnings TEXT,
            
            incomeTax TEXT,
            totalTax TEXT,
            
            pf TEXT,
            profTax TEXT,
            medIns TEXT,
            sodexo TEXT,
            totalDeductions TEXT,
            
            bankName TEXT,
            bankAccount TEXT,
            
            netPay TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Also attempt to add columns in case the table already exists
            db.run(`ALTER TABLE payslips ADD COLUMN travelAllowance TEXT`, (err) => { });
            db.run(`ALTER TABLE payslips ADD COLUMN grossPay TEXT`, (err) => { });
            db.run(`ALTER TABLE payslips ADD COLUMN department TEXT`, (err) => { });
        });
    }
});

// --- API ENDPOINTS ---

// Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM admin WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid ID or Password' });
        }
    });
});

// Save new Payslip
app.post('/api/payslips', (req, res) => {
    const data = req.body;

    const query = `INSERT INTO payslips (
        name, persNo, email, designation, department, pan, doj, payPeriodFrom, payPeriodTo, paidDays, pfNo, uan,
        basicPay, grossPay, hra, mealCoupon, travelAllowance, totalEarnings, incomeTax, totalTax, pf, profTax, medIns, sodexo, totalDeductions,
        bankName, bankAccount, netPay
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        data.name, data.persNo, data.email, data.designation, data.department, data.pan, data.doj,
        data.payPeriodFrom, data.payPeriodTo, data.paidDays, data.pfNo, data.uan,
        data.basicPay, data.grossPay, data.hra, data.mealCoupon, data.travelAllowance, data.totalEarnings,
        data.incomeTax, data.totalTax,
        data.pf, data.profTax, data.medIns, data.sodexo, data.totalDeductions,
        data.bankName, data.bankAccount, data.netPay
    ];

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, message: 'Payslip saved successfully!' });
    });
});

// Get all Payslips / Search
app.get('/api/payslips', (req, res) => {
    const search = req.query.search || '';
    const query = `SELECT * FROM payslips WHERE name LIKE ? OR persNo LIKE ? OR email LIKE ? ORDER BY created_at DESC`;
    const searchParam = `%${search}%`;

    db.all(query, [searchParam, searchParam, searchParam], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get a single Payslip
app.get('/api/payslips/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM payslips WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, data: row });
        } else {
            res.status(404).json({ success: false, message: 'Payslip not found' });
        }
    });
});

// Update a Payslip
app.put('/api/payslips/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;

    const query = `UPDATE payslips SET
        name = ?, persNo = ?, email = ?, designation = ?, department = ?, pan = ?, doj = ?, payPeriodFrom = ?, payPeriodTo = ?, paidDays = ?, pfNo = ?, uan = ?,
        basicPay = ?, grossPay = ?, hra = ?, mealCoupon = ?, travelAllowance = ?, totalEarnings = ?, incomeTax = ?, totalTax = ?, pf = ?, profTax = ?, medIns = ?, sodexo = ?, totalDeductions = ?,
        bankName = ?, bankAccount = ?, netPay = ?
        WHERE id = ?`;

    const params = [
        data.name, data.persNo, data.email, data.designation, data.department, data.pan, data.doj,
        data.payPeriodFrom, data.payPeriodTo, data.paidDays, data.pfNo, data.uan,
        data.basicPay, data.grossPay, data.hra, data.mealCoupon, data.travelAllowance, data.totalEarnings,
        data.incomeTax, data.totalTax,
        data.pf, data.profTax, data.medIns, data.sodexo, data.totalDeductions,
        data.bankName, data.bankAccount, data.netPay,
        id
    ];

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Payslip updated successfully!' });
    });
});

// Delete a Payslip
app.delete('/api/payslips/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM payslips WHERE id = ?`, id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Payslip deleted' });
    });
});

// Forgot Password Flow
// Configure this with your actual Gmail address and App Password.
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tarunkumarpallela@gmail.com', // Replace with your real Gmail address
        pass: 'Tarun@1912'     // Replace with your real Gmail App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Apply token to default admin
    db.run(`UPDATE admin SET resetToken = ?, resetTokenExpiry = ? WHERE username = 'admin'`, [token, expiry], async (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const resetLink = `http://localhost:${port}/reset-password.html?token=${token}`;

        const mailOptions = {
            from: '"NR Softech Admin" <admin@nrsoftech.com>',
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
            html: `<p>You requested a password reset.</p><p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('\n--- PASSWORD RESET EMAIL SENT ---');
            console.log('To: ' + email);
            console.log('Reset Link: ' + resetLink);
            console.log('---------------------------------\n');

            res.json({
                success: true,
                message: 'Password reset email sent!'
            });
        } catch (error) {
            console.error('SMTP sending failed, falling back to simulated email console log:', error.message);
            console.log('\n--- [SIMULATED] PASSWORD RESET EMAIL SENT ---');
            console.log('To: ' + email);
            console.log('Reset Link: ' + resetLink);
            console.log('---------------------------------------------\n');

            res.json({
                success: true,
                message: 'Password reset simulated (check server console)!',
                previewUrl: resetLink
            });
        }
    });
});

app.post('/api/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Missing token or password' });

    db.get(`SELECT * FROM admin WHERE username = 'admin' AND resetToken = ?`, [token], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

        if (new Date(row.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ success: false, message: 'Token has expired' });
        }

        db.run(`UPDATE admin SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE username = 'admin'`, [newPassword], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Password updated successfully' });
        });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`\n=================================================`);
    console.log(`Backend Server running at http://localhost:${port}`);
    console.log(`Admin Portal: http://localhost:${port}/index.html`);
    console.log(`=================================================\n`);
});
