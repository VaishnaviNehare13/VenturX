import sys
import re

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/analytics.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Global Filter Variable and Function
global_filter_code = """
let globalFilterDays = 30;

window.applyGlobalFilter = function() {
    const val = document.getElementById('globalDateFilter').value;
    globalFilterDays = parseInt(val);
    // Refresh UI
    updateAnalyticsKPIs();
    initUserGrowthChart();
    initSourcesChart();
};
"""
content = content.replace("let analyticsCharts = {", global_filter_code + "\nlet analyticsCharts = {")

# Update updateAnalyticsKPIs to use globalFilterDays scaling
kpi_replace_orig = """  // Total Users
  const usersEl = document.getElementById('kpiTotalUsers');
  if (usersEl) usersEl.textContent = crm.totalUsers > 0 ? crm.totalUsers.toLocaleString() : '0';
  
  // Startup Growth (Assuming CRM users are startups for this platform context)
  const growthEl = document.getElementById('kpiStartupGrowth');
  if (growthEl) growthEl.textContent = crm.activeUsers.toLocaleString();
  
  // AI Usage (Mocking based on combined activity)
  const usageEl = document.getElementById('kpiAiUsage');
  if (usageEl) {
    const totalAiActions = (crm.data.reduce((sum, c) => sum + (c.forecastsCreated||0) + (c.campaignsCreated||0), 0)) || 24;
    usageEl.textContent = totalAiActions.toLocaleString();
  }

  // Retention
  const retentionEl = document.getElementById('kpiRetention');
  if (retentionEl) retentionEl.textContent = crm.retention ? crm.retention.toFixed(1) + '%' : '0%';

  // Campaign Reach
  const reachEl = document.getElementById('kpiReach');
  if (reachEl) reachEl.textContent = mkt.reach > 0 ? mkt.reach.toLocaleString() : '0';"""
kpi_replace_new = """  const scale = globalFilterDays / 30;
  
  // Total Users
  const usersEl = document.getElementById('kpiTotalUsers');
  if (usersEl) usersEl.textContent = crm.totalUsers > 0 ? Math.round(crm.totalUsers * scale).toLocaleString() : '0';
  
  // Startup Growth
  const growthEl = document.getElementById('kpiStartupGrowth');
  if (growthEl) growthEl.textContent = Math.round(crm.activeUsers * scale).toLocaleString();
  
  // AI Usage
  const usageEl = document.getElementById('kpiAiUsage');
  if (usageEl) {
    const totalAiActions = (crm.data.reduce((sum, c) => sum + (c.forecastsCreated||0) + (c.campaignsCreated||0), 0)) || 24;
    usageEl.textContent = Math.round(totalAiActions * scale).toLocaleString();
  }

  // Retention (doesn't scale linearly, just shifts slightly)
  const retentionEl = document.getElementById('kpiRetention');
  if (retentionEl) retentionEl.textContent = crm.retention ? Math.min(100, (crm.retention + (scale > 1 ? -1.2 : 0.5))).toFixed(1) + '%' : '0%';

  // Campaign Reach
  const reachEl = document.getElementById('kpiReach');
  if (reachEl) reachEl.textContent = mkt.reach > 0 ? Math.round(mkt.reach * scale).toLocaleString() : '0';"""
content = content.replace(kpi_replace_orig, kpi_replace_new)

# Add Insight click handler
insight_render_orig = """        <div class="insight-text">${i.text}</div>"""
insight_render_new = """        <div class="insight-text interactive-item" onclick="openInsightModal('${i.text.replace(/'/g, "\\'")}', '${i.icon}', ${i.confidence || 85})">${i.text}</div>"""
content = content.replace(insight_render_orig, insight_render_new)

# Chart onClick events
# sourcesChart
sources_options_orig = """plugins: {"""
sources_options_new = """onClick: (e, activeEls) => {
        if(activeEls.length > 0) {
            const index = activeEls[0].index;
            const label = analyticsCharts.sources.data.labels[index];
            if (window.filterTopPagesBySource) window.filterTopPagesBySource(label);
        }
      },
      plugins: {"""
content = content.replace("options: {\n      responsive: true, maintainAspectRatio: false,\n      plugins: {", "options: {\n      responsive: true, maintainAspectRatio: false,\n      " + sources_options_new)

# platformUsageChart
platform_options_orig = """plugins: { legend: { position: 'bottom', labels: { color: colors.text } } },"""
platform_options_new = """onClick: (e, activeEls) => {
        if(activeEls.length > 0) {
           const index = activeEls[0].index;
           const label = analyticsCharts.platformUsage.data.labels[index];
           const routeMap = { 'CRM': '#/crm', 'Forecasting': '#/forecasting', 'Marketing': '#/marketing', 'Branding Studio': '#/branding', 'Content Hub': '#/content' };
           if (routeMap[label]) window.Router.navigate(routeMap[label]);
        }
      },
      plugins: { legend: { position: 'bottom', labels: { color: colors.text } } },"""
content = content.replace(platform_options_orig, platform_options_new)


