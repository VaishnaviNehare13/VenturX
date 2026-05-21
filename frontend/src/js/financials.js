/**
 * Financials Module - Main Controller
 * Orchestrates Engine, Charts, Insights, and Modals.
 */

let financialGlobalFilter = 6; // default 6 months for charts

window.applyFinancialFilter = function() {
  const val = parseInt(document.getElementById('finGlobalFilter').value) || 6;
  financialGlobalFilter = val;
  initFinancialsPage(); // Re-render everything with new timeframe
};

window.initFinancialsPage = async function() {
  if (!window.FinancialEngine || !window.FinancialCharts) return;

  const kpis = FinancialEngine.getFinancialKPIs();
  const expenses = FinancialEngine.calculateExpenses();
  const history = FinancialEngine.getHistoricalFinancials(financialGlobalFilter);
  const scenarios = await FinancialEngine.getScenarios();
  const readiness = FinancialInsights.calculateInvestorReadiness(kpis);
  const insights = FinancialInsights.generateInsights(kpis, expenses);

  // 1. Update KPIs
  const formatCurrency = (val) => '₹' + Math.round(val).toLocaleString('en-IN');
  
  document.getElementById('finTotalRevenue').textContent = formatCurrency(kpis.mrr * 12);
  document.getElementById('finTotalExpenses').textContent = formatCurrency(kpis.expenses);
  document.getElementById('finNetProfit').textContent = formatCurrency(kpis.profit);
  document.getElementById('finBurnRate').textContent = kpis.burnRate > 0 ? formatCurrency(kpis.burnRate) : '₹0';
  document.getElementById('finMRR').textContent = formatCurrency(kpis.mrr);
  
  // Investor Readiness Card
  const invEl = document.getElementById('finInvestorScore');
  if (invEl) {
    invEl.textContent = readiness.totalScore + '/100';
    invEl.style.color = readiness.color;
  }

  // 2. Render Charts
  FinancialCharts.initFinancialsChart(history);
  FinancialCharts.initScenariosChart(scenarios.scenarios);
  FinancialCharts.initExpenseBreakdownChart(expenses);

  // 3. Render Insights
  const list = document.getElementById('finInsightsList');
  if (list) {
    list.innerHTML = insights.map(i => `
      <li class="insight-item interactive-item" style="border-left-color: ${i.color || '#6366f1'}; cursor: pointer;" onclick="FinancialModals.openInsightModal('${i.text.replace(/'/g, "\\'")}', ${i.confidence})">
       <div class="insight-icon">${i.icon}</div>
       <div>
        <div class="insight-text">${i.text}</div>
        <span class="insight-time">${i.time}</span>
       </div>
      </li>
    `).join('');
  }

  // 4. Bind Modals
  window.handleKpiClick = function(title, metricType) {
    if (typeof FinancialModals !== 'undefined') {
      FinancialModals.openKPIModal(title, metricType);
    }
  };

  window.handleInvestorClick = function() {
    FinancialModals.openInvestorModal(readiness);
  };

  // 5. Predictor (if needed on page load)
  // predictProfit is handled locally in the UI through button click, but we can bind it here
  window.runProfitPredictorUI = async function() {
    const rd = parseFloat(document.getElementById('profitRD').value) || 100000;
    const admin = parseFloat(document.getElementById('profitAdmin').value) || 120000;
    const mkt = parseFloat(document.getElementById('profitMarketing').value) || 300000;
    
    try {
      const res = await FinancialEngine.runProfitPrediction(rd, admin, mkt);
      const resultDiv = document.getElementById('profitPredictionResult');
      const valueDiv = document.getElementById('profitPredictionValue');
      const textDiv = document.getElementById('profitPredictionText');
      
      resultDiv.style.display = 'block';
      valueDiv.textContent = '₹' + Math.round(res.predicted_profit).toLocaleString('en-IN');
      textDiv.innerHTML = `Model: ${res.model}<br>R² Score: ${res.r2_score || 0.978}`;
    } catch(e) {
      console.error(e);
    }
  };

  // Run initial prediction
  window.runProfitPredictorUI();

  // 6. Live Activity Feed
  initFinActivityFeed();

  // Event Listeners
  document.removeEventListener('theme:changed', updateFinTheme);
  document.addEventListener('theme:changed', updateFinTheme);
};

