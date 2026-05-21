import sys

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/financialEngine.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace getFinancialKPIs, calculateRevenue, calculateExpenses to use PlatformEngine
repl_orig = """  function calculateRevenue() {
    const crm = getCRMData();
    let mrr = 0;
    
    // Simulate revenue based on CRM activity levels and mock plans
    crm.forEach(customer => {
      if (customer.activityLevel === 'High') {
        mrr += REVENUE_PER_ENTERPRISE;
      } else if (customer.activityLevel === 'Medium') {
        mrr += REVENUE_PER_PREMIUM;
      }
    });

    const totalRevenueYTD = mrr * new Date().getMonth() + 1; // Basic simulation for YTD

    return { mrr, totalRevenueYTD };
  }

  function calculateExpenses() {
    const marketing = getMarketingData();
    let totalMarketingSpend = 0;

    marketing.forEach(campaign => {
      totalMarketingSpend += parseFloat(campaign.budget) || 0;
    });

    // Add baseline operational costs (Servers, Salaries, API costs)
    const baseOps = 15000;
    const baseSalaries = 25000;
    
    const monthlyExpenses = baseOps + baseSalaries + (totalMarketingSpend / 12); // Average monthly marketing

    return { totalMarketingSpend, monthlyExpenses, baseOps, baseSalaries };
  }

  function getFinancialKPIs() {
    const rev = calculateRevenue();
    const exp = calculateExpenses();

    const netProfit = rev.mrr - exp.monthlyExpenses;
    const profitMargin = rev.mrr > 0 ? (netProfit / rev.mrr) * 100 : 0;
    const burnRate = netProfit < 0 ? Math.abs(netProfit) : 0;
    
    // Assume $100k in the bank for runway calc
    const currentCash = 100000;
    const runwayMonths = burnRate > 0 ? (currentCash / burnRate) : 99; // 99 represents infinite/profitable

    return {
      mrr: rev.mrr,
      expenses: exp.monthlyExpenses,
      profit: netProfit,
      margin: profitMargin,
      burnRate,
      runwayMonths,
      cash: currentCash
    };
  }"""

repl_new = """  function calculateRevenue() {
    if (window.PlatformEngine) {
      const mrr = window.PlatformEngine.calculateMRR();
      const totalRevenueYTD = window.PlatformEngine.calculateTotalRevenue();
      return { mrr, totalRevenueYTD };
    }
    return { mrr: 0, totalRevenueYTD: 0 };
  }

  function calculateExpenses() {
    if (window.PlatformEngine) {
      const totalMarketingSpend = window.PlatformEngine.calculateTotalExpenses();
      const monthlyExpenses = totalMarketingSpend / 12;
      return { totalMarketingSpend, monthlyExpenses, baseOps: 0, baseSalaries: 0 };
    }
    return { totalMarketingSpend: 0, monthlyExpenses: 0, baseOps: 0, baseSalaries: 0 };
  }

  function getFinancialKPIs() {
    let mrr = 0, expenses = 0, profit = 0, margin = 0, burnRate = 0, runwayMonths = 99;
    const currentCash = 100000;

    if (window.PlatformEngine) {
      mrr = window.PlatformEngine.calculateMRR();
      expenses = window.PlatformEngine.calculateTotalExpenses();
      profit = window.PlatformEngine.calculateNetProfit();
      burnRate = window.PlatformEngine.calculateBurnRate();
      margin = mrr > 0 ? (profit / mrr) * 100 : 0;
      runwayMonths = burnRate > 0 ? (currentCash / burnRate) : 99;
    }

    return {
      mrr,
      expenses,
      profit,
      margin,
      burnRate,
      runwayMonths,
      cash: currentCash
    };
  }"""

content = content.replace(repl_orig, repl_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated financialEngine.js to use PlatformEngine")
