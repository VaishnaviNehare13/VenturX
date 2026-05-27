import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace "    // Overwrite Chart Datasets" with DOM updates for feed and insights before it
new_dom_updates = """
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
    if (aiContainer && aiContainer.parentElement && data.ai_insights) {
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
        
        // Remove old insight cards
        const oldCards = aiContainer.parentElement.querySelectorAll('.insight-card');
        oldCards.forEach(c => c.remove());
        
        // Insert new ones
        aiContainer.parentElement.insertAdjacentHTML('beforeend', insightsHtml);
    }
    
    // Re-initialize lucide icons for new HTML
    if (window.lucide) {
        setTimeout(() => { window.lucide.createIcons(); }, 50);
    }

    // Overwrite Chart Datasets
"""

content = content.replace("    // Overwrite Chart Datasets", new_dom_updates)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("dashboard.js updated with feed and insights.")
