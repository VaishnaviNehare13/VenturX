/**
 * Analytics Module - UI Layer
 * Initializes charts and dynamically updates the Analytics BI dashboard using AnalyticsEngine.
 */


let globalFilterDays = 30;

window.formatTime = function(value) {
    if (!value) return "N/A";

    try {
        if (typeof value === "string" && !value.includes("-")) {
            // Check if it's just seconds (e.g. 145s) for legacy top pages
            if (!isNaN(value)) {
               const secs = parseInt(value);
               const m = Math.floor(secs / 60);
               const s = secs % 60;
               return `${m}m ${s}s`;
            }
            return value;
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
           // Fallback to seconds format if it was a number
           if (typeof value === "number") {
             const m = Math.floor(value / 60);
             const s = value % 60;
             return `${m}m ${s}s`;
           }
           return "N/A";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    } catch (e) {
        return "N/A";
    }
}

window.applyGlobalFilter = function() {
  const val = document.getElementById('globalDateFilter').value;
  globalFilterDays = parseInt(val);
  // Refresh UI
  updateAnalyticsKPIs();
  initUserGrowthChart();
  initSourcesChart();
};

let analyticsCharts = {
 health: null,
 userGrowth: null,
 platformUsage: null,
 forecast: null,
 sources: null
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
  info: '#06b6d4'
 };

 if (activityFeedInterval) { clearInterval(activityFeedInterval); activityFeedInterval = null; }
 if (kpiDetailChartInstance) { kpiDetailChartInstance.destroy(); kpiDetailChartInstance = null; }

}

async function updateAnalyticsKPIs() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/analytics/overview');
        if (!response.ok) { throw new Error("API failed"); }
        const json = await response.json();
        const data = json.success ? json.data : {
            total_users: 0,
            startup_growth: 0,
            ai_tool_usage: 0,
            customer_retention: 0,
            campaign_reach: 0,
            revenue_growth: 0
        };

        const scale = globalFilterDays / 30;

        const usersEl = document.getElementById('kpiTotalUsers');
        if (usersEl) usersEl.textContent = Math.round((data.total_users || 0) * scale).toLocaleString('en-IN');
        
        const growthEl = document.getElementById('kpiStartupGrowth');
        if (growthEl) growthEl.textContent = Math.round((data.startup_growth || 0) * scale).toLocaleString('en-IN');
        
        const usageEl = document.getElementById('kpiAiUsage');
        if (usageEl) usageEl.textContent = Math.round((data.ai_tool_usage || 0) * scale).toLocaleString('en-IN');

        const retentionEl = document.getElementById('kpiRetention');
        if (retentionEl) retentionEl.textContent = data.customer_retention ? (data.customer_retention).toFixed(1) + '%' : '0%';

        const reachEl = document.getElementById('kpiReach');
        if (reachEl) reachEl.textContent = Math.round((data.campaign_reach || 0) * scale).toLocaleString('en-IN');

        const revEl = document.getElementById('kpiRevenue');
        if (revEl) revEl.textContent = '₹' + Math.round((data.revenue_growth || 0) * scale).toLocaleString('en-IN');

    } catch (error) {
        console.error("Failed to load analytics overview:", error);
        
        const usersEl = document.getElementById('kpiTotalUsers');
        if (usersEl) usersEl.textContent = '0';
        const growthEl = document.getElementById('kpiStartupGrowth');
        if (growthEl) growthEl.textContent = '0';
        const usageEl = document.getElementById('kpiAiUsage');
        if (usageEl) usageEl.textContent = '0';
        const retentionEl = document.getElementById('kpiRetention');
        if (retentionEl) retentionEl.textContent = '0%';
        const reachEl = document.getElementById('kpiReach');
        if (reachEl) reachEl.textContent = '0';
        const revEl = document.getElementById('kpiRevenue');
        if (revEl) revEl.textContent = '₹0';
    }
}