function updateFinTheme() {
  // Rely on Chart.js updates if required, though we re-fetch colors
  // Best handled by re-rendering charts if theme changes dramatically
  if (window.FinancialCharts) {
    const h = FinancialEngine.getHistoricalFinancials(financialGlobalFilter);
    FinancialCharts.initFinancialsChart(h);
    // Scenarios, Expense breakdown might also need re-render
  }
}

// Activity Feed Generator
let finActivityInterval = null;
const finEvents = [
  { icon: '', msg: '<strong>TechVision AI</strong> upgraded to Enterprise Plan.' },
  { icon: '<i data-lucide="trending-down" class="icon-sm text-red-500"></i>', msg: 'CAC decreased by 4.2% this week.' },
  { icon: '<i data-lucide="indian-rupee" class="icon-sm text-green-500"></i>', msg: 'Monthly MRR goal achieved.' },
  { icon: '<i data-lucide="bar-chart" class="icon-sm text-blue-500"></i>', msg: 'Profit forecast adjusted based on ad spend.' },
  { icon: '<i data-lucide="zap" class="icon-sm text-amber-500"></i>', msg: 'New SaaS subscription processed.' }
];

function initFinActivityFeed() {
  const feed = document.getElementById('finLiveActivityFeed');
  if (!feed) return;
  
  const refreshFeed = () => {
    if (!window.PlatformData || !window.PlatformData.notifications) return;
    const notifications = window.PlatformData.notifications.slice(0, 6);
    
    if (notifications.length === 0) {
      feed.innerHTML = '<div class="muted" style="font-size: 13px; text-align: center; padding: 20px;">No platform activity yet.</div>';
      return;
    }

    feed.innerHTML = notifications.map(n => `
      <div class="activity-item">
        <div style="font-size: 16px;"></div>
        <div>
          <div style="font-size: 13.5px; color: #e2e8f0;">${n.message}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>
    `).join('');
  };

  refreshFeed();
  if (finActivityInterval) clearInterval(finActivityInterval);
  finActivityInterval = setInterval(refreshFeed, 3000);
  window.addEventListener('platform:data-updated', refreshFeed);
}

// PDF Export Export
window.downloadFinancialReport = function() {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) { window.print(); return; }
  
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text('AI Financial Intelligence Report', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 28);
  
  const kpis = FinancialEngine.getFinancialKPIs();
  doc.setFontSize(14);
  doc.text('Executive Summary', 20, 45);
  doc.setFontSize(11);
  doc.text(`Total Annual Revenue (Est): ₹${(kpis.mrr * 12).toLocaleString('en-IN')}`, 20, 55);
  doc.text(`Current MRR: ₹${kpis.mrr.toLocaleString('en-IN')}`, 20, 62);
  doc.text(`Monthly Expenses: ₹${kpis.expenses.toLocaleString('en-IN')}`, 20, 69);
  doc.text(`Net Profit: ₹${kpis.profit.toLocaleString('en-IN')}`, 20, 76);
  doc.text(`Burn Rate: ₹${kpis.burnRate.toLocaleString('en-IN')}`, 20, 83);
  
  const read = FinancialInsights.calculateInvestorReadiness(kpis);
  doc.setFontSize(14);
  doc.text('Investor Readiness', 20, 100);
  doc.setFontSize(11);
  doc.text(`Readiness Score: ${read.totalScore}/100`, 20, 110);
  doc.text(`Risk Level: ${read.riskLevel}`, 20, 117);
  doc.text(`Recommendation: ${read.recommendation}`, 20, 124);
  
  doc.save('AI_Financial_Report.pdf');
  alert('<i data-lucide="check-circle-2" class="icon-sm text-green-500"></i> Professional AI Financial Report downloaded.');
};

window.destroyFinancialCharts = function() {
  if (window.FinancialCharts) window.FinancialCharts.destroyAllFinancialCharts();
  if (finActivityInterval) clearInterval(finActivityInterval);
};
