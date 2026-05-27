import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add APIs at the top
api_code = """
async function saveFinancials(data) {
    const response = await fetch(
        'http://127.0.0.1:5000/api/financials/save',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    )
    return await response.json()
}

async function loadFinancials(email) {
    const response = await fetch(
        `http://127.0.0.1:5000/api/financials/${email}`
    )
    return await response.json()
}

async function syncFinancialDashboard() {
    if (!window.activeSession || !window.activeSession.email) return;

    try {
        const kpis = window.FinancialEngine.getFinancialKPIs();
        const expenses = window.FinancialEngine.calculateExpenses();
        const history = window.FinancialEngine.getHistoricalFinancials(financialGlobalFilter);
        const scenarios = await window.FinancialEngine.getScenarios();
        const readiness = window.FinancialInsights.calculateInvestorReadiness(kpis);
        const insights = window.FinancialInsights.generateInsights(kpis, expenses);

        const rd_spend = parseFloat(document.getElementById('profitRD')?.value) || 100000;
        const administration_cost = parseFloat(document.getElementById('profitAdmin')?.value) || 120000;
        const marketing_spend = parseFloat(document.getElementById('profitMarketing')?.value) || 300000;
        
        let predicted_profit = 0;
        const predVal = document.getElementById('profitPredictionValue')?.innerText;
        if (predVal) {
            predicted_profit = parseFloat(predVal.replace(/[^0-9.-]+/g,"")) || 0;
        }

        const payload = {
            user_email: window.activeSession.email,
            workspace: "VenturX HQ",
            total_revenue: kpis.mrr * 12,
            mrr: kpis.mrr,
            total_expenses: kpis.expenses,
            net_profit: kpis.profit,
            burn_rate: kpis.burnRate,
            investor_readiness: readiness,
            rd_spend,
            administration_cost,
            marketing_spend,
            predicted_profit,
            revenue_trajectory: history,
            expense_breakdown: expenses,
            profit_scenarios: scenarios,
            transactions: [],
            ai_insights: insights
        }

        console.log("FINANCIAL PAYLOAD:", payload)
        const result = await saveFinancials(payload)
        console.log("FINANCIAL RESPONSE:", result)

    } catch(e) {
        console.error("Sync Error:", e);
    }
}
"""

c = c.replace("let financialGlobalFilter = 6;", api_code + "\nlet financialGlobalFilter = 6;")

# Fix applyFinancialFilter to be async
c = c.replace("window.applyFinancialFilter = function() {", "window.applyFinancialFilter = async function() {")
c = c.replace("initFinancialsPage(); // Re-render everything with new timeframe", "initFinancialsPage(); // Re-render everything with new timeframe\n  await syncFinancialDashboard();")

# Auto load on initFinancialsPage (only at the beginning of the function)
load_code = """
  if (window.activeSession && window.activeSession.email) {
      try {
          const existingData = await loadFinancials(window.activeSession.email);
          if (existingData.success) {
              console.log("LOADED FINANCIAL DATA:", existingData.data);
          }
      } catch (e) {
          console.error("Load Error:", e);
      }
  }
"""
c = c.replace("if (!window.FinancialEngine || !window.FinancialCharts) return;", "if (!window.FinancialEngine || !window.FinancialCharts) return;\n" + load_code)


# Fix runProfitPredictorUI (add await syncFinancialDashboard)
c = c.replace('window.PlatformEngine.savePlatformData("financials");', 'window.PlatformEngine.savePlatformData("financials");\n      await syncFinancialDashboard();')

# Fix downloadFinancialReport to be async
c = c.replace("window.downloadFinancialReport = function() {", "window.downloadFinancialReport = async function() {")
c = c.replace("alert('<i data-lucide=\"check-circle-2\" class=\"icon-sm text-green-500\"></i> Professional AI Financial Report downloaded.');", "alert('<i data-lucide=\"check-circle-2\" class=\"icon-sm text-green-500\"></i> Professional AI Financial Report downloaded.');\n  await syncFinancialDashboard();")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched financials.js - Fixed async/await")
