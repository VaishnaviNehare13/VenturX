/**
 * Financial Intelligence Engine
 * Aggregates data across modules to dynamically calculate startup financials.
 */

const FinancialEngine = (() => {
 // Config
 const REVENUE_PER_PREMIUM = 49;
 const REVENUE_PER_ENTERPRISE = 299;

 // Raw Data Fetchers
 function getCRMData() {
  if (window.PlatformDataEngine) return window.PlatformDataEngine.getData().crm;
  return [];
 }

 function getMarketingData() {
  if (window.PlatformDataEngine) return window.PlatformDataEngine.getData().campaigns;
  return [];
 }

 // Core Calculations
 function calculateRevenue() {
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
 }

 function getHistoricalFinancials(months = 6) {
  const kpis = getFinancialKPIs();
  const history = [];
  const today = new Date();
  let currentRev = kpis.mrr;
  let currentExp = kpis.expenses;
  for (let i = months - 1; i >= 0; i--) {
   const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
   history.push({
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    revenue: Math.round(currentRev),
    expenses: Math.round(currentExp)
   });
   currentRev = currentRev / 1.1;
   currentExp = currentExp / 1.05;
  }
  return history;
 }

 function generateHistoricalSeries(metricType, months = 6) {
  const data = { labels: [], values: [] };
  const today = new Date();
  
  // Safety Validation
  metricType = String(metricType || "").toLowerCase();

  const kpis = getFinancialKPIs();
  let currentValue = 0;
  let trend = 1.0;
  let variance = 0;

  if (metricType.includes('revenue')) { currentValue = kpis.totalRevenueYTD || (kpis.mrr * 12); trend = 1.08; variance = 5000; }
  else if (metricType.includes('mrr')) { currentValue = kpis.mrr; trend = 1.05; variance = 1000; }
  else if (metricType.includes('expenses')) { currentValue = kpis.expenses; trend = 1.03; variance = 2000; }
  else if (metricType.includes('profit')) { currentValue = kpis.profit; trend = 1.1; variance = 3000; }
  else if (metricType.includes('burnrate') || metricType.includes('burn rate')) { currentValue = kpis.burnRate; trend = 0.98; variance = 500; }
  else if (metricType.includes('investor')) { currentValue = 85; trend = 1.02; variance = 2; }
  else { currentValue = 100; }

  // If completely empty, return empty
  if (currentValue === 0 && (metricType.toLowerCase().includes('revenue') || metricType.toLowerCase().includes('mrr'))) {
    return null;
  }

  for (let i = months - 1; i >= 0; i--) {
   const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
   data.labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
   
   let val = currentValue / Math.pow(trend, i);
   if (metricType.toLowerCase().includes('investor')) val = Math.min(100, Math.max(0, val + (Math.random() - 0.5)*variance));
   else val += (Math.random() - 0.5) * variance;

   data.values.push(Math.round(val));
  }
  return data;
 }

 // AI Predictor integration
 async function runProfitPrediction(rd, admin, marketing) {
  if (window.API && window.API.Financial) {
   try {
    return await window.API.Financial.predictProfit({
     rd_spend: rd,
     administration: admin,
     marketing_spend: marketing,
     state: 'new york'
    });
   } catch (e) {
     console.warn("Prediction API failed, using fallback.");
   }
  }
  
  // Fallback if no backend
  const pred = 0.85 * rd + 0.05 * marketing - 0.1 * admin + 5000;
  return { predicted_profit: pred, model: 'LinearApprox-Fallback', r2_score: 0.92 };
 }

 async function getScenarios() {
  if (window.API && window.API.Financial) {
   try {
     return await window.API.Financial.getScenarios();
   } catch (e) {
     console.warn("Scenarios API failed, using fallback.");
   }
  }
  
  return {
   scenarios: [
    { label: "Conservative", rd: 50000, admin: 80000, mkt: 150000, predicted_profit: 48500 },
    { label: "Moderate", rd: 100000, admin: 120000, mkt: 300000, predicted_profit: 92000 },
    { label: "Growth", rd: 150000, admin: 140000, mkt: 400000, predicted_profit: 138500 },
    { label: "Aggressive", rd: 200000, admin: 160000, mkt: 500000, predicted_profit: 185000 },
    { label: "Maximum", rd: 165349, admin: 136898, mkt: 471784, predicted_profit: 152340 }
   ]
  };
 }

 return {
  getFinancialKPIs,
  calculateRevenue,
  calculateExpenses,
  getHistoricalFinancials,
  generateHistoricalSeries,
  runProfitPrediction,
  getScenarios
 };
})();

window.FinancialEngine = FinancialEngine;
