import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# We want to replace loadDashboard and loadLiveAnalytics and renderDashboard.
# Because the user wants to unify this, we'll replace everything from loadLiveAnalytics to the end of loadDashboard or renderDashboard.
# I will use a regex to capture them.

pattern = r"async function loadLiveAnalytics\(\).*?function renderDashboard\(\) \{[\s\S]*?\}\n\n"

replacement = """
async function loadLiveAnalytics() {
    // Deprecated. Logic moved to loadDashboard.
}

async function loadDashboard() {
    try {
        const sessionStr = localStorage.getItem("venturx_session");
        if (!sessionStr) return;
        
        const user = JSON.parse(sessionStr);
        const email = user.email;
        if (!email) return;

        console.log("Loading dashboard for:", email);

        const response = await fetch(`http://127.0.0.1:5000/api/dashboard/${email}`);
        if (!response.ok) throw new Error("Dashboard API error");
        const json = await response.json();
        
        if (json.success && json.data) {
            console.log("Loaded dashboard for:", email);
            const data = json.data;
            window.LiveMongoDashboard = data;
            
            // Update Header
            const welcomeTitle = document.querySelector('.dash-header h1');
            if (welcomeTitle && data.workspace_name) {
                welcomeTitle.innerHTML = `Welcome back to ${data.workspace_name}`;
            }

            // Update KPI Data Targets
            const revEl = document.querySelector('#kpi-detail-revenue')?.previousElementSibling?.querySelector('.anim-counter');
            if (revEl) revEl.setAttribute('data-target', data.revenue || 0);
            
            const subsEl = document.querySelector('#kpi-detail-subs')?.previousElementSibling?.querySelector('.anim-counter');
            if (subsEl) subsEl.setAttribute('data-target', data.subscriptions || 0);
            
            const aiEl = document.querySelector('#kpi-detail-ai')?.previousElementSibling?.querySelector('.anim-counter');
            if (aiEl) aiEl.setAttribute('data-target', data.ai_confidence || 0);
            
            const roiEl = document.querySelector('#kpi-detail-roi')?.previousElementSibling?.querySelector('.anim-counter');
            if (roiEl) roiEl.setAttribute('data-target', data.marketing_roi || 0);

            // Overwrite Growth History
            if (data.growth_chart && Array.isArray(data.growth_chart) && data.growth_chart.length > 0) {
                chartDatasets.growth.data = data.growth_chart;
            }

            // Update AI Insights
            const insightsList = document.querySelector('.insights-list');
            if (insightsList && data.ai_insights && data.ai_insights.length > 0) {
                insightsList.innerHTML = data.ai_insights.map(i => `
                    <div class="insight-item">
                        <div class="insight-icon" style="background: rgba(99,102,241,0.2); color: #818cf8;"><i data-lucide="zap"></i></div>
                        <div class="insight-content">
                            <p>${i}</p>
                            <small>AI Generated</small>
                        </div>
                    </div>
                `).join('');
                if (window.lucide) window.lucide.createIcons();
            }

            requestAnimationFrame(() => {
                animateCounters();
            });

            setTimeout(() => {
                renderPremiumChart();
            }, 200);

            console.log("Live Mongo Dashboard Synced");
        }
    } catch (e) {
        console.error("Failed to load live dashboard:", e);
    }
}

function renderDashboard() {
    // Deprecated. Logic moved to loadDashboard.
}
"""

c = re.sub(pattern, replacement, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched dashboard.js for user personalization")
