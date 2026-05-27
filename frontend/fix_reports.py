import os

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

import re

new_reports_code = """function getReportsHTML() {
  const reports = window.LiveMongoReports || [];
  
  let pdfCount = 0;
  let csvCount = 0;
  let jsonCount = 0;
  let processingReports = [];
  
  reports.forEach(r => {
     if (r.format === 'PDF') pdfCount++;
     if (r.format === 'CSV') csvCount++;
     if (r.format === 'JSON') jsonCount++;
     if (r.status === 'Processing' || r.status === 'Queued') processingReports.push(r);
  });

  return `
    <div class="admin-section-header">
      <h2>Data Reports Export</h2>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr;">
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">PDF Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsPdfChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#10b981;">${pdfCount}</span></div>
       </div>
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">CSV Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsCsvChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#3b82f6;">${csvCount}</span></div>
       </div>
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">JSON Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsJsonChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#f59e0b;">${jsonCount}</span></div>
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
                <th>Description</th>
                <th>Generation Date</th>
                <th>Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${reports.length > 0 ? reports.map(r => {
                let badgeClass = 'admin-badge-info';
                if (r.format === 'PDF') badgeClass = 'admin-badge-success';
                if (r.format === 'JSON') badgeClass = 'admin-badge-warning';
                
                return \\`
                  <tr class="admin-table-row-interactive" onclick="window.AdminUI.openOverlay('modal', '\\${r.title} Preview', '<div class=\\\\'admin-empty-state\\\\'><i data-lucide=\\\\'file-text\\\\' class=\\\\'admin-empty-icon\\\\'></i><div class=\\\\'admin-empty-title\\\\'>Dynamic \\${r.format} Preview...</div><p>\\${r.insights || 'Loading insights...'}</p></div>')">
                    <td>\\${r.title}</td>
                    <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">\\${r.category} - \\${r.generated_by}</td>
                    <td>\\${new Date(r.generated_at).toLocaleDateString()}</td>
                    <td><span class="admin-badge \\${badgeClass}">\\${r.format}</span></td>
                    <td>
                       \\${r.status === 'Completed' ? 
                         \\`<button class="admin-btn admin-btn-primary"><i data-lucide="download" style="width:14px; margin-right:4px;"></i> Export</button>\\` : 
                         \\`<span style="color:#f59e0b; font-size:12px;"><i data-lucide="loader" style="width:12px; animation: spin 1s linear infinite;"></i> \\${r.status}</span>\\`
                       }
                    </td>
                  </tr>
                \\`;
              }).join('') : '<tr><td colspan="5" style="text-align:center;">No reports available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Export Frequency Trend</h3>
          <div class="admin-chart-wrapper" style="height:150px;">
            <canvas id="reportsVolumeChart"></canvas>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Queue Status</h3>
          <ul style="padding-left: 20px; font-size:13px;">
            ${processingReports.length > 0 ? processingReports.map(pr => \\`
              <li style="color:#94a3b8; margin-bottom:12px;">\\${pr.title} <span class="admin-badge admin-badge-\\${pr.status === 'Processing' ? 'info' : 'warning'}" style="float:right;">\\${pr.status}</span></li>
            \\`).join('') : '<li style="color:#10b981;">All queues empty. Cluster idle.</li>'}
            <li style="color:#94a3b8; margin-top:12px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">Weekly Sync <span class="admin-badge admin-badge-success" style="float:right;">Complete</span></li>
          </ul>
        </div>
      </div>
    </div>
  \`;
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
    
    const pdfData = window.AdminUI.generateTrendData(pdfCount || 5, 10, 0.2, 'up');
    window.AdminUI.renderLineChart('reportsPdfChart', Array(10).fill(''), pdfData, '#10b981');
    
    const csvData = window.AdminUI.generateTrendData(csvCount || 5, 10, 0.4, 'up');
    window.AdminUI.renderLineChart('reportsCsvChart', Array(10).fill(''), csvData, '#3b82f6');
    
    const jsonData = window.AdminUI.generateTrendData(jsonCount || 5, 10, 0.1, 'up');
    window.AdminUI.renderLineChart('reportsJsonChart', Array(10).fill(''), jsonData, '#f59e0b');
  }, 100);
}"""

pattern = re.compile(r'function getReportsHTML\(\).*?function getSettingsHTML\(\) \{', re.DOTALL)
new_content = pattern.sub(new_reports_code + "\n\nfunction getSettingsHTML() {", content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replaced!")
