import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace renderDashboard function
old_render_dashboard = r"function renderDashboard\(\) \{.*?(?=// Re-initialize lucide icons for new HTML)"
new_render_dashboard = """function renderDashboard() {
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
    const churnValue = data.churn_rate || (100 - (data.retention_rate || 100));
    if (churnSpan) churnSpan.innerText = churnValue + '% (Healthy)';

    // Update Health Score UI (Optional, if it exists)
    const healthEls = document.querySelectorAll('.health-score-container'); 

    // Update Activity Feed
    const feedContainer = document.getElementById('activityFeed');
    if (feedContainer && data.activity_feed) {
        feedContainer.innerHTML = data.activity_feed.map(item => `
            <div class="feed-item">
                <div class="feed-icon"><i data-lucide="${item.type === 'revenue' ? 'indian-rupee' : (item.type === 'user' ? 'user' : 'cpu')}" class="icon-sm text-${item.type === 'revenue' ? 'green' : (item.type === 'user' ? 'blue' : 'purple')}-500"></i></div>
                <div class="feed-content">
                    <h5>${item.type === 'revenue' ? 'Payment Event' : (item.type === 'user' ? 'User Activity' : 'System Event')}</h5>
                    <p>${item.message}</p>
                    <span class="feed-time">${item.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Update AI Insights
    const aiContainer = document.querySelector('.dash-card-header + .insight-card');
    if (aiContainer && data.ai_insights) {
        const parent = aiContainer.parentElement;
        if (parent) {
            const insightsHtml = data.ai_insights.map((msg, idx) => `
                <div class="insight-card">
                    <div class="insight-top">
                        <div class="insight-title"><i data-lucide="${idx === 0 ? 'trending-up' : 'alert-circle'}" class="icon-sm text-${idx === 0 ? 'blue' : 'amber'}-400"></i> ${idx === 0 ? 'Trajectory Optimal' : 'Retention Risk'}</div>
                        <div class="insight-confidence" ${idx !== 0 ? 'style="color: #f59e0b; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2);"' : ''}>${idx === 0 ? '96% Conf.' : '82% Conf.'}</div>
                    </div>
                    <div class="insight-body">
                        ${msg}
                    </div>
                </div>
            `).join('');
            
            const oldCards = parent.querySelectorAll('.insight-card');
            oldCards.forEach(c => c.remove());
            parent.insertAdjacentHTML('beforeend', insightsHtml);
        }
    }
    
    """

content = re.sub(old_render_dashboard, new_render_dashboard, content, flags=re.DOTALL)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("renderDashboard in dashboard.js patched successfully.")