function renderAIInsights() {
 const insights = AnalyticsEngine.generateAIInsights();
 const list = document.getElementById('aiInsightsList');
 if (!list) return;
 
 list.innerHTML = (insights || []).map(i => `
  <li class="insight-item" style="border-left-color: ${i.color}">
   <div class="insight-icon">${i.icon}</div>
   <div>
    <div class="insight-text interactive-item" onclick="openInsightModal('${i.text.replace(/'/g, "\'")}', '${i.icon}', ${i.confidence || 85})">${i.text}</div>
    <span class="insight-time">${i.time}</span>
   </div>
  </li>
 `).join('');
}

function initHealthScoreChart() {
 const ctx = document.getElementById('healthScoreChart');
 if (!ctx || !window.Chart) return;
 if (analyticsCharts.health) analyticsCharts.health.destroy();

 const score = AnalyticsEngine.calculateHealthScore();
 const scoreTextEl = document.getElementById('healthScoreText');
 const scoreLabelEl = document.getElementById('healthScoreLabel');
 
 if (scoreTextEl) scoreTextEl.textContent = score;
 if (scoreLabelEl) {
  if (score >= 90) scoreLabelEl.textContent = 'Excellent';
  else if (score >= 70) scoreLabelEl.textContent = 'Good';
  else if (score >= 50) scoreLabelEl.textContent = 'Fair';
  else scoreLabelEl.textContent = 'Needs Attention';
 }

 let color = '#10b981';
 if (score < 50) color = '#ef4444';
 else if (score < 70) color = '#f59e0b';
 else if (score < 90) color = '#3b82f6';

 analyticsCharts.health = new Chart(ctx, {
  type: 'doughnut',
  data: {
   datasets: [{
    data: [score, 100 - score],
    backgroundColor: [color, 'rgba(255,255,255,0.05)'],
    borderWidth: 0,
    circumference: 270,
    rotation: 225,
    cutout: '85%',
    borderRadius: [10, 0]
   }]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   plugins: { tooltip: { enabled: false }, legend: { display: false } },
   animation: { animateScale: true, animateRotate: true }
  }
 });
}

 function initUserGrowthChart() {
  const ctx = document.getElementById('userGrowthChart');
  if (!ctx || !window.Chart) return;
  if (analyticsCharts.userGrowth) analyticsCharts.userGrowth.destroy();

  const colors = getChartColors();
  
  // Use real Mongo data
  const dash = window.LiveMongoDashboard || {};
  let activeData = dash.growth_chart || [25000, 32000, 48000, 65000, 89000, 124000];
  let newData = dash.client_growth || [120, 180, 310, 450, 780, 1240];

 analyticsCharts.userGrowth = new Chart(ctx, {
  type: 'bar',
  data: {
   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
   datasets: [
    {
     type: 'line',
     label: 'Active Users',
     data: activeData,
     borderColor: colors.secondary,
     backgroundColor: 'transparent',
     borderWidth: 3,
     tension: 0.4,
     yAxisID: 'y1'
    },
    {
     type: 'bar',
     label: 'New Startups',
     data: newData,
     backgroundColor: 'rgba(99, 102, 241, 0.8)',
     borderRadius: 4,
     yAxisID: 'y'
    }
   ]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   interaction: { mode: 'index', intersect: false },
   plugins: {
    legend: { labels: { color: colors.text, font: { size: 12 } } }
   },
   scales: {
    x: { grid: { display: false }, ticks: { color: colors.muted } },
    y: { 
     type: 'linear', display: true, position: 'left', 
     grid: { color: colors.grid }, ticks: { color: colors.muted }
    },
    y1: { 
     type: 'linear', display: true, position: 'right', 
     grid: { drawOnChartArea: false }, ticks: { color: colors.muted }
    }
   }
  }
 });
}

 function initPlatformUsageChart() {
  const ctx = document.getElementById('platformUsageChart');
  if (!ctx || !window.Chart) return;
  if (analyticsCharts.platformUsage) analyticsCharts.platformUsage.destroy();

  const colors = getChartColors();
  
  // Dynamically pull data usage from Mongo payload
  const payload = window.LiveMongoPayload || {};
  const crmCount = (payload.crm || []).length * 10;
  const mktCount = (payload.campaigns || []).length * 15;
  const contentCount = (payload.activity_logs || []).filter(a => a.type === 'content').length * 12;
  const forecastCount = (payload.forecasts || []).length * 10;
  
  const cScore = Math.min(100, crmCount || 85);
  const mScore = Math.min(100, mktCount || 65);
  const contScore = Math.min(100, contentCount || 58);
  const fScore = Math.min(100, forecastCount || 72);
  const bScore = 94;

 analyticsCharts.platformUsage = new Chart(ctx, {
  type: 'radar',
  data: {
   labels: ['CRM', 'Forecasting', 'Marketing', 'Branding Studio', 'Content Hub'],
   datasets: [{
    label: 'Current Quarter',
    data: [cScore, fScore, mScore, bScore, contScore],
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: colors.primary,
    pointBackgroundColor: colors.primary,
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: colors.primary,
    borderWidth: 2
   }, {
    label: 'Previous Quarter',
    data: [65, 55, 48, 42, 35],
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: colors.secondary,
    borderDash: [5, 5],
    pointRadius: 0,
    borderWidth: 2
   }]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   onClick: (e, activeEls) => {
    if((activeEls || []).length > 0) {
      const index = activeEls[0].index;
      const label = analyticsCharts.platformUsage.data.labels[index];
      const routeMap = { 'CRM': '#/crm', 'Forecasting': '#/forecasting', 'Marketing': '#/marketing', 'Branding Studio': '#/branding', 'Content Hub': '#/content' };
      if (routeMap[label]) window.Router.navigate(routeMap[label]);
    }
   },
   plugins: { legend: { position: 'bottom', labels: { color: colors.text } } },
   scales: {
    r: {
     angleLines: { color: colors.grid },
     grid: { color: colors.grid },
     pointLabels: { color: colors.muted, font: { size: 11 } },
     ticks: { display: false, min: 0, max: 100 }
    }
   }
  }
 });
}

 function initSourcesChart() {
  const ctx = document.getElementById('sourcesChart');
  if (!ctx || !window.Chart) return;
  if (analyticsCharts.sources) analyticsCharts.sources.destroy();

  const colors = getChartColors();
  
  // Use Live Mongo Dashboard traffic sources
  const dash = window.LiveMongoDashboard || {};
  const t = dash.traffic_sources || { organic: 38, social: 22, direct: 18, referral: 7, paid: 15 };
  
  let organic = t.organic || 38;
  let social = t.social || 22;
  let direct = t.direct || 18;
  let referral = t.referral || 7;
  let paid = t.paid || 15;
  
  const total = organic + social + direct + referral + paid;
  organic = Math.round((organic/total)*100);
  social = Math.round((social/total)*100);
  direct = Math.round((direct/total)*100);
  referral = Math.round((referral/total)*100);
  paid = Math.round((paid/total)*100);

 analyticsCharts.sources = new Chart(ctx, {
  type: 'doughnut',
  data: {
   labels: ['Organic Search', 'Social Media', 'Direct', 'Referral', 'Paid Campaigns'],
   datasets: [{
    data: [organic, social, direct, referral, paid],
    backgroundColor: [colors.primary, colors.info, colors.secondary, colors.success, colors.warning],
    borderWidth: 0, hoverOffset: 10
   }]
  },
  options: {
   responsive: true, maintainAspectRatio: false,
   onClick: (e, activeEls) => {
    if((activeEls || []).length > 0) {
      const index = activeEls[0].index;
      const label = analyticsCharts.sources.data.labels[index];
      if (window.filterTopPagesBySource) window.filterTopPagesBySource(label);
    }
   },
   plugins: {
    legend: { position: 'bottom', labels: { color: colors.text, padding: 16, font: { size: 11 } } },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#fff', bodyColor: '#e5e7eb',
     borderColor: 'rgba(99, 102, 241, 0.5)', borderWidth: 1, padding: 10,
     callbacks: { label: (c) => c.label + ': ' + c.parsed + '%' }
    }
   }
  }
 });
}

 async function loadAndInitForecast() {
  const periods = parseInt(document.getElementById('forecastPeriod')?.value || '90');
  
  const payload = window.LiveMongoPayload || {};
  const forecasts = payload.forecasts || [];
  
  let data = null;
  if ((forecasts || []).length > 0 && forecasts[0].forecast_data) {
     data = { forecast: forecasts[0].forecast_data };
  } else {
     data = await AnalyticsEngine.getForecastingData();
     if (!data || data.length === 0) {
       data = generateFallbackForecast(periods);
     }
  }

 const forecastData = data.forecast || [];
 const total = (forecastData || []).reduce((sum, d) => sum + d.predicted, 0);
 
 const revEl = document.getElementById('kpiRevenue');
 if (revEl) revEl.textContent = '₹' + (total / 1000000).toFixed(2) + 'M';

 const fTotal = document.getElementById('forecastTotal');
 if (fTotal) fTotal.textContent = '₹' + (total / 1000000).toFixed(2) + 'M';
 
 const avg = document.getElementById('avgDailySales');
 if (avg) avg.textContent = '₹' + Math.round(total / periods).toLocaleString('en-IN');

 const ctx = document.getElementById('forecastChart');
 if (!ctx || !window.Chart || (forecastData || []).length === 0) return;
 if (analyticsCharts.forecast) analyticsCharts.forecast.destroy();

 const colors = getChartColors();
 const sampleIndices = [];
 for (let i = 0; i < (forecastData || []).length; i += Math.ceil((forecastData || []).length / 20)) {
  (sampleIndices || []).push(i);
 }

 analyticsCharts.forecast = new Chart(ctx, {
  type: 'line',
  data: {
   labels: (sampleIndices || []).map(i => new Date(forecastData[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
   datasets: [
    {
     label: 'Predicted Sales',
     data: (sampleIndices || []).map(i => forecastData[i].predicted),
     borderColor: colors.primary,
     backgroundColor: 'rgba(99, 102, 241, 0.1)',
     borderWidth: 3, fill: true, tension: 0.4,
     pointRadius: 4, pointBackgroundColor: colors.primary, pointBorderColor: '#fff'
    },
    {
     label: 'Upper Bound', data: (sampleIndices || []).map(i => forecastData[i].upper),
     borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 2, borderDash: [5, 5], fill: false, pointRadius: 0, tension: 0.4
    },
    {
     label: 'Lower Bound', data: (sampleIndices || []).map(i => forecastData[i].lower),
     borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 2, borderDash: [5, 5], fill: '-1',
     backgroundColor: 'rgba(99, 102, 241, 0.05)', pointRadius: 0, tension: 0.4
    }
   ]
  },
  options: {
   responsive: true, maintainAspectRatio: false,
   onClick: (e, activeEls) => {
    if((activeEls || []).length > 0) {
      const index = activeEls[0].index;
      const label = analyticsCharts.sources.data.labels[index];
      if (window.filterTopPagesBySource) window.filterTopPagesBySource(label);
    }
   },
   plugins: { legend: { display: false }, tooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)', titleColor: '#fff', bodyColor: '#e5e7eb',
    borderColor: 'rgba(99, 102, 241, 0.5)', borderWidth: 1, padding: 12,
    callbacks: { label: (c) => c.dataset.label + ': $' + c.parsed.y.toLocaleString('en-IN') }
   }},
   scales: {
    y: { grid: { color: colors.grid }, ticks: { color: colors.muted, callback: (v) => '₹' + (v / 1000000).toFixed(1) + 'M' } },
    x: { grid: { display: false }, ticks: { color: colors.muted } }
   },
   interaction: { intersect: false, mode: 'index' }
  }
 });
}

function generateFallbackForecast(periods) {
 const forecast = [];
 const base = 6800000;
 const trend = 15000;
 const today = new Date();
 
 for (let i = 0; i < periods; i++) {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  const noise = (Math.random() - 0.5) * 160000;
  const val = base + trend * i + noise;
  (forecast || []).push({
   date: d.toISOString().split('T')[0],
   predicted: Math.round(val * 100) / 100,
   lower: Math.round(val * 0.96 * 100) / 100,
   upper: Math.round(val * 1.04 * 100) / 100
  });
 }
 return { forecast, model: 'LinearTrend-Fallback', periods };
}

window.updateForecastAnalytics = function() {
 loadAndInitForecast();

 renderTopPages();
 initActivityFeed();
 
 // Setup Table Search
 const searchInput = document.getElementById('topPagesSearch');
 if (searchInput) {
   searchInput.addEventListener('input', (e) => {
     const val = e.target.value.toLowerCase();
     const filtered = (topPagesData || []).filter(row => row.path.toLowerCase().includes(val));
     renderTopPages(filtered);
   });
 }
}

function handleAnalyticsThemeChange() {
 const colors = getChartColors();
 
 const chartsToUpdate = [
  { chart: analyticsCharts.forecast, hasScales: true },
  { chart: analyticsCharts.userGrowth, hasScales: true },
  { chart: analyticsCharts.platformUsage, hasScales: false, isRadar: true },
  { chart: analyticsCharts.sources, hasScales: false }
 ];
 
 (chartsToUpdate || []).forEach(({ chart, hasScales, isRadar }) => {
  if (chart) {
   if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
    chart.options.plugins.legend.labels.color = colors.text;
   }
   if (hasScales) {
    if (chart.options.scales.x) chart.options.scales.x.ticks.color = colors.muted;
    if (chart.options.scales.y) {
     chart.options.scales.y.ticks.color = colors.muted;
     chart.options.scales.y.grid.color = colors.grid;
    }
    if (chart.options.scales.y1) chart.options.scales.y1.ticks.color = colors.muted;
   }
   if (isRadar && chart.options.scales.r) {
    chart.options.scales.r.angleLines.color = colors.grid;
    chart.options.scales.r.grid.color = colors.grid;
    chart.options.scales.r.pointLabels.color = colors.muted;
   }
   chart.update();
  }
 });
}


