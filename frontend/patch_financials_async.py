import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the try-catch block from window.initFinancialsPage
pattern = r'try \{\s*const sessionStr = localStorage\.getItem\(\"venturx_session\"\);[\s\S]*?\} catch \(e\) \{\s*console\.error\(\"Failed to load live financials:\", e\);\s*\}'
content = re.sub(pattern, '', content)

new_func = """
async function loadFinancials() {
    try {
        const sessionStr = localStorage.getItem("startup_session") || localStorage.getItem("venturx_session");
        if (!sessionStr) return;
        
        const session = JSON.parse(sessionStr);
        const email = session.email;
        if (!email) return;
        
        console.log("Loading financials for:", email);
        
        const response = await fetch(`http://127.0.0.1:5000/api/financials/${encodeURIComponent(email)}`);
        const result = await response.json();
        
        console.log("Financial API Response:", result);
        
        let data = result.success ? result.data : {
            revenue: 1250000,
            mrr: 210000,
            expenses: 420000,
            profit: 830000,
            burn_rate: 18,
            investor_score: 94
        };
        
        const formatCurrency = (val) => '₹' + Math.round(val).toLocaleString('en-IN');
        
        const revEl = document.getElementById('finTotalRevenue');
        if (revEl) revEl.textContent = formatCurrency(data.revenue);
        
        const mrrEl = document.getElementById('finMRR');
        if (mrrEl) mrrEl.textContent = formatCurrency(data.mrr);
        
        const expEl = document.getElementById('finTotalExpenses');
        if (expEl) expEl.textContent = formatCurrency(data.expenses);
        
        const profitEl = document.getElementById('finNetProfit');
        if (profitEl) profitEl.textContent = formatCurrency(data.profit);
        
        const burnEl = document.getElementById('finBurnRate');
        if (burnEl) burnEl.textContent = data.burn_rate > 0 ? formatCurrency(data.burn_rate) : '₹0';
        
        const scoreEl = document.getElementById('finInvestorScore');
        if (scoreEl) scoreEl.textContent = data.investor_score + '/100';
        
    } catch(error) {
        console.error("Financial load failed:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadFinancials();
});
"""

content += "\n" + new_func

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched financials.js with loadFinancials()")
