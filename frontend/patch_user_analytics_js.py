import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace loadLiveAnalytics
old_load = r"async function loadLiveAnalytics\(\) \{.*?\n\}"
# Wait, loadLiveAnalytics has setTimeout inside it. Let's just do a manual string replace.

new_analytics_code = """
async function saveUserAnalytics() {
    try {
        const sessionStr = localStorage.getItem("venturx_session");
        if (!sessionStr) return;
        const user = JSON.parse(sessionStr);
        if (!user || !user.email) return;

        // Scrape current UI values
        const revEl = document.querySelector('#kpi-detail-revenue').previousElementSibling.querySelector('.anim-counter');
        const subsEl = document.querySelector('#kpi-detail-subs').previousElementSibling.querySelector('.anim-counter');
        const aiEl = document.querySelector('#kpi-detail-ai').previousElementSibling.querySelector('.anim-counter');
        const roiEl = document.querySelector('#kpi-detail-roi').previousElementSibling.querySelector('.anim-counter');
        
        const payload = {
            user_email: user.email,
            workspace: "VenturX Workspace",
            total_revenue: revEl ? parseFloat(revEl.getAttribute('data-target')) : 0,
            active_subscriptions: subsEl ? parseFloat(subsEl.getAttribute('data-target')) : 0,
            ai_confidence: aiEl ? parseFloat(aiEl.getAttribute('data-target')) : 0,
            marketing_roi: roiEl ? parseFloat(roiEl.getAttribute('data-target')) : 0,
            retention_rate: 94.5,
            prediction_score: 88,
            growth_chart: chartDatasets.growth.data,
            client_growth: chartDatasets.clients.data,
            ai_insights: ["Dashboard synced successfully."]
        };

        const response = await fetch('http://127.0.0.1:5000/api/user_analytics/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const res = await response.json();
        console.log("Auto-Save User Analytics:", res);
    } catch (e) {
        console.error("Auto-Save User Analytics Error:", e);
    }
}

async function loadLiveAnalytics() {
    try {
        const sessionStr = localStorage.getItem("venturx_session");
        if (!sessionStr) return;
        const user = JSON.parse(sessionStr);
        if (!user || !user.email) return;

        const response = await fetch(`http://127.0.0.1:5000/api/user_analytics/${user.email}`);
        if (!response.ok) throw new Error("Analytics API error");
        const json = await response.json();
        
        if (json.success && json.data) {
            console.log("User Analytics Loaded", json.data);
            const data = json.data;
            
            const revEl = document.querySelector('#kpi-detail-revenue').previousElementSibling.querySelector('.anim-counter');
            if (revEl) revEl.setAttribute('data-target', data.total_revenue);
            
            const subsEl = document.querySelector('#kpi-detail-subs').previousElementSibling.querySelector('.anim-counter');
            if (subsEl) subsEl.setAttribute('data-target', data.active_subscriptions);
            
            const aiEl = document.querySelector('#kpi-detail-ai').previousElementSibling.querySelector('.anim-counter');
            if (aiEl) aiEl.setAttribute('data-target', data.ai_confidence);
            
            const roiEl = document.querySelector('#kpi-detail-roi').previousElementSibling.querySelector('.anim-counter');
            if (roiEl) roiEl.setAttribute('data-target', data.marketing_roi);

            const retentionSpan = document.querySelector('#kpi-detail-subs div:nth-child(2) span:nth-child(2)');
            if (retentionSpan) retentionSpan.innerText = (data.retention_rate) + '%';
            
            const churnSpan = document.querySelector('#kpi-detail-subs div:nth-child(1) span:nth-child(2)');
            if (churnSpan) churnSpan.innerText = (100 - data.retention_rate).toFixed(1) + '% (Healthy)';
            
            if (data.growth_chart && Array.isArray(data.growth_chart)) {
                chartDatasets.growth.data = data.growth_chart;
            }
            if (data.client_growth && Array.isArray(data.client_growth)) {
                chartDatasets.clients.data = data.client_growth;
            }
        }
    } catch (e) {
        console.error("Failed to load user analytics:", e);
    }
    
    requestAnimationFrame(() => {
        animateCounters();
    });

    setTimeout(() => {
        renderPremiumChart();
    }, 200);
}
"""

c = re.sub(r"async function loadLiveAnalytics\(\) \{[\s\S]*?\}\n\n", new_analytics_code + "\n\n", c)

# Add save trigger when changing chart tabs
c = c.replace('renderPremiumChart();', 'renderPremiumChart();\n        saveUserAnalytics();')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched dashboard.js for user analytics")
