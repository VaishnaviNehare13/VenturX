import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

overview_code = r"""
window.LiveOverviewData = null;

async function loadOverview() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/admin/overview");
        if (!response.ok) throw new Error("API response not OK");
        const data = await response.json();
        
        const isFirstLoad = !window.LiveOverviewData;
        window.LiveOverviewData = data;
        
        if (isFirstLoad) {
            console.log("Overview Loaded");
        } else {
            console.log("Overview Refreshed");
        }
        
        if (window.AdminState && window.AdminState.currentTab === 'overview') {
            const activeView = document.getElementById('admin-view-overview');
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                // Render silently without jumping
                activeView.innerHTML = getOverviewHTML();
                if (typeof bindOverviewEvents === 'function') bindOverviewEvents();
            }
        }
    } catch (error) {
        console.error("Failed to load overview:", error);
    }
}

function getOverviewHTML() {
  const data = window.LiveOverviewData;
  if (!data) return `<div style="color:#94a3b8; padding:20px;">Loading overview telemetry...</div>`;

  const logs = data.activity_logs || [];
  const feedHTML = logs.length === 0 
    ? `<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No recent activity</td></tr>`
    : logs.map(item => {
        let actionColor = '#10b981';
        if (item.action && item.action.includes('Failed')) actionColor = '#ef4444';
        if (item.action && item.action.includes('Deleted')) actionColor = '#ef4444';
        
        return `
      <tr class="admin-table-row-interactive">
        <td style="display:flex; align-items:center; gap:8px; padding:8px 12px;">
          <div style="width:6px; height:6px; border-radius:50%; background:${actionColor};"></div>
          <i data-lucide="activity" style="width:12px; color:#94a3b8;"></i>
          ${item.user_email || 'System'}
        </td>
        <td style="padding:8px 12px;"><span class="admin-badge admin-badge-info">[${item.module || 'SYS'}]</span> ${item.action || item.message}</td>
        <td style="color:#64748b; font-family:monospace; font-size:11px; padding:8px 12px;">${new Date(item.timestamp).toLocaleTimeString()}</td>
      </tr>
    `}).join('');

  return `
    <div class="admin-section-header">
      <h2>Platform Overview</h2>
    </div>
    
    <div class="admin-executive-strip" style="padding: 12px 20px;">
      <div class="admin-executive-text" style="font-size:14px;">
        <i data-lucide="zap" class="text-amber-500"></i>
        Platform Telemetry is Online. Aggregate data fetched successfully.
      </div>
      <div class="admin-executive-metrics">
        <div class="admin-executive-metric">
          <span style="font-size:11px; color:#94a3b8;">Global Platform Health</span>
          <span style="font-size:18px; font-weight:600; color:#10b981;">${data.telemetry?.system_health_status || 100}/100</span>
        </div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-users">
        <div class="admin-kpi-title" style="font-size:12px;">Total Users</div>
        <div class="admin-kpi-value" style="font-size:24px;">${(data.total_users || 0).toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="users" style="width:12px;"></i> Active Accounts</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-workspaces">
        <div class="admin-kpi-title" style="font-size:12px;">Active Subscriptions</div>
        <div class="admin-kpi-value" style="font-size:24px;">${(data.active_subscriptions || 0).toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="briefcase" style="width:12px;"></i> View Directory</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-revenue">
        <div class="admin-kpi-title" style="font-size:12px;">Analyzed Revenue</div>
        <div class="admin-kpi-value" style="font-size:24px;">$${(data.total_revenue || 0).toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="dollar-sign" style="width:12px;"></i> Click for trends</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-health">
        <div class="admin-kpi-title" style="font-size:12px;">Avg AI Score</div>
        <div class="admin-kpi-value" style="font-size:24px; color:#10b981;">${data.avg_ai_score || 0}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="activity" style="width:12px;"></i> Intelligent Index</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Live Activity Feed</h3>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="padding:8px 12px;">User / Source</th>
                <th style="padding:8px 12px;">Event</th>
                <th style="padding:8px 12px;">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${feedHTML}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">System Telemetry</h3>
          <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; font-size:13px;">
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">API Latency</span>
              <span style="color:#f8fafc;">${data.telemetry?.api_latency || 0}ms</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Active Sessions</span>
              <span style="color:#f8fafc;">${data.telemetry?.active_sessions || 0}</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">CPU Usage</span>
              <span style="color:#f8fafc;">${data.telemetry?.cpu_usage || 0}%</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Enterprise Accounts</span>
              <span style="color:#f8fafc;">${data.enterprise_accounts || 0}</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Total Reports</span>
              <span style="color:#f8fafc;">${data.total_reports || 0}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}
"""

start_marker = "function getOverviewHTML() {"
end_marker = "function bindOverviewEvents() {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + overview_code + "\n" + content[end_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced getOverviewHTML!")
else:
    print("Markers not found!")