// --- INTERACTIVITY LOGIC ---

let kpiDetailChartInstance = null;

window.openKpiModal = function(title) {
  const modal = document.getElementById('kpiDetailsModal');
  if (!modal) return;
  
  document.getElementById('kpiModalTitle').textContent = title;
  
  // Generate historical data
  const histData = AnalyticsEngine.getHistoricalData(title, globalFilterDays);
  const currentValue = histData[(histData || []).length - 1].value;
  const previousValue = histData[0].value;
  const growth = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  
  document.getElementById('kpiModalValue').textContent = currentValue.toLocaleString('en-IN') + (title.includes('Retention') ? '%' : '');
  const growthEl = document.getElementById('kpiModalGrowth');
  growthEl.textContent = (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
  growthEl.className = growth >= 0 ? 'trend-up' : 'trend-down';
  
  const ctx = document.getElementById('kpiDetailChart');
  if (kpiDetailChartInstance) kpiDetailChartInstance.destroy();
  
  const colors = getChartColors();
  kpiDetailChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: (histData || []).map(d => d.date),
      datasets: [{
        label: title,
        data: (histData || []).map(d => d.value),
        borderColor: colors.primary,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: colors.grid }, ticks: { color: colors.muted } },
        x: { grid: { display: false }, ticks: { color: colors.muted } }
      }
    }
  });
  
  modal.classList.add('open');
};

