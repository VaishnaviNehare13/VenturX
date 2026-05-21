/**
 * Financial Modals Module
 * Handles the logic for opening detailed drill-down modals.
 */

const FinancialModals = (() => {

  function openKPIModal(title, metricType) {
    const modal = document.getElementById('financialModal');
    if (!modal) return;
    
    // Safety validation
    if (typeof metricType !== 'string') {
      console.warn("Invalid metricType passed to openKPIModal. Expected string, got: ", typeof metricType);
      metricType = String(metricType || "unknown");
    }

    // Await data if not loaded (though assumed loaded)
    if (!window.PlatformEngine) return;
    
    const kpis = window.FinancialEngine.getFinancialKPIs();
    let currentValue = 0;
    const mt = metricType.toLowerCase();
    if (mt === 'totalrevenueytd' || mt === 'revenue') currentValue = window.PlatformEngine.calculateTotalRevenue() || 0;
    else if (mt === 'mrr') currentValue = kpis.mrr;
    else if (mt === 'expenses') currentValue = kpis.expenses;
    else if (mt === 'profit' || mt === 'netprofit') currentValue = kpis.profit;
    else if (mt === 'burnrate' || mt === 'burn rate') currentValue = kpis.burnRate;
    else if (mt === 'investor' || mt === 'investorreadiness') currentValue = 85;

    document.getElementById('finModalTitle').textContent = title + ' Analysis';
    document.getElementById('finModalValue').textContent = (currentValue < 0 ? '-₹' : '₹') + Math.abs(currentValue).toLocaleString('en-IN');
    
    const canvasContainer = document.getElementById('finModalChartContainer');
    const emptyState = document.getElementById('finModalEmpty');
    const insightEl = document.getElementById('finModalInsight');
    
    const historyData = window.FinancialEngine.generateHistoricalSeries(metricType, 6);

    if (!historyData || historyData.values.length === 0) {
      if (canvasContainer) canvasContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      if (insightEl) insightEl.innerHTML = '';
    } else {
      if (canvasContainer) canvasContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
      
      if (window.FinancialCharts) {
        window.FinancialCharts.renderModalChart('finModalChart', historyData, title);
      }
      
      // Generate Insight
      if (insightEl) {
        let trend = historyData.values[historyData.values.length-1] - historyData.values[0];
        let perc = historyData.values[0] !== 0 ? Math.abs((trend / historyData.values[0]) * 100).toFixed(1) : 0;
        let dir = trend >= 0 ? "increased" : "decreased";
        let color = trend >= 0 ? "#10b981" : "#ef4444";
        if (metricType === 'expenses' || metricType === 'burnRate') color = trend <= 0 ? "#10b981" : "#ef4444";
        
        insightEl.innerHTML = `
         <div style="padding: 12px; background: rgba(0,0,0,0.2); border-left: 3px solid ${color}; border-radius: 4px; margin-top: 16px;">
          <div style="font-size: 13px; color: #e2e8f0;">
            <i data-lucide="lightbulb" class="icon-sm text-amber-500"></i> AI Insight: ${title} has ${dir} by <strong>${perc}%</strong> over the historical period.
          </div>
         </div>
        `;
      }
    }
    
    modal.classList.add('open');
  }

  function openInvestorModal(readinessData) {
    const modal = document.getElementById('investorModal');
    if (!modal) return;
    
    document.getElementById('invModalScore').textContent = readinessData.totalScore;
    document.getElementById('invModalScore').style.color = readinessData.color;
    document.getElementById('invModalRisk').textContent = readinessData.riskLevel;
    document.getElementById('invModalRec').textContent = readinessData.recommendation;
    
    const grid = document.getElementById('invModalBreakdown');
    grid.innerHTML = Object.entries(readinessData.breakdown).map(([key, val]) => {
      let col = val > 80 ? '#10b981' : (val > 50 ? '#f59e0b' : '#ef4444');
      return `
        <div class="radial-item">
          <div class="radial-circle" style="--fill-color: ${col}; --perc: ${val}%">
            <span>${val}</span>
          </div>
          <div class="muted" style="font-size: 12px; font-weight: 600; text-transform: uppercase;">${key}</div>
        </div>
      `;
    }).join('');
    
    if (window.FinancialCharts) {
      const radarData = {
        labels: Object.keys(readinessData.breakdown),
        values: Object.values(readinessData.breakdown)
      };
      window.FinancialCharts.renderModalChart('invModalChart', radarData, 'Investor Readiness');
    }

    modal.classList.add('open');
  }

  function openInsightModal(text, confidence) {
    const modal = document.getElementById('insightModal');
    if (!modal) return;
    
    document.getElementById('insightModalText').innerHTML = text;
    document.getElementById('insightModalConfidence').textContent = confidence + '%';
    
    const bar = document.getElementById('insightModalConfidenceBar');
    bar.style.width = confidence + '%';
    bar.style.background = confidence > 85 ? '#10b981' : (confidence > 70 ? '#f59e0b' : '#ef4444');
    
    modal.classList.add('open');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  return {
    openKPIModal,
    openInvestorModal,
    openInsightModal,
    closeModal
  };

})();

window.FinancialModals = FinancialModals;
