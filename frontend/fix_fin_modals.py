import sys

base_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/"

# 1. Update financialEngine.js to add generateHistoricalSeries
engine_path = base_path + "financialEngine.js"
with open(engine_path, "r", encoding="utf-8") as f:
    engine = f.read()

# Replace getHistoricalFinancials with the new generateHistoricalSeries
old_hist = """  // Historical Data Generator for Charts
  function getHistoricalFinancials(months = 6) {
    const kpis = getFinancialKPIs();
    const history = [];
    
    const today = new Date();
    
    // Reverse engineer a growth curve from current KPIs
    let currentRev = kpis.mrr;
    let currentExp = kpis.expenses;

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      history.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.round(currentRev),
        expenses: Math.round(currentExp)
      });

      // Step back in time (simulate 10% monthly growth for revenue, 5% for expenses)
      currentRev = currentRev / 1.1;
      currentExp = currentExp / 1.05;
    }

    return history;
  }"""

new_hist = """  function getHistoricalFinancials(months = 6) {
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
    
    const kpis = getFinancialKPIs();
    let currentValue = 0;
    let trend = 1.0;
    let variance = 0;

    if (metricType.toLowerCase().includes('revenue')) { currentValue = kpis.totalRevenueYTD || (kpis.mrr * 12); trend = 1.08; variance = 5000; }
    else if (metricType.toLowerCase().includes('mrr')) { currentValue = kpis.mrr; trend = 1.05; variance = 1000; }
    else if (metricType.toLowerCase().includes('expenses')) { currentValue = kpis.expenses; trend = 1.03; variance = 2000; }
    else if (metricType.toLowerCase().includes('profit')) { currentValue = kpis.profit; trend = 1.1; variance = 3000; }
    else if (metricType.toLowerCase().includes('burn rate')) { currentValue = kpis.burnRate; trend = 0.98; variance = 500; }
    else if (metricType.toLowerCase().includes('investor')) { currentValue = 85; trend = 1.02; variance = 2; }
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
  }"""
engine = engine.replace(old_hist, new_hist)
# ensure exported
if "generateHistoricalSeries:" not in engine:
    engine = engine.replace("getHistoricalFinancials,", "getHistoricalFinancials,\n    generateHistoricalSeries,")
with open(engine_path, "w", encoding="utf-8") as f:
    f.write(engine)


# 2. Update financialCharts.js to handle types and destroy
charts_path = base_path + "financialCharts.js"
with open(charts_path, "r", encoding="utf-8") as f:
    charts = f.read()

render_mod_orig = """    function renderModalChart(canvasId, data, title) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        if (instances[canvasId]) {
            instances[canvasId].destroy();
        }

        const isDark = !['light'].includes(document.documentElement.getAttribute('data-theme'));
        const textColor = isDark ? '#94a3b8' : '#475569';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        // Simple line chart for modal
        instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month || d.date),
                datasets: [{
                    label: title,
                    data: data.map(d => d.value || d.revenue || 0),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        });
    }"""

render_mod_new = """    window.activeModalChart = null;

    function renderModalChart(canvasId, data, title) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        
        if (window.activeModalChart) {
            window.activeModalChart.destroy();
            window.activeModalChart = null;
        }

        if (!data || !data.labels || data.labels.length === 0) {
            return; // Handled by empty state in modal
        }

        const isDark = !['light'].includes(document.documentElement.getAttribute('data-theme'));
        const textColor = isDark ? '#94a3b8' : '#475569';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        let chartType = 'line';
        let bg = 'rgba(99,102,241,0.1)';
        let border = '#6366f1';
        let fill = true;
        let tension = 0.4;
        let isRadar = false;

        const t = title.toLowerCase();
        if (t.includes('revenue') || t.includes('mrr')) {
            chartType = 'line';
            border = '#10b981';
            bg = 'rgba(16,185,129,0.1)';
        } else if (t.includes('expenses')) {
            chartType = 'bar';
            border = '#ef4444';
            bg = 'rgba(239,68,68,0.7)';
            fill = false;
        } else if (t.includes('burn rate')) {
            chartType = 'line';
            border = '#f59e0b';
            bg = 'rgba(245,158,11,0.2)';
            fill = true;
        } else if (t.includes('profit')) {
            chartType = 'line';
            // Custom coloring for profit below
            fill = true;
        } else if (t.includes('investor')) {
            isRadar = true;
            chartType = 'radar';
            border = '#06b6d4';
            bg = 'rgba(6,182,212,0.2)';
        }

        const config = {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: title,
                    data: data.values,
                    borderColor: border,
                    backgroundColor: bg,
                    borderWidth: 2,
                    fill: fill,
                    tension: tension,
                    borderRadius: chartType === 'bar' ? 4 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800, easing: 'easeOutQuart' },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                }
            }
        };

        if (!isRadar) {
            config.options.scales = {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            };
            if (t.includes('profit')) {
               config.options.plugins.tooltip.callbacks = {
                   label: (ctx) => {
                       let val = ctx.raw;
                       return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
                   }
               };
            }
        } else {
             config.options.scales = {
                 r: { 
                     grid: { color: gridColor }, 
                     angleLines: { color: gridColor },
                     pointLabels: { color: textColor },
                     ticks: { display: false }
                 }
             };
        }

        window.activeModalChart = new Chart(ctx, config);
    }"""