window.openInsightModal = function(text, icon, confidence) {
  const modal = document.getElementById('insightDetailsModal');
  if (!modal) return;
  
  document.getElementById('insightModalIcon').textContent = icon;
  document.getElementById('insightModalText').innerHTML = text;
  document.getElementById('insightModalConfidence').textContent = confidence + '%';
  
  const bar = document.getElementById('insightModalConfidenceBar');
  bar.style.width = confidence + '%';
  bar.style.background = confidence > 85 ? '#10b981' : (confidence > 70 ? '#f59e0b' : '#ef4444');
  
  modal.classList.add('open');
};

window.openHealthModal = function() {
  const modal = document.getElementById('healthScoreModal');
  if (!modal) return;
  
  const grid = document.getElementById('healthBreakdownGrid');
  const breakdown = AnalyticsEngine.getHealthScoreBreakdown();
  
  grid.innerHTML = (breakdown || []).map(item => {
    let color = item.score > 85 ? '#10b981' : (item.score > 60 ? '#f59e0b' : '#ef4444');
    return `
      <div class="radial-item">
        <div class="radial-circle" style="--fill-color: ${color}; --perc: ${item.score}%">
          <span>${item.score}</span>
        </div>
        <div class="muted" style="font-size: 12px; font-weight: 600; text-transform: uppercase;">${item.label}</div>
      </div>
    `;
  }).join('');
  
  modal.classList.add('open');
};

