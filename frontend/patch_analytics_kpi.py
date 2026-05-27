import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\analytics.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

pattern = r"function updateAnalyticsKPIs\(\) \{[\s\S]*?\}\n\nfunction renderAIInsights\(\)"

replacement = """async function updateAnalyticsKPIs() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/analytics/overview');
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

function renderAIInsights()"""

c = re.sub(pattern, replacement, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched analytics.js for KPI overview")
