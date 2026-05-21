import sys
import re

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/analytics.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add CSS
css_to_add = """
.interactive-card { cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.interactive-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(99,102,241,0.2); }
.interactive-item { cursor: pointer; }
.table-sortable th { cursor: pointer; user-select: none; transition: color 0.2s; }
.table-sortable th:hover { color: #f8fafc; }
.table-sortable tr.interactive-row { cursor: pointer; transition: background 0.2s; }
.table-sortable tr.interactive-row:hover { background: rgba(255,255,255,0.05); }

/* Activity Feed */
.activity-feed { max-height: 220px; overflow-y: auto; padding-right: 8px; }
.activity-feed::-webkit-scrollbar { width: 4px; }
.activity-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.activity-item { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; align-items: flex-start; animation: slideInRight 0.3s ease-out forwards; }
.activity-item:last-child { border-bottom: none; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

/* Modals */
.bi-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
.bi-modal.open { opacity: 1; pointer-events: auto; }
.bi-modal-content { background: #0f172a; border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; width: 90%; max-width: 700px; padding: 24px; position: relative; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
.bi-modal.open .bi-modal-content { transform: translateY(0); }
.bi-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1; }
.bi-modal-close:hover { color: #fff; }

.radial-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 20px; margin-top: 24px; }
.radial-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
.radial-circle { position: relative; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: conic-gradient(var(--fill-color) var(--perc), rgba(255,255,255,0.1) 0); margin-bottom: 8px; transition: --perc 1s; }
.radial-circle::after { content: ''; position: absolute; inset: 6px; background: #0f172a; border-radius: 50%; }
.radial-circle span { position: relative; z-index: 1; font-size: 15px; font-weight: 700; color: #fff; }
</style>
"""
content = content.replace("</style>", css_to_add)

# 2. Update Page Header to include filters
header_orig = """<div class="page-header">
  <h2>AI Business Intelligence Center</h2>
  <p class="lead muted">Executive dashboard for startup performance, usage metrics, and automated AI insights.</p>
</div>"""
header_new = """<div class="page-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
  <div>
    <h2>AI Business Intelligence Center</h2>
    <p class="lead muted">Executive dashboard for startup performance, usage metrics, and automated AI insights.</p>
  </div>
  <div style="display: flex; gap: 12px; align-items: center;">
    <select id="globalDateFilter" class="form-input" style="font-size: 13px; padding: 8px 12px; width: auto; background: rgba(0,0,0,0.3);" onchange="applyGlobalFilter()">
      <option value="7">Last 7 Days</option>
      <option value="30" selected>Last 30 Days</option>
      <option value="90">Last 90 Days</option>
    </select>
  </div>
</div>"""
content = content.replace(header_orig, header_new)

# 3. Add interactive-card and onclick to KPIs
# Look for <div class="card kpi">
def add_kpi_interactions(match):
    # find the title to pass to openKpiModal
    inner = match.group(0)
    title_match = re.search(r'<h3 class="kpi-title">(.*?)</h3>', inner)
    title = title_match.group(1) if title_match else "KPI"
    return inner.replace('class="card kpi"', f'class="card kpi interactive-card" onclick="openKpiModal(\'{title}\')"')

content = re.sub(r'<div class="card kpi".*?>.*?</div>\s*</div>', add_kpi_interactions, content, flags=re.DOTALL)

# 4. Make Health Score Interactive
health_orig = """<div class="card">
    <h3>AI Ecosystem Health Score</h3>"""
health_new = """<div class="card interactive-card" onclick="openHealthModal()">
    <h3>AI Ecosystem Health Score</h3>"""
content = content.replace(health_orig, health_new)

# 5. Add Live Activity Feed alongside Health & Insights (Transform grid two to grid three)
grid_two_orig = """<!-- Ecosystem Health & Insights -->
<div class="grid two" style="margin-bottom: 24px;">"""
grid_two_new = """<!-- Ecosystem Health, Insights, Activity -->
<div class="grid three" style="margin-bottom: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">"""
content = content.replace(grid_two_orig, grid_two_new)

# Append Activity Feed block after insights list
insights_end = """    <ul class="insights-list" id="aiInsightsList">
      <!-- Populated via JS -->
    </ul>
  </div>"""
activity_feed_new = """    <ul class="insights-list" id="aiInsightsList">
      <!-- Populated via JS -->
    </ul>
  </div>
  <div class="card">
    <h3>Live Activity Feed</h3>
    <p class="muted" style="font-size: 13px; margin-bottom: 16px; margin-top: 4px;">Real-time platform events</p>
    <div class="activity-feed" id="liveActivityFeed">
      <!-- Populated via JS -->
    </div>
  </div>"""
content = content.replace(insights_end, activity_feed_new)