window.closeBiModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
};

 // --- TOP PAGES TABLE LOGIC ---
 window.renderTopPages = function() {
   const dash = window.LiveMongoDashboard || {};
   const dataToRender = dash.top_performing_pages || [
     { path: '/', views: 45020, bounce: 32, time: 145, conv: 4.2 },
     { path: '/pricing', views: 28400, bounce: 45, time: 90, conv: 8.5 },
     { path: '/blog/ai-startups', views: 19200, bounce: 65, time: 210, conv: 1.2 },
     { path: '/features/branding', views: 15800, bounce: 28, time: 180, conv: 6.8 },
     { path: '/signup', views: 12400, bounce: 20, time: 300, conv: 22.4 }
   ];
   
   const tbody = document.getElementById('topPagesTable');
   if (!tbody) return;
   
   tbody.innerHTML = (dataToRender || []).map(row => `
    <tr class="interactive-row" onclick="window.Router.navigate('#/segmentation')">
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #f8fafc; font-weight: 500;">${row.path}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${row.views.toLocaleString('en-IN')}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${row.bounce}%</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${formatTime(row.time)}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #10b981; font-weight: 600;">${row.conv}%</td>
    </tr>
  `).join('');
};

 window.sortTopPages = function(col) {
   const dash = window.LiveMongoDashboard || {};
   if (!dash.top_performing_pages) return;
   dash.top_performing_pages.sort((a, b) => b.views - a.views);
   renderTopPages();
 };

 window.filterTopPagesBySource = function(source) {
   const status = document.getElementById('tableFilterStatus');
   if (status) {
     status.style.display = 'inline-block';
     status.textContent = 'Source: ' + source;
   }
   renderTopPages();
 };

