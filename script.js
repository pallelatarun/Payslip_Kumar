document.addEventListener('DOMContentLoaded', () => {

    const payPeriodFrom = document.getElementById("payPeriodFrom");
    const payslipTitle = document.getElementById("payslipTitle");
    const payPeriodTo = document.getElementById("payPeriodTo");
    const paidDays = document.getElementById("paidDays");

    // Inputs
    const baseBasicPay = document.getElementById('baseBasicPay');
    const grossPayCP = document.getElementById('grossPayCP');
    const mealCouponCP = document.getElementById('mealCouponCP');
    const travelAllowanceCP = document.getElementById('travelAllowanceCP');
    const profTaxCP = document.getElementById('profTaxCP');
    const medInsCP = document.getElementById('medInsCP');
    const sodexoCP = document.getElementById('sodexoCP');
    
    const calcInputs = document.querySelectorAll('.calc-input');
    
    // Auto calculated CP elements
    const hraCP = document.getElementById('hraCP');
    const totalEarningsCP = document.getElementById('totalEarningsCP');
    const incomeTaxCP = document.getElementById('incomeTaxCP');
    const totalTaxCP = document.getElementById('totalTaxCP');
    const pfCP = document.getElementById('pfCP');
    const totalDeductionsCP = document.getElementById('totalDeductionsCP');

    // YTD Elements
    const grossPayYTD = document.getElementById('grossPayYTD');
    const hraYTD = document.getElementById('hraYTD');
    const mealCouponYTD = document.getElementById('mealCouponYTD');
    const travelAllowanceYTD = document.getElementById('travelAllowanceYTD');
    const totalEarningsYTD = document.getElementById('totalEarningsYTD');
    
    const incomeTaxYTD = document.getElementById('incomeTaxYTD');
    const totalTaxYTD = document.getElementById('totalTaxYTD');
    
    const pfYTD = document.getElementById('pfYTD');
    const profTaxYTD = document.getElementById('profTaxYTD');
    const medInsYTD = document.getElementById('medInsYTD');
    const sodexoYTD = document.getElementById('sodexoYTD');
    const totalDeductionsYTD = document.getElementById('totalDeductionsYTD');

    // Formula Elements
    const netPayFinal = document.getElementById('netPayFinal');
    const totalEarningsFinal = document.getElementById('totalEarningsFinal');
    const totalTaxFinal = document.getElementById('totalTaxFinal');
    const totalDeductionsFinal = document.getElementById('totalDeductionsFinal');


    // 1. Date and Title Calculation
    function calculateDays(startStr, endStr) {
        if(!startStr || !endStr) return;
        const start = new Date(startStr);
        const end = new Date(endStr);
        if(end >= start) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
            paidDays.value = diffDays.toFixed(2);
        } else {
            paidDays.value = "0.00";
        }
        updateCalculations();
    }

    payPeriodFrom.addEventListener("change", function(){
        const selectedValue = this.value;
        if(selectedValue){
            const date = new Date(selectedValue);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthName = date.toLocaleString('default', { month: 'long' });
            payslipTitle.innerText = `Payslip for the Month of ${monthName} - ${year}`;
            
            // Auto calculate end of month
            const lastDate = new Date(year, month + 1, 0);
            
            // Format YYYY-MM-DD for date input
            const dd = String(lastDate.getDate()).padStart(2, '0');
            const mm = String(lastDate.getMonth() + 1).padStart(2, '0');
            payPeriodTo.value = `${year}-${mm}-${dd}`;
            
            calculateDays(this.value, payPeriodTo.value);
        } else {
            payslipTitle.innerText = "Payslip Generator";
            payPeriodTo.value = "";
            paidDays.value = "";
        }
    });

    payPeriodTo.addEventListener("change", function(){
        calculateDays(payPeriodFrom.value, this.value);
    });

    // 2. Format numbers helper
    function fmt(num) {
        return (Math.round(num * 100) / 100).toFixed(2);
    }
    
    function getVal(element) {
        const val = parseFloat(element.value);
        return isNaN(val) ? 0 : val;
    }

    // 3. Tax Calculation function (New Regime approximation)
    function calculateAnnualTax(annualIncome) {
        let tax = 0;
        let taxableIncome = annualIncome - 50000; // Standard deduction
        
        if (taxableIncome <= 300000) {
            tax = 0;
        } else if (taxableIncome <= 600000) {
            tax = (taxableIncome - 300000) * 0.05;
        } else if (taxableIncome <= 900000) {
            tax = 15000 + (taxableIncome - 600000) * 0.10;
        } else if (taxableIncome <= 1200000) {
            tax = 45000 + (taxableIncome - 900000) * 0.15;
        } else if (taxableIncome <= 1500000) {
            tax = 90000 + (taxableIncome - 1200000) * 0.20;
        } else {
            tax = 150000 + (taxableIncome - 1500000) * 0.30;
        }
        
        // Under new regime, rebate u/s 87A makes tax 0 if income is <= 7L
        if (taxableIncome <= 700000) {
            tax = 0;
        }
        
        return tax > 0 ? tax : 0;
    }

    function getDaysInMonth(dateStr) {
        if (!dateStr) return 30; // default
        const d = new Date(dateStr);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    // 4. Update all calculations
    function updateCalculations() {
        // --- EARNINGS ---
        const baseBasic = getVal(baseBasicPay);
        const pDays = parseFloat(paidDays.value) || 0;
        const totalMonthDays = getDaysInMonth(payPeriodFrom.value);
        
        // Gross Pay Calculation
        const grossPay = (baseBasic / totalMonthDays) * pDays;
        if(grossPayCP) grossPayCP.value = fmt(grossPay);

        const meal = getVal(mealCouponCP);
        const travel = getVal(travelAllowanceCP);
        
        const hra = grossPay * 0.50;
        hraCP.value = fmt(hra);
        
        const totalEarn = grossPay + hra + meal + travel;
        totalEarningsCP.value = fmt(totalEarn);
        
        // Earnings YTD
        if(grossPayYTD) grossPayYTD.value = fmt(grossPay * 12);
        hraYTD.value = fmt(hra * 12);
        mealCouponYTD.value = fmt(meal * 12);
        travelAllowanceYTD.value = fmt(travel * 12);
        totalEarningsYTD.value = fmt(totalEarn * 12);
        
        // --- TAXES ---
        // Calculate based on projected annual income
        const annualIncome = totalEarn * 12;
        const annualTax = calculateAnnualTax(annualIncome);
        const monthlyTax = annualTax / 12;
        
        incomeTaxCP.value = fmt(monthlyTax);
        totalTaxCP.value = fmt(monthlyTax);
        
        incomeTaxYTD.value = fmt(annualTax);
        totalTaxYTD.value = fmt(annualTax);
        
        // --- DEDUCTIONS ---
        const pf = grossPay * 0.12;
        pfCP.value = fmt(pf);
        
        const pt = getVal(profTaxCP);
        const med = getVal(medInsCP);
        
        // Sodexo deduction equals meal coupon earning
        const sod = meal;
        sodexoCP.value = fmt(sod);
        
        const totalDed = pf + pt + med + sod;
        totalDeductionsCP.value = fmt(totalDed);
        
        // Deductions YTD
        pfYTD.value = fmt(pf * 12);
        profTaxYTD.value = fmt(pt * 12);
        medInsYTD.value = fmt(med * 12);
        sodexoYTD.value = fmt(sod * 12);
        totalDeductionsYTD.value = fmt(totalDed * 12);
        
        // --- FORMULA ---
        const netPay = totalEarn - (monthlyTax + totalDed);
        
        netPayFinal.value = fmt(netPay);
        totalEarningsFinal.value = fmt(totalEarn);
        totalTaxFinal.value = fmt(monthlyTax);
        totalDeductionsFinal.value = fmt(totalDed);
    }

    // Attach event listeners
    calcInputs.forEach(input => {
        input.addEventListener('input', updateCalculations);
        // Format on blur
        input.addEventListener('blur', function() {
            if(this.value) this.value = fmt(getVal(this));
        });
    });

    const bankName = document.getElementById('bankName');
    const bankAccount = document.getElementById('bankAccount');
    if (bankName && bankAccount) {
        bankName.addEventListener('change', function() {
            const val = this.value;
            // HDFC is 14 digits, rest 12
            if (val === 'HDFC') {
                bankAccount.maxLength = 14;
                bankAccount.title = "Accept exactly 14 Numerics for HDFC";
            } else {
                bankAccount.maxLength = 12;
                bankAccount.title = "Accept exactly 12 Numerics";
            }
        });
    }

    // 5. Backend Integration (Save/Update)
    const saveBtn = document.getElementById('saveBtn');
    
    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        saveBtn.innerText = 'Update';
        // Fetch existing data
        fetch(`http://localhost:3000/api/payslips/${editId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const p = data.data;
                    document.getElementById('empName').value = p.name || '';
                    document.getElementById('persNo').value = p.persNo || '';
                    if (document.getElementById('empEmail')) document.getElementById('empEmail').value = p.email || '';
                    document.getElementById('designation').value = p.designation || '';
                    if (document.getElementById('department')) document.getElementById('department').value = p.department || '';
                    document.getElementById('pan').value = p.pan || '';
                    document.getElementById('doj').value = p.doj || '';
                    document.getElementById('payPeriodFrom').value = p.payPeriodFrom || '';
                    document.getElementById('payPeriodTo').value = p.payPeriodTo || '';
                    document.getElementById('paidDays').value = p.paidDays || '';
                    document.getElementById('pfNo').value = p.pfNo || '';
                    document.getElementById('uan').value = p.uan || '';
                    if (document.getElementById('baseBasicPay')) document.getElementById('baseBasicPay').value = p.basicPay || '';
                    if (document.getElementById('grossPayCP')) document.getElementById('grossPayCP').value = p.grossPay || '';
                    document.getElementById('hraCP').value = p.hra || '';
                    document.getElementById('mealCouponCP').value = p.mealCoupon || '';
                    if (document.getElementById('travelAllowanceCP')) {
                        document.getElementById('travelAllowanceCP').value = p.travelAllowance || '';
                    }
                    document.getElementById('totalEarningsCP').value = p.totalEarnings || '';
                    document.getElementById('incomeTaxCP').value = p.incomeTax || '';
                    document.getElementById('totalTaxCP').value = p.totalTax || '';
                    document.getElementById('pfCP').value = p.pf || '';
                    document.getElementById('profTaxCP').value = p.profTax || '';
                    document.getElementById('medInsCP').value = p.medIns || '';
                    document.getElementById('sodexoCP').value = p.sodexo || '';
                    document.getElementById('totalDeductionsCP').value = p.totalDeductions || '';
                    document.getElementById('bankName').value = p.bankName || '';
                    document.getElementById('bankAccount').value = p.bankAccount || '';
                    document.getElementById('netPayFinal').value = p.netPay || '';
                    
                    // Trigger calculations
                    updateCalculations();
                }
            })
            .catch(err => console.error("Error fetching payslip", err));
    }
    
    saveBtn.addEventListener('click', async () => {
        const payload = {
            name: document.getElementById('empName').value,
            persNo: document.getElementById('persNo').value,
            email: document.getElementById('empEmail') ? document.getElementById('empEmail').value : '',
            designation: document.getElementById('designation').value,
            department: document.getElementById('department') ? document.getElementById('department').value : '',
            pan: document.getElementById('pan').value,
            doj: document.getElementById('doj').value,
            payPeriodFrom: document.getElementById('payPeriodFrom').value,
            payPeriodTo: document.getElementById('payPeriodTo').value,
            paidDays: document.getElementById('paidDays').value,
            pfNo: document.getElementById('pfNo').value,
            uan: document.getElementById('uan').value,
            
            basicPay: document.getElementById('baseBasicPay') ? document.getElementById('baseBasicPay').value : '',
            grossPay: document.getElementById('grossPayCP') ? document.getElementById('grossPayCP').value : '',
            hra: document.getElementById('hraCP').value,
            mealCoupon: document.getElementById('mealCouponCP').value,
            travelAllowance: document.getElementById('travelAllowanceCP') ? document.getElementById('travelAllowanceCP').value : '',
            totalEarnings: document.getElementById('totalEarningsCP').value,
            
            incomeTax: document.getElementById('incomeTaxCP').value,
            totalTax: document.getElementById('totalTaxCP').value,
            
            pf: document.getElementById('pfCP').value,
            profTax: document.getElementById('profTaxCP').value,
            medIns: document.getElementById('medInsCP').value,
            sodexo: document.getElementById('sodexoCP').value,
            totalDeductions: document.getElementById('totalDeductionsCP').value,
            
            bankName: document.getElementById('bankName').value,
            bankAccount: document.getElementById('bankAccount').value,
            
            netPay: document.getElementById('netPayFinal').value
        };
        
        try {
            const url = editId ? `http://localhost:3000/api/payslips/${editId}` : 'http://localhost:3000/api/payslips';
            const method = editId ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                alert(data.message);
                if (editId) {
                    window.location.href = 'index.html';
                } else {
                    document.getElementById('payslipForm').reset();
                    document.getElementById('payslipTitle').innerText = "Payslip Generator";
                }
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server. Is it running?");
        }
    });

    // 6. Download PDF Logic
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const element = document.querySelector('.main-container');
            const actionButtons = document.querySelector('.action-buttons');
            
            // Temporarily hide action buttons
            if (actionButtons) actionButtons.style.display = 'none';
            
            const empName = document.getElementById('empName').value || 'Employee';
            const opt = {
                margin:       0.3,
                filename:     `${empName.trim()}_Payslip.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            html2pdf().set(opt).from(element).save().then(() => {
                // Restore action buttons
                if (actionButtons) actionButtons.style.display = 'flex';
            }).catch(err => {
                console.error("PDF generation error: ", err);
                if (actionButtons) actionButtons.style.display = 'flex';
            });
        });
    }

    // 7. Clear Form Logic
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('payslipForm').reset();
            document.getElementById('payslipTitle').innerText = "Payslip Generator";
            updateCalculations();
        });
    }

});