# 6. Make charts interactive visual indicators
content = content.replace('id="sourcesChart"', 'id="sourcesChart" style="cursor: pointer;" title="Click slice to filter top pages"')
content = content.replace('id="platformUsageChart"', 'id="platformUsageChart" style="cursor: pointer;" title="Click axis to navigate to module"')

# 7. Update Top Pages Table
table_header_orig = """<table style="width: 100%; font-size: 13px; border-collapse: separate; border-spacing: 0;">
        <thead>
          <tr>
            <th style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #94a3b8;">Page Path</th>
            <th style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Views</th>
            <th style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Bounce</th>
            <th style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Avg Time</th>
            <th style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Conv.</th>
          </tr>
        </thead>"""
table_header_new = """<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div id="tableFilterStatus" class="badge" style="display:none; background: rgba(99,102,241,0.2); color: #818cf8;">Filtered</div>
      <input type="text" id="topPagesSearch" class="form-input" placeholder="Search pages..." style="width: 200px; padding: 6px 12px; font-size: 13px; background: rgba(0,0,0,0.2);">
    </div>
    <table class="table-sortable" style="width: 100%; font-size: 13px; border-collapse: separate; border-spacing: 0;">
        <thead>
          <tr>
            <th onclick="sortTopPages('path')" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #94a3b8;">Page Path ⇕</th>
            <th onclick="sortTopPages('views')" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Views ⇕</th>
            <th onclick="sortTopPages('bounce')" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Bounce ⇕</th>
            <th onclick="sortTopPages('time')" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Avg Time ⇕</th>
            <th onclick="sortTopPages('conv')" style="padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); text-align: right; color: #94a3b8;">Conv. ⇕</th>
          </tr>
        </thead>"""
content = content.replace(table_header_orig, table_header_new)

# 8. Append Modals
modals = """
<!-- BI MODALS -->
<!-- KPI Details Modal -->
<div class="bi-modal" id="kpiDetailsModal">
  <div class="bi-modal-content">
    <button class="bi-modal-close" onclick="closeBiModal('kpiDetailsModal')">&times;</button>
    <h3 id="kpiModalTitle" style="margin-bottom: 4px; font-size: 20px;">KPI Details</h3>
    <p id="kpiModalSubtitle" class="muted" style="margin-bottom: 20px; font-size: 13px;">Historical trend and breakdown</p>
    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
      <div style="flex: 1;">
        <div class="muted" style="font-size: 12px; text-transform: uppercase;">Current Value</div>
        <div id="kpiModalValue" style="font-size: 32px; font-weight: 700; color: #f8fafc; margin-top: 4px;">0</div>
      </div>
      <div style="flex: 1;">
        <div class="muted" style="font-size: 12px; text-transform: uppercase;">Period Growth</div>
        <div id="kpiModalGrowth" style="font-size: 24px; font-weight: 600; margin-top: 8px;">+0%</div>
      </div>
    </div>
    <div style="position: relative; height: 250px; width: 100%;">
      <canvas id="kpiDetailChart"></canvas>
    </div>
  </div>
</div>

<!-- Insight Details Modal -->
<div class="bi-modal" id="insightDetailsModal">
  <div class="bi-modal-content" style="max-width: 500px;">
    <button class="bi-modal-close" onclick="closeBiModal('insightDetailsModal')">&times;</button>
    <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px;">
      <div id="insightModalIcon" style="font-size: 32px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">💡</div>
      <div>
        <h3 style="margin-bottom: 8px; font-size: 18px;">AI Insight Analysis</h3>
        <p id="insightModalText" style="color: #e2e8f0; font-size: 15px; line-height: 1.5; margin: 0;"></p>
      </div>
    </div>
    <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span class="muted" style="font-size: 13px;">AI Confidence Score</span>
        <span id="insightModalConfidence" style="color: #10b981; font-weight: 600; font-size: 13px;">94%</span>
      </div>
      <div style="width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
        <div id="insightModalConfidenceBar" style="height: 100%; width: 94%; background: #10b981;"></div>
      </div>
    </div>
    <div id="insightModalAction" style="margin-top: 16px;">
      <button class="btn-premium" style="width: 100%;">Take Action</button>
    </div>
  </div>
</div>

<!-- Health Score Modal -->
<div class="bi-modal" id="healthScoreModal">
  <div class="bi-modal-content">
    <button class="bi-modal-close" onclick="closeBiModal('healthScoreModal')">&times;</button>
    <h3 style="margin-bottom: 4px; font-size: 20px;">Ecosystem Health Breakdown</h3>
    <p class="muted" style="margin-bottom: 20px; font-size: 13px;">Detailed component analysis of your platform's AI Health Score.</p>
    
    <div class="radial-breakdown" id="healthBreakdownGrid">
      <!-- Populated via JS -->
    </div>
  </div>
</div>
"""
content = content + modals

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated analytics.html with interactivity structures.")