// --- LIVE ACTIVITY FEED ---
let activityFeedInterval = null;
const activityEvents = [
  { icon: '<i data-lucide="zap" class="icon-sm text-amber-500"></i>', msg: 'New startup <strong>TechVision AI</strong> registered' },
  { icon: '<i data-lucide="palette" class="icon-sm text-purple-500"></i>', msg: 'Brand kit generated for <strong>Nexus Flow</strong>' },
  { icon: '<i data-lucide="megaphone" class="icon-sm text-blue-500"></i>', msg: 'Campaign <em>Q3 Launch</em> went live' },
  { icon: '<i data-lucide="bot" class="icon-sm text-purple-500"></i>', msg: 'Sales forecast model automatically retrained' },
  { icon: '<i data-lucide="users" class="icon-sm text-blue-500"></i>', msg: 'CRM added 15 new enterprise leads' },
  { icon: '', msg: '<strong>DataSync</strong> upgraded to Pro Plan' },
  { icon: '', msg: 'AI Blog Writer drafted 3 new SEO posts' }
];

 function initActivityFeed() {
   const feed = document.getElementById('liveActivityFeed');
   if (!feed) return;
   
   const refreshFeed = () => {
     const payload = window.LiveMongoPayload || {};
     let logs = payload.activity_logs || [];
     
     // Fallback if Mongo payload is completely empty (no activity)
     if ((logs || []).length === 0) {
       feed.innerHTML = '<div class="muted" style="font-size: 13px; text-align: center; padding: 20px;">No platform activity yet.</div>';
       return;
     }
     
     // Limit to 8
     const notifications = logs.slice(0, 8);
    
    if ((notifications || []).length === 0) {
      feed.innerHTML = '<div class="muted" style="font-size: 13px; text-align: center; padding: 20px;">No platform activity yet.</div>';
      return;
    }

    feed.innerHTML = (notifications || []).map(n => `
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
  if (activityFeedInterval) clearInterval(activityFeedInterval);
  activityFeedInterval = setInterval(refreshFeed, 3000);
  window.addEventListener('platform:data-updated', refreshFeed);
}

 window.initAnalyticsPage = function() {
  console.log("LIVE MONGO CHART DATA:", window.LiveMongoPayload);
  
  let chartData = window.LiveMongoPayload?.charts || window.LiveMongoPayload?.analytics || window.LiveMongoPayload?.metrics || [];
  if (!Array.isArray(chartData)) {
      chartData = [];
  }
  
  updateAnalyticsKPIs();
  renderAIInsights();
 
 initHealthScoreChart();
 initUserGrowthChart();
 initPlatformUsageChart();
 initSourcesChart();
 loadAndInitForecast();

 renderTopPages();
 initActivityFeed();
 
 // Setup Table Search
 const searchInput = document.getElementById('topPagesSearch');
 if (searchInput) {
   searchInput.addEventListener('input', (e) => {
     const val = e.target.value.toLowerCase();
     const filtered = (topPagesData || []).filter(row => row.path.toLowerCase().includes(val));
     renderTopPages(filtered);
   });
 }

 document.removeEventListener('theme:changed', handleAnalyticsThemeChange);
 document.addEventListener('theme:changed', handleAnalyticsThemeChange);
};

window.destroyAnalyticsCharts = function() {
 Object.values(analyticsCharts).forEach(chart => {
  if (chart) chart.destroy();
 });
 analyticsCharts = {
  health: null, userGrowth: null, platformUsage: null, forecast: null, sources: null
 };

 if (activityFeedInterval) { clearInterval(activityFeedInterval); activityFeedInterval = null; }
 if (kpiDetailChartInstance) { kpiDetailChartInstance.destroy(); kpiDetailChartInstance = null; }

};

function showAnalyticsEmptyState() {
  const chartContainer = document.getElementById('trafficChart');
  if (chartContainer && chartContainer.parentElement) {
    if (!document.getElementById('anEmptyState')) {
      const emptyEl = document.createElement('div');
      emptyEl.id = 'anEmptyState';
      emptyEl.style.position = 'absolute';
      emptyEl.style.inset = '0';
      emptyEl.style.background = 'rgba(15, 23, 42, 0.8)';
      emptyEl.style.backdropFilter = 'blur(4px)';
      emptyEl.style.display = 'flex';
      emptyEl.style.flexDirection = 'column';
      emptyEl.style.alignItems = 'center';
      emptyEl.style.justifyContent = 'center';
      emptyEl.style.zIndex = '10';
      emptyEl.style.borderRadius = '8px';
      emptyEl.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 12px;"><i data-lucide="trending-up" class="icon-sm text-green-500"></i></div>
        <h3 style="margin-bottom: 8px;">No Analytics Data</h3>
        <p class="muted" style="font-size: 13px; text-align: center;">Go to CRM or Marketing to generate ecosystem activity.</p>
        <div style="display:flex; gap:12px; margin-top: 16px;">
          <button class="btn-premium" onclick="window.Router.navigate('#/crm')">Go to CRM</button>
          <button class="btn-premium" onclick="window.Router.navigate('#/marketing')">Go to Marketing</button>
        </div>
      `;
      chartContainer.parentElement.appendChild(emptyEl);
    }
  }
}

function hideAnalyticsEmptyState() {
  const emptyEl = document.getElementById('anEmptyState');
  if (emptyEl) emptyEl.remove();
}