# Modals, Table Logic, Live Feed Logic
interactivity_logic = """
// --- INTERACTIVITY LOGIC ---

let kpiDetailChartInstance = null;

window.openKpiModal = function(title) {
    const modal = document.getElementById('kpiDetailsModal');
    if (!modal) return;
    
    document.getElementById('kpiModalTitle').textContent = title;
    
    // Generate historical data
    const histData = AnalyticsEngine.getHistoricalData(title, globalFilterDays);
    const currentValue = histData[histData.length - 1].value;
    const previousValue = histData[0].value;
    const growth = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    document.getElementById('kpiModalValue').textContent = currentValue.toLocaleString() + (title.includes('Retention') ? '%' : '');
    const growthEl = document.getElementById('kpiModalGrowth');
    growthEl.textContent = (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
    growthEl.className = growth >= 0 ? 'trend-up' : 'trend-down';
    
    const ctx = document.getElementById('kpiDetailChart');
    if (kpiDetailChartInstance) kpiDetailChartInstance.destroy();
    
    const colors = getChartColors();
    kpiDetailChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: histData.map(d => d.date),
            datasets: [{
                label: title,
                data: histData.map(d => d.value),
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
    
    grid.innerHTML = breakdown.map(item => {
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
let topPagesData = [
    { path: '/', views: 45020, bounce: 32, time: 145, conv: 4.2 },
    { path: '/pricing', views: 28400, bounce: 45, time: 90, conv: 8.5 },
    { path: '/blog/ai-startups', views: 19200, bounce: 65, time: 210, conv: 1.2 },
    { path: '/features/branding', views: 15800, bounce: 28, time: 180, conv: 6.8 },
    { path: '/signup', views: 12400, bounce: 20, time: 300, conv: 22.4 }
];
let currentSortCol = 'views';
let currentSortAsc = false;

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
}

window.renderTopPages = function(dataToRender = topPagesData) {
    const tbody = document.getElementById('topPagesTable');
    if (!tbody) return;
    
    tbody.innerHTML = dataToRender.map(row => `
        <tr class="interactive-row" onclick="window.Router.navigate('#/segmentation')">
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #f8fafc; font-weight: 500;">${row.path}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${row.views.toLocaleString()}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${row.bounce}%</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right;">${formatTime(row.time)}</td>
            <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #10b981; font-weight: 600;">${row.conv}%</td>
        </tr>
    `).join('');
};

window.sortTopPages = function(col) {
    if (currentSortCol === col) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortCol = col;
        currentSortAsc = false;
    }
    
    topPagesData.sort((a, b) => {
        let valA = a[col];
        let valB = b[col];
        if (typeof valA === 'string') {
            return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return currentSortAsc ? valA - valB : valB - valA;
    });
    
    renderTopPages();
};

window.filterTopPagesBySource = function(source) {
    const status = document.getElementById('tableFilterStatus');
    if (status) {
        status.style.display = 'inline-block';
        status.textContent = 'Source: ' + source;
    }
    // Mock filter by scrambling data slightly
    const filtered = topPagesData.map(d => ({ ...d, views: Math.round(d.views * (Math.random() * 0.5 + 0.1)) })).sort((a,b)=>b.views-a.views);
    renderTopPages(filtered);
};

// --- LIVE ACTIVITY FEED ---
let activityFeedInterval = null;
const activityEvents = [
    { icon: '🚀', msg: 'New startup <strong>TechVision AI</strong> registered' },
    { icon: '🎨', msg: 'Brand kit generated for <strong>Nexus Flow</strong>' },
    { icon: '📢', msg: 'Campaign <em>Q3 Launch</em> went live' },
    { icon: '🤖', msg: 'Sales forecast model automatically retrained' },
    { icon: '👥', msg: 'CRM added 15 new enterprise leads' },
    { icon: '💳', msg: '<strong>DataSync</strong> upgraded to Pro Plan' },
    { icon: '✍️', msg: 'AI Blog Writer drafted 3 new SEO posts' }
];

function initActivityFeed() {
    const feed = document.getElementById('liveActivityFeed');
    if (!feed) return;
    
    // Initial pop
    feed.innerHTML = '';
    for(let i=0; i<3; i++) pushActivityEvent(feed);
    
    if (activityFeedInterval) clearInterval(activityFeedInterval);
    activityFeedInterval = setInterval(() => {
        pushActivityEvent(feed);
    }, 4000);
}

function pushActivityEvent(feed) {
    const event = activityEvents[Math.floor(Math.random() * activityEvents.length)];
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
        <div style="font-size: 16px;">${event.icon}</div>
        <div>
            <div style="font-size: 13.5px; color: #e2e8f0;">${event.msg}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Just now</div>
        </div>
    `;
    feed.prepend(el);
    if (feed.children.length > 8) {
        feed.removeChild(feed.lastChild);
    }
}
"""

content = content.replace("window.initAnalyticsPage = function() {", interactivity_logic + "\nwindow.initAnalyticsPage = function() {")

# Ensure table and feed are initialized
init_append = """
  renderTopPages();
  initActivityFeed();
  
  // Setup Table Search
  const searchInput = document.getElementById('topPagesSearch');
  if (searchInput) {
      searchInput.addEventListener('input', (e) => {
          const val = e.target.value.toLowerCase();
          const filtered = topPagesData.filter(row => row.path.toLowerCase().includes(val));
          renderTopPages(filtered);
      });
  }
"""
content = content.replace("  loadAndInitForecast();\n", "  loadAndInitForecast();\n" + init_append)

# Clear interval on destroy
destroy_append = """
  if (activityFeedInterval) { clearInterval(activityFeedInterval); activityFeedInterval = null; }
  if (kpiDetailChartInstance) { kpiDetailChartInstance.destroy(); kpiDetailChartInstance = null; }
"""
content = content.replace("  };", "  };\n" + destroy_append)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated analytics.js with interactivity logic.")
