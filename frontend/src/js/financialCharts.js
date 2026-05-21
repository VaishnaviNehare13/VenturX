/**
 * Financial Charts Module
 * Manages the rendering and lifecycle of all Chart.js instances on the Financials page.
 */

let financialChartInstances = {
 main: null,
 scenarios: null,
 expenseBreakdown: null,
 cashFlow: null,
 modalChart: null
};

function getChartColors() {
 return {
  text: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#e5e7eb',
  muted: getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim() || '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.1)',
  primary: '#6366f1',
  secondary: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
 };
}

function initFinancialsChart(historicalData) {
 const ctx = document.getElementById('financialsChart');
 if (!ctx || !window.Chart) return;
 if (financialChartInstances.main) financialChartInstances.main.destroy();
 
 const colors = getChartColors();
 
 financialChartInstances.main = new Chart(ctx, {
  type: 'bar',
  data: {
   labels: historicalData.map(d => d.month),
   datasets: [
    {
     label: 'Revenue',
     data: historicalData.map(d => d.revenue),
     backgroundColor: 'rgba(16, 185, 129, 0.8)',
     borderColor: '#10b981',
     borderWidth: 2,
     borderRadius: 4
    },
    {
     label: 'Expenses',
     data: historicalData.map(d => d.expenses),
     backgroundColor: 'rgba(239, 68, 68, 0.8)',
     borderColor: '#ef4444',
     borderWidth: 2,
     borderRadius: 4
    }
   ]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
    legend: { display: true, position: 'top', labels: { color: colors.text } },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#fff', bodyColor: '#e5e7eb',
     borderColor: 'rgba(99, 102, 241, 0.5)', borderWidth: 1, padding: 12,
     callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toLocaleString('en-IN') }
    }
   },
   scales: {
    y: {
     beginAtZero: true, grid: { color: colors.grid },
     ticks: { color: colors.muted, callback: (v) => '₹' + (v/1000) + 'K' }
    },
    x: { grid: { display: false }, ticks: { color: colors.muted } }
   }
  }
 });
}

function initScenariosChart(scenarios) {
 const ctx = document.getElementById('scenariosChart');
 if (!ctx || !window.Chart) return;
 if (financialChartInstances.scenarios) financialChartInstances.scenarios.destroy();
 
 const colors = getChartColors();
 
 financialChartInstances.scenarios = new Chart(ctx, {
  type: 'bar',
  data: {
   labels: scenarios.map(s => s.label),
   datasets: [{
    label: 'Predicted Profit',
    data: scenarios.map(s => s.predicted_profit),
    backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(34, 211, 238, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(139, 92, 246, 0.8)'],
    borderColor: ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#8b5cf6'],
    borderWidth: 2, borderRadius: 4
   }]
  },
  options: {
   responsive: true, maintainAspectRatio: false,
   plugins: {
    legend: { display: false },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#fff', bodyColor: '#e5e7eb',
     borderColor: 'rgba(99, 102, 241, 0.5)', borderWidth: 1, padding: 12,
     callbacks: {
      label: function(c) {
       const s = scenarios[c.dataIndex];
       return [
        `Profit: ₹${Math.round(s.predicted_profit).toLocaleString('en-IN')}`,
        `R&D: ₹${s.rd?.toLocaleString('en-IN') || s.rd_spend?.toLocaleString('en-IN')}`,
        `Marketing: ₹${s.mkt?.toLocaleString('en-IN') || s.marketing_spend?.toLocaleString('en-IN')}`
       ];
      }
     }
    }
   },
   scales: {
    y: { beginAtZero: true, grid: { color: colors.grid }, ticks: { color: colors.muted, callback: (v) => '₹' + (v/1000) + 'K' } },
    x: { grid: { display: false }, ticks: { color: colors.muted } }
   }
  }
 });
}

