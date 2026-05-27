import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_reports_code = r"""
window.generateReport = async function() {
    const payloads = [
        { title: "Weekly Sync", category: "Audit", format: "PDF", insights: "No critical issues." },
        { title: "AI Health Check", category: "System Diagnostics", format: "JSON", insights: "AI Engine is stable." },
        { title: "Revenue Cohort", category: "Platform Revenue", format: "CSV", insights: "Strong retention." }
    ];
    const payload = payloads[Math.floor(Math.random() * payloads.length)];
    
    try {
        const response = await fetch("http://127.0.0.1:5000/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log("Report Generated");
            loadReports();
        }
    } catch (e) {
        console.error("Failed to generate report", e);
    }
}

window.deleteReport = async function(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
        const response = await fetch("http://127.0.0.1:5000/api/reports/" + id, { method: "DELETE" });
        if (response.ok) {
            console.log("Report Deleted:", id);
            loadReports();
        }
    } catch (e) {
        console.error("Failed to delete report", e);
    }
}

window.downloadReport = function(id, title, format) {
    console.log("Report Downloaded:", id);
    const content = `Simulated Export for ${title}\nFormat: ${format}\nID: ${id}\nGenerated on VenturX Admin.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_export.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
}

function getReportsHTML() {
  const reports = window.LiveMongoReports || [];
  
  let pdfCount = 0;
  let csvCount = 0;
  let jsonCount = 0;
  let processingReports = [];
  
  let totalRevenue = 0;
  let totalAiScore = 0;
  let completedCount = 0;
  let totalDownloads = 0;
  
  reports.forEach(r => {
     if (r.format === 'PDF') pdfCount++;
     if (r.format === 'CSV') csvCount++;
     if (r.format === 'JSON') jsonCount++;
     if (r.status === 'Processing' || r.status === 'Queued') processingReports.push(r);
     if (r.status === 'Completed') completedCount++;
     
     totalRevenue += (r.revenue || 0);
     totalAiScore += (r.ai_score || 0);
     totalDownloads += (r.download_count || 0);
  });
  
  const avgAiScore = reports.length > 0 ? Math.round(totalAiScore / reports.length) : 0;
  const completionRate = reports.length > 0 ? Math.round((completedCount / reports.length) * 100) : 0;

  return `
    <div class="admin-section-header" style="display:flex; justify-content:space-between; align-items:center;">
      <h2>Data Reports Export</h2>
      <button class="admin-btn admin-btn-primary" onclick="window.generateReport()"><i data-lucide="plus" style="width:16px; margin-right:6px;"></i> Generate Report</button>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Total Reports</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${reports.length}</div>
        <div style="font-size:12px; color:#10b981; margin-top:8px;">${totalDownloads} total downloads</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Average AI Score</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${avgAiScore}</div>
        <div style="font-size:12px; color:#3b82f6; margin-top:8px;">Platform intelligence index</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Revenue Analyzed</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">$${totalRevenue.toLocaleString()}</div>
        <div style="font-size:12px; color:#f59e0b; margin-top:8px;">Cumulative MRR tracked</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Completion Rate</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${completionRate}%</div>
        <div style="font-size:12px; color:#10b981; margin-top:8px;">${processingReports.length} in queue</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Export Generation Queue</h3>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Report Source</th>
                <th>Generation Date</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reports.length > 0 ? reports.map(r => {
                let badgeClass = 'admin-badge-info';
                if (r.format === 'PDF') badgeClass = 'admin-badge-success';
                if (r.format === 'JSON') badgeClass = 'admin-badge-warning';
                
                return `
                  <tr class="admin-table-row-interactive">
                    <td onclick="window.AdminUI.openOverlay('modal', '${r.title} Preview', '<div class=\\'admin-empty-state\\'><i data-lucide=\\'file-text\\' class=\\'admin-empty-icon\\'></i><div class=\\'admin-empty-title\\'>Dynamic ${r.format} Preview...</div><p>${r.insights || 'Loading insights...'}</p></div>')">
                        <div style="font-weight:500;">${r.title}</div>
                        <div style="font-size:12px; color:#94a3b8; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.category || 'Custom'} - ${r.generated_by || 'Admin'}</div>
                    </td>
                    <td>
                        <div>${new Date(r.generated_at).toLocaleDateString()}</div>
                        <div style="font-size:11px; color:#64748b;">${new Date(r.generated_at).toLocaleTimeString()}</div>
                    </td>
                    <td><span class="admin-badge ${badgeClass}">${r.format}</span></td>
                    <td>
                       ${r.status === 'Completed' ? 
                         `<span class="admin-badge admin-badge-success">Completed</span>` : 
                         `<span style="color:#f59e0b; font-size:12px;"><i data-lucide="loader" style="width:12px; animation: spin 1s linear infinite;"></i> ${r.status}</span>`
                       }
                    </td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            ${r.status === 'Completed' ? `<button class="admin-btn admin-btn-primary" style="padding:4px 8px; font-size:12px;" onclick="window.downloadReport('${r._id}', '${r.title}', '${r.format}')"><i data-lucide="download" style="width:12px;"></i></button>` : ''}
                            <button class="admin-btn admin-btn-danger" style="padding:4px 8px; font-size:12px; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2);" onclick="window.deleteReport('${r._id}')"><i data-lucide="trash-2" style="width:12px;"></i></button>
                        </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="5" style="text-align:center;">No reports available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Format Distribution</h3>
          <div class="admin-chart-wrapper" style="height:150px;">
            <canvas id="reportsVolumeChart"></canvas>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Queue Status</h3>
          <ul style="padding-left: 20px; font-size:13px;">
            ${processingReports.length > 0 ? processingReports.map(pr => `
              <li style="color:#94a3b8; margin-bottom:12px;">${pr.title} <span class="admin-badge admin-badge-${pr.status === 'Processing' ? 'info' : 'warning'}" style="float:right;">${pr.status}</span></li>
            `).join('') : '<li style="color:#10b981;">All queues empty. Cluster idle.</li>'}
            <li style="color:#94a3b8; margin-top:12px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">Weekly Sync <span class="admin-badge admin-badge-success" style="float:right;">Complete</span></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function bindReportsEvents() {
  const reports = window.LiveMongoReports || [];
  let pdfCount = 0; let csvCount = 0; let jsonCount = 0;
  
  reports.forEach(r => {
     if (r.format === 'PDF') pdfCount++;
     if (r.format === 'CSV') csvCount++;
     if (r.format === 'JSON') jsonCount++;
  });

  setTimeout(() => {
    const volData = window.AdminUI.generateTrendData(reports.length || 10, 14, 0.3, 'up');
    window.AdminUI.renderLineChart('reportsVolumeChart', Array(14).fill(''), volData, '#3b82f6');
    window.lucide.createIcons();
  }, 100);
}
"""

# Replace instead of regex to avoid escape issues
start_marker = "function getReportsHTML() {"
end_marker = "function getSettingsHTML() {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_reports_code + "\n" + content[end_idx:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Markers not found!")
