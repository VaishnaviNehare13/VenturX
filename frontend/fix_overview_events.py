import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

safe_bind_events = r"""function bindOverviewEvents() {
  setTimeout(() => {
    console.log("Overview Events Bound");
    
    const revenueCard = document.getElementById('card-revenue');
    if (revenueCard) {
      revenueCard.onclick = () => {
        window.AdminUI.openOverlay('drawer', 'Revenue Intelligence', `
          <div style="color:#94a3b8; font-size:14px; margin-bottom:24px;">Deep dive into platform financial health and cohort behavior.</div>
          <div class="admin-chart-wrapper" style="height:220px; margin-bottom:24px; position:relative;">
            <div class="admin-chart-overlay">
              <div class="overlay-title">Forecast</div>
              <div class="overlay-value" style="color:#10b981;">Strong Growth</div>
            </div>
            <canvas id="drawerRevChart"></canvas>
          </div>
          <h4 style="color:#fff; margin-bottom:12px;">Top Performing Tiers</h4>
          <p style="color:#10b981;">Enterprise subscriptions account for 68% of new MRR this month.</p>
        `);
        
        setTimeout(() => {
          const current = (window.LiveOverviewData && window.LiveOverviewData.total_revenue) ? window.LiveOverviewData.total_revenue : 0;
          const ds1 = window.AdminUI.generateTrendData(current || 10000, 12, 0.1, 'up');
          const ds2 = window.AdminUI.generateTrendData((current || 10000) * 1.2, 12, 0.05, 'up'); // Projection
          
          window.AdminUI.renderMultiLineChart('drawerRevChart', Array(12).fill(''), [
            { data: ds1, color: '#3b82f6', label: 'Current MRR', fill: true },
            { data: ds2, color: '#10b981', label: 'Projected', fill: false }
          ]);
        }, 50);
      };
    } else {
      console.warn("Missing Overview Element: card-revenue");
    }

    const usersCard = document.getElementById('card-users');
    if (usersCard) {
      usersCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="users"]');
          if (tab) tab.click();
      };
    } else {
      console.warn("Missing Overview Element: card-users");
    }

    const workspacesCard = document.getElementById('card-workspaces');
    if (workspacesCard) {
      workspacesCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="subscriptions"]');
          if (tab) tab.click();
      };
    } else {
      console.warn("Missing Overview Element: card-workspaces");
    }

    const healthCard = document.getElementById('card-health');
    if (healthCard) {
      healthCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="ai-analytics"]');
          if (tab) tab.click();
      };
    } else {
      console.warn("Missing Overview Element: card-health");
    }

    console.log("Overview Render Complete");
  }, 0);
}
"""

start_marker = "function bindOverviewEvents() {"
end_marker = "// --- Users ---"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + safe_bind_events + "\n" + content[end_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced bindOverviewEvents!")
else:
    print("Markers not found!")
