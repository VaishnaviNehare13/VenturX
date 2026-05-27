import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Define LiveMongoDashboard
if "window.LiveMongoDashboard =" not in content:
    content = content.replace("window.dashboardCharts = [];", "window.dashboardCharts = [];\nwindow.LiveMongoDashboard = {};")

# 2. Update initDashboardPage to call loadDashboard() instead of loadLiveAnalytics()
content = content.replace("loadLiveAnalytics();", "loadDashboard();")

# 3. Create loadDashboard and renderDashboard
new_functions = """
async function loadDashboard() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/dashboard");
        if (!response.ok) throw new Error("Dashboard API error");
        const json = await response.json();
        
        if (json.success && json.data) {
            console.log("Dashboard Loaded:", json.data);
            window.LiveMongoDashboard = json.data;
            renderDashboard();
            console.log("Live Mongo Dashboard Synced");
        }
    } catch (e) {
        console.error("Failed to load live dashboard, using fallback:", e);
    }
}

function renderDashboard() {
    const data = window.LiveMongoDashboard;
    if (!data) return;

    // Update Header
    const welcomeTitle = document.querySelector('.dash-header h1');
    if (welcomeTitle && data.workspace) {
        welcomeTitle.innerHTML = `Welcome back to ${data.workspace}`;
    }

    // Update KPI Data Targets
    const revEl = document.querySelector('#kpi-detail-revenue');
    if (revEl && revEl.previousElementSibling) {
        const counter = revEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.total_revenue || 0);
    }
    
    const subsEl = document.querySelector('#kpi-detail-subs');
    if (subsEl && subsEl.previousElementSibling) {
        const counter = subsEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.active_subscriptions || 0);
    }
    
    const aiEl = document.querySelector('#kpi-detail-ai');
    if (aiEl && aiEl.previousElementSibling) {
        const counter = aiEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.ai_confidence || 0);
    }
    
    const roiEl = document.querySelector('#kpi-detail-roi');
    if (roiEl && roiEl.previousElementSibling) {
        const counter = roiEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.marketing_roi || 0);
    }

    // Update KPI Detail Texts (Retention/Churn)
    const retentionSpan = document.querySelector('#kpi-detail-subs div:nth-child(2) span:nth-child(2)');
    if (retentionSpan) retentionSpan.innerText = (data.retention_rate || 0) + '%';
    
    const churnSpan = document.querySelector('#kpi-detail-subs div:nth-child(1) span:nth-child(2)');
    if (churnSpan) churnSpan.innerText = (data.churn_rate || 0) + '% (Healthy)';

    // Update Health Score UI
    const healthEls = document.querySelectorAll('.health-score-container'); // Find any element that might display health
    // Actually in dashboard.html it's typically within a specific card. Let's rely on standard elements if any.

    // Overwrite Chart Datasets
    if (data.revenue_growth) chartDatasets.revenue.data = data.revenue_growth;
    if (data.client_growth) chartDatasets.growth.data = data.client_growth;
    if (data.ai_metrics) chartDatasets.aiMetrics.data = data.ai_metrics;

    // Trigger Animations and Chart rendering
    requestAnimationFrame(() => {
        animateCounters();
    });

    setTimeout(() => {
        renderPremiumChart();
    }, 200);
}
"""

# Append the new functions if they don't exist
if "async function loadDashboard()" not in content:
    content += "\n" + new_functions

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("dashboard.js updated.")