function initExpenseBreakdownChart(expenses) {
  const ctx = document.getElementById('expenseBreakdownChart');
  if (!ctx || !window.Chart) return;
  if (financialChartInstances.expenseBreakdown) financialChartInstances.expenseBreakdown.destroy();

  const colors = getChartColors();
  // Use the dynamic expense data
  const mkt = expenses.totalMarketingSpend / 12 || 10000;
  const ops = expenses.baseOps || 15000;
  const salaries = expenses.baseSalaries || 25000;
  const ai = 5000; // Mock SaaS API cost
  const infra = 8000; 

  financialChartInstances.expenseBreakdown = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Marketing', 'Salaries', 'Operations', 'AI Services', 'Infrastructure'],
      datasets: [{
        data: [mkt, salaries, ops, ai, infra],
        backgroundColor: [colors.primary, colors.info, colors.secondary, colors.success, colors.warning],
        borderWidth: 0, hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: colors.text, padding: 16 } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#fff', bodyColor: '#e5e7eb',
          borderColor: 'rgba(99, 102, 241, 0.5)', borderWidth: 1, padding: 10,
          callbacks: { label: (c) => c.label + ': $' + c.parsed.toLocaleString('en-IN') }
        }
      }
    }
  });
}

function renderModalChart(ctxId, data, title) {
  const ctx = document.getElementById(ctxId);
  if (!ctx || !window.Chart) return;
  
  // Destroy previous instance
  if (financialChartInstances.modalChart) {
    financialChartInstances.modalChart.destroy();
    financialChartInstances.modalChart = null;
  }
  
  // Validate data structure
  if (!data || !Array.isArray(data.values) || data.values.length === 0) {
    console.warn("Invalid or empty data passed to renderModalChart");
    return; // Empty state is handled by the modal UI
  }

  const colors = getChartColors();
  const t = title.toLowerCase();
  
  let chartType = 'line';
  let bg = 'rgba(99, 102, 241, 0.1)';
  let border = colors.primary;
  let fill = true;
  let tension = 0.4;
  let isRadar = false;

  if (t.includes('revenue') || t.includes('mrr')) {
    chartType = 'line';
    border = colors.success;
    bg = 'rgba(16, 185, 129, 0.1)';
  } else if (t.includes('expenses')) {
    chartType = 'bar';
    border = colors.danger;
    bg = 'rgba(239, 68, 68, 0.7)';
    fill = false;
  } else if (t.includes('burn rate')) {
    chartType = 'line';
    border = colors.warning;
    bg = 'rgba(245, 158, 11, 0.2)';
    fill = true;
  } else if (t.includes('profit')) {
    chartType = 'line';
    border = colors.secondary;
    bg = 'rgba(236, 72, 153, 0.1)';
    fill = true;
  } else if (t.includes('investor')) {
    isRadar = true;
    chartType = 'radar';
    border = colors.info;
    bg = 'rgba(6, 182, 212, 0.2)';
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
        borderWidth: 3,
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
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (c) => {
              let val = c.raw;
              if (isRadar) return `${c.dataset.label}: ${val}`;
              return val < 0 ? `-₹${Math.abs(val).toLocaleString('en-IN')}` : `₹${val.toLocaleString('en-IN')}`;
            }
          }
        }
      }
    }
  };

  if (!isRadar) {
    config.options.scales = {
      y: { grid: { color: colors.grid }, ticks: { color: colors.muted } },
      x: { grid: { display: false }, ticks: { color: colors.muted } }
    };
  } else {
    config.options.scales = {
      r: {
        grid: { color: colors.grid },
        angleLines: { color: colors.grid },
        pointLabels: { color: colors.text, font: { size: 12 } },
        ticks: { display: false }
      }
    };
  }

  financialChartInstances.modalChart = new Chart(ctx, config);
}

function destroyAllFinancialCharts() {
 Object.values(financialChartInstances).forEach(chart => {
  if (chart) chart.destroy();
 });
 financialChartInstances = { main: null, scenarios: null, expenseBreakdown: null, cashFlow: null, modalChart: null };
}

window.FinancialCharts = {
 initFinancialsChart,
 initScenariosChart,
 initExpenseBreakdownChart,
 renderModalChart,
 destroyAllFinancialCharts,
 getChartColors
};