charts = charts.replace(render_mod_orig, render_mod_new)
with open(charts_path, "w", encoding="utf-8") as f:
    f.write(charts)


# 3. Update financialModals.js
modals_path = base_path + "financialModals.js"
with open(modals_path, "r", encoding="utf-8") as f:
    modals = f.read()

modal_open_orig = """    function openKPIModal(title, currentValue, historyData) {
        const modal = document.getElementById('financialModal');
        if (!modal) return;
        
        document.getElementById('finModalTitle').textContent = title + ' Analysis';
        document.getElementById('finModalValue').textContent = '$' + currentValue.toLocaleString();
        
        // Render Chart
        if (window.FinancialCharts) {
            window.FinancialCharts.renderModalChart('finModalChart', historyData, title);
        }
        
        modal.classList.add('open');
    }"""

modal_open_new = """    function openKPIModal(title, metricType) {
        const modal = document.getElementById('financialModal');
        if (!modal) return;
        
        // Await data if not loaded (though assumed loaded)
        if (!window.PlatformEngine) return;
        
        const kpis = window.FinancialEngine.getFinancialKPIs();
        let currentValue = 0;
        if (metricType === 'totalRevenueYTD') currentValue = window.PlatformEngine.calculateTotalRevenue() || 0;
        else if (metricType === 'mrr') currentValue = kpis.mrr;
        else if (metricType === 'expenses') currentValue = kpis.expenses;
        else if (metricType === 'profit') currentValue = kpis.profit;
        else if (metricType === 'burnRate') currentValue = kpis.burnRate;
        else if (metricType === 'investor') currentValue = 85;

        document.getElementById('finModalTitle').textContent = title + ' Analysis';
        document.getElementById('finModalValue').textContent = (currentValue < 0 ? '-$' : '$') + Math.abs(currentValue).toLocaleString();
        
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
                        💡 AI Insight: ${title} has ${dir} by <strong>${perc}%</strong> over the historical period.
                    </div>
                 </div>
               `;
            }
        }
        
        modal.classList.add('open');
    }"""
modals = modals.replace(modal_open_orig, modal_open_new)
with open(modals_path, "w", encoding="utf-8") as f:
    f.write(modals)


# 4. Update financials.js to pass metricType correctly
fin_path = base_path + "financials.js"
with open(fin_path, "r", encoding="utf-8") as f:
    fin = f.read()

click_orig = """window.handleKpiClick = (title, metricId) => {
    if (typeof FinancialModals === 'undefined') return;
    
    // Fetch appropriate data for modal
    let val = 0;
    const kpis = window.FinancialEngine ? window.FinancialEngine.getFinancialKPIs() : null;
    if (kpis) {
        if (metricId === 'totalRevenueYTD') val = kpis.mrr * 12; // simulated YTD
        if (metricId === 'mrr') val = kpis.mrr;
        if (metricId === 'expenses') val = kpis.expenses;
        if (metricId === 'profit') val = kpis.profit;
        if (metricId === 'burnRate') val = kpis.burnRate;
    }
    
    const hist = window.FinancialEngine ? window.FinancialEngine.getHistoricalFinancials() : [];
    
    FinancialModals.openKPIModal(title, val, hist);
};"""

click_new = """window.handleKpiClick = (title, metricType) => {
    if (typeof FinancialModals === 'undefined') return;
    FinancialModals.openKPIModal(title, metricType);
};"""
fin = fin.replace(click_orig, click_new)

with open(fin_path, "w", encoding="utf-8") as f:
    f.write(fin)

print("Updated financial charts and modals logic.")
