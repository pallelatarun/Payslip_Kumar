# NR Softech Payslip Generator

## Overview
The NR Softech Payslip Generator is a full-stack web application designed to automate the generation, calculation, and management of employee payslips. It features a frontend that dynamically calculates financial formulas for earnings, taxes, and deductions, and a complete backend connected to a local SQLite database for data persistence and retrieval. An integrated Admin Portal provides secure management capabilities.

## Architecture & Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
- **Backend Framework**: Node.js with Express.js
- **Database**: SQLite3
- **PDF Generation**: `html2pdf.js`
- **Styling Paradigm**: Custom CSS with Flexbox layout and Google Fonts (Poppins)

## Features

### 1. Dynamic Payslip Form (`index.html`)
- **Auto-Calculations**: Entering a basic pay automatically calculates HRA, Total Earnings, Provident Fund (PF), Income Tax (new regime estimation), and Net Pay.
- **Date Management**: Selecting a "Pay Period From" automatically sets the "Pay Period To" to the end of that month, and auto-calculates the "Paid Days".
- **Real-time Formatting**: Formats monetary inputs (e.g., adding decimals).
- **PDF Export**: The "Download" button leverages `html2pdf.js` to strip out control buttons and save the form layout perfectly into a PDF format.

### 2. Admin Portal (`admin.html`)
- **Authentication**: Simple login screen. The default credentials are `admin` / `password123`.
- **Dashboard**: Displays a tabulated view of all saved employee payslips fetched directly from the database.
- **Search Capability**: An integrated search bar lets administrators filter the database by Employee Name, ID, or Email.
- **Record Management**: 
  - **Edit**: Redirects the admin back to the Payslip Form with data pre-populated, enabling updating existing database entries (`PUT` operations).
  - **Delete**: Safely removes records from the database.

### 3. Backend Express Server (`server.js`)
Handles the REST API requests from the frontend and manages database connections.

#### API Endpoints
- `POST /api/login`: Validates the admin credentials against the `admin` table.
- `GET /api/payslips`: Retrieves all payslip records, with optional `?search=` query parameter.
- `GET /api/payslips/:id`: Retrieves a single payslip record for editing.
- `POST /api/payslips`: Inserts a newly generated payslip into the database.
- `PUT /api/payslips/:id`: Updates an existing payslip based on ID.
- `DELETE /api/payslips/:id`: Deletes a payslip from the database.

## Database Schema (SQLite)

### Table: `admin`
Stores administrative users.
- `id` (INTEGER, PK)
- `username` (TEXT, UNIQUE)
- `password` (TEXT)

### Table: `payslips`
Stores comprehensive data for each employee.
- **Identity Details**: `name`, `persNo` (Employee ID), `email`, `designation`, `pan`, `doj`
- **Financial Period**: `payPeriodFrom`, `payPeriodTo`, `paidDays`
- **Registration Info**: `pfNo`, `uan`
- **Earnings**: `basicPay`, `hra`, `mealCoupon`, `totalEarnings`
- **Taxes**: `incomeTax`, `totalTax`
- **Deductions**: `pf`, `profTax`, `medIns`, `sodexo`, `totalDeductions`
- **Bank Information**: `bankName`, `bankAccount`
- **Summary**: `netPay`, `created_at`

## How to Run Locally

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Install Dependencies**:
   Navigate to the project folder (`Payslip_T`) in your terminal and run:
   ```bash
   npm install express sqlite3 cors
   ```
3. **Start the Server**:
   ```bash
   node server.js
   ```
4. **Access the Application**:
   - Generator: Open `http://localhost:3000` in your web browser.
   - Admin Dashboard: Open `http://localhost:3000/admin.html` in your web browser.
"# Payslip_Tarun" 
