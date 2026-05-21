import sys
import re

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/financials.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove inline <script> block
script_start = content.find("<script>")
if script_start != -1:
    content = content[:script_start]

# 2. Inject CSS styles
css = """<style>
.interactive-card { cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.interactive-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(99,102,241,0.2); }
.interactive-item { cursor: pointer; transition: transform 0.2s; }
.interactive-item:hover { transform: translateX(4px); background: rgba(99,102,241,0.05); }

/* Modals */
.bi-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
.bi-modal.open { opacity: 1; pointer-events: auto; }
.bi-modal-content { background: #0f172a; border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; width: 90%; max-width: 700px; padding: 24px; position: relative; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 24px 48px rgba(0,0,0,0.5); }
.bi-modal.open .bi-modal-content { transform: translateY(0); }
.bi-modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; line-height: 1; }
.bi-modal-close:hover { color: #fff; }

/* Radial Items */
.radial-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 20px; margin-top: 24px; }
.radial-item { display: flex; flex-direction: column; align-items: center; text-align: center; }
.radial-circle { position: relative; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: conic-gradient(var(--fill-color) var(--perc), rgba(255,255,255,0.1) 0); margin-bottom: 8px; }
.radial-circle::after { content: ''; position: absolute; inset: 6px; background: #0f172a; border-radius: 50%; }
.radial-circle span { position: relative; z-index: 1; font-size: 15px; font-weight: 700; color: #fff; }

/* Activity Feed */
.activity-feed { max-height: 220px; overflow-y: auto; padding-right: 8px; }
.activity-feed::-webkit-scrollbar { width: 4px; }
.activity-feed::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.activity-item { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; align-items: flex-start; animation: slideInRight 0.3s ease-out forwards; }
.activity-item:last-child { border-bottom: none; }
@keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

.insights-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
.insight-item { padding: 12px 16px; background: rgba(0,0,0,0.2); border-left: 3px solid #6366f1; border-radius: 6px; display: flex; gap: 12px; align-items: flex-start; }
.insight-icon { font-size: 18px; margin-top: -2px; }
.insight-text { font-size: 13.5px; color: #e5e7eb; line-height: 1.4; }
.insight-time { font-size: 11px; color: #94a3b8; display: block; margin-top: 4px; }
</style>\n"""
content = css + content

# 3. Modify Page Header for global filters
header_orig = """<div class="page-header">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
    <div>
      <h2>Financial Overview</h2>
      <p class="lead muted">Track revenue, expenses, and profitability.</p>
    </div>
    <div style="display: flex; gap: 12px;">
      <button class="btn-premium" onclick="addTransaction()">➕ Add Transaction</button>
      <button class="btn-premium" onclick="downloadReport()">⬇️ Download Report</button>
    </div>
  </div>
</div>"""
header_new = """<div class="page-header">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
    <div>
      <h2>AI Financial Command Center</h2>
      <p class="lead muted">Dynamic CFO dashboard aggregating platform metrics into actionable financial intelligence.</p>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <select id="finGlobalFilter" class="form-input" style="font-size: 13px; padding: 8px 12px; width: auto; background: rgba(0,0,0,0.3);" onchange="applyFinancialFilter()">
        <option value="1">Last 30 Days</option>
        <option value="6" selected>Last 6 Months</option>
        <option value="12">Last 12 Months</option>
      </select>
      <button class="btn-premium" onclick="downloadFinancialReport()">⬇️ Export Investor Report</button>
    </div>
  </div>
</div>"""
content = content.replace(header_orig, header_new)

# 4. Replace hardcoded KPIs with interactive AI KPIs
kpi_grid_orig = content[content.find('<!-- AI Financial KPIs -->'):content.find('<!-- AI Profit Predictor Panel -->')]
kpi_grid_new = """<!-- Executive Intelligence Cards -->
<div class="kpi-grid-6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
  <div class="card kpi interactive-card" onclick="handleKpiClick('Total Revenue', 'totalRevenueYTD')">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #10b981, #059669);">💰</div>
    <div>
      <h3 class="kpi-title">Total Revenue</h3>
      <div class="kpi-value" id="finTotalRevenue">$0</div>
      <div class="kpi-meta"><span class="trend-up">+14.2%</span> <span class="muted" style="font-size: 12px;">growth trajectory</span></div>
    </div>
  </div>
  <div class="card kpi interactive-card" onclick="handleKpiClick('Monthly MRR', 'mrr')">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">📈</div>
    <div>
      <h3 class="kpi-title">MRR</h3>
      <div class="kpi-value" id="finMRR">$0</div>
      <div class="kpi-meta"><span class="trend-up">+8%</span> <span class="muted" style="font-size: 12px;">monthly recurring</span></div>
    </div>
  </div>
  <div class="card kpi interactive-card" onclick="handleKpiClick('Total Expenses', 'expenses')">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #ef4444, #b91c1c);">💸</div>
    <div>
      <h3 class="kpi-title">Total Expenses</h3>
      <div class="kpi-value" id="finTotalExpenses">$0</div>
      <div class="kpi-meta"><span class="trend-down">-1.5%</span> <span class="muted" style="font-size: 12px;">marketing adjusted</span></div>
    </div>
  </div>
  <div class="card kpi interactive-card" onclick="handleKpiClick('Net Profit', 'profit')">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">📊</div>
    <div>
      <h3 class="kpi-title">Net Profit</h3>
      <div class="kpi-value" id="finNetProfit">$0</div>
      <div class="kpi-meta"><span class="trend-up">Positive</span> <span class="muted" style="font-size: 12px;">margin</span></div>
    </div>
  </div>
  <div class="card kpi interactive-card" onclick="handleKpiClick('Burn Rate', 'burnRate')">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #f97316, #ea580c);">🔥</div>
    <div>
      <h3 class="kpi-title">Burn Rate</h3>
      <div class="kpi-value" id="finBurnRate">$0</div>
      <div class="kpi-meta"><span class="muted" style="font-size: 12px;">monthly runway impact</span></div>
    </div>
  </div>
  <div class="card kpi interactive-card" onclick="handleInvestorClick()">
    <div class="kpi-icon" style="background: linear-gradient(135deg, #22d3ee, #0891b2);">🎯</div>
    <div>
      <h3 class="kpi-title">Investor Readiness</h3>
      <div class="kpi-value" id="finInvestorScore">Loading...</div>
      <div class="kpi-meta"><span class="muted" style="font-size: 12px;">AI evaluated score</span></div>
    </div>
  </div>
</div>
"""
content = content.replace(kpi_grid_orig, kpi_grid_new)

# 5. Add Insights and Activity Feed
# Replace Predictor panel with Insights + Activity Feed layout
predictor_panel = content[content.find('<!-- AI Profit Predictor Panel -->'):content.find('<div class="grid two">')]
insights_activity_layout = """<!-- AI Intelligence and Predictor -->
<div class="grid three" style="margin-bottom: 24px; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
  <!-- Insights -->
  <div class="card">
    <h3>AI Financial Insights</h3>
    <p class="muted" style="font-size: 13px; margin-bottom: 16px; margin-top: 4px;">Dynamic CFO alerts and recommendations</p>
    <ul class="insights-list" id="finInsightsList">
      <!-- Populated via JS -->
    </ul>
  </div>
  <!-- Live Feed -->
  <div class="card">
    <h3>Live Financial Activity</h3>
    <p class="muted" style="font-size: 13px; margin-bottom: 16px; margin-top: 4px;">Real-time ecosystem events</p>
    <div class="activity-feed" id="finLiveActivityFeed">
      <!-- Populated via JS -->
    </div>
  </div>
  <!-- Profit Predictor -->
  <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3>🤖 AI Profit Predictor</h3>
          <p class="muted" style="font-size: 13px;">Predict startup profit using RF Regressor</p>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label class="muted" style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px;">R&D Spend (₹)</label>
          <input type="number" id="profitRD" placeholder="8300000" class="form-input" style="width: 100%; padding: 8px;" value="8300000">
        </div>
        <div>
          <label class="muted" style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px;">Administration (₹)</label>
          <input type="number" id="profitAdmin" placeholder="9960000" class="form-input" style="width: 100%; padding: 8px;" value="9960000">
        </div>
        <div>
          <label class="muted" style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px;">Marketing (₹)</label>
          <input type="number" id="profitMarketing" placeholder="24900000" class="form-input" style="width: 100%; padding: 8px;" value="24900000">
        </div>
      </div>
      <div style="margin-top: 16px;">
        <button class="btn-premium" style="width: 100%;" onclick="runProfitPredictorUI()">💰 Predict Profit</button>
      </div>
      <div id="profitPredictionResult" style="margin-top: 16px; display: none;">
        <div style="padding: 12px; border-radius: 8px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; font-size: 12px; color: #10b981;">AI Prediction</div>
            <div id="profitPredictionText" class="muted" style="font-size: 11px;"></div>
          </div>
          <div id="profitPredictionValue" style="font-size: 24px; font-weight: 800; color: #10b981;"></div>
        </div>
      </div>
  </div>
</div>
"""
content = content.replace(predictor_panel, insights_activity_layout)

# 6. Change Scenarios Chart to Expense Breakdown
grid_two_orig = """<div class="grid two">
  <!-- Chart Section -->
  <div class="card">
    <h3>Revenue vs Expenses</h3>
    <p class="muted" style="font-size: 13px; margin-top: 4px;">Monthly comparison (Last 6 months)</p>
    <div style="position: relative; height: 320px; width: 100%; margin-top: 16px;">
      <canvas id="financialsChart"></canvas>
    </div>
  </div>

  <!-- AI Scenarios Chart -->
  <div class="card">
    <h3>AI Profit Scenarios</h3>
    <p class="muted" style="font-size: 13px; margin-top: 4px;">Predicted profit for different spending strategies</p>
    <div style="position: relative; height: 320px; width: 100%; margin-top: 16px;">
      <canvas id="scenariosChart"></canvas>
    </div>
  </div>
</div>"""

grid_two_new = """<div class="grid three" style="margin-bottom: 24px;">
  <!-- Main Chart Section -->
  <div class="card" style="grid-column: span 2;">
    <h3>Revenue & Expense Trajectory</h3>
    <p class="muted" style="font-size: 13px; margin-top: 4px;">Monthly comparison projected backwards</p>
    <div style="position: relative; height: 320px; width: 100%; margin-top: 16px;">
      <canvas id="financialsChart"></canvas>
    </div>
  </div>

  <!-- Expense Breakdown -->
  <div class="card">
    <h3>Expense Breakdown</h3>
    <p class="muted" style="font-size: 13px; margin-top: 4px;">Capital allocation distribution</p>
    <div style="position: relative; height: 320px; width: 100%; margin-top: 16px;">
      <canvas id="expenseBreakdownChart"></canvas>
    </div>
  </div>
</div>

<div class="card" style="margin-bottom: 24px;">
    <h3>AI Profit Scenarios</h3>
    <p class="muted" style="font-size: 13px; margin-top: 4px;">Predicted profit mapping against different R&D/Marketing budget strategies.</p>
    <div style="position: relative; height: 300px; width: 100%; margin-top: 16px;">
      <canvas id="scenariosChart"></canvas>
    </div>
</div>"""
content = content.replace(grid_two_orig, grid_two_new)

# 7. Append Modals
modals = """
<!-- BI MODALS -->
<!-- KPI Details Modal -->
<div class="bi-modal" id="financialModal">
  <div class="bi-modal-content">
    <button class="bi-modal-close" onclick="FinancialModals.closeModal('financialModal')">&times;</button>
    <h3 id="finModalTitle" style="margin-bottom: 4px; font-size: 20px;">Financial Details</h3>
    <p class="muted" style="margin-bottom: 20px; font-size: 13px;">Historical trend projection</p>
    <div style="margin-bottom: 24px;">
      <div class="muted" style="font-size: 12px; text-transform: uppercase;">Current Value</div>
      <div id="finModalValue" style="font-size: 32px; font-weight: 700; color: #f8fafc; margin-top: 4px;">0</div>
    </div>
    <div style="position: relative; height: 250px; width: 100%;">
      <canvas id="finModalChart"></canvas>
    </div>
  </div>
</div>

<!-- Insight Details Modal -->
<div class="bi-modal" id="insightModal">
  <div class="bi-modal-content" style="max-width: 500px;">
    <button class="bi-modal-close" onclick="FinancialModals.closeModal('insightModal')">&times;</button>
    <div style="display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px;">
      <div style="font-size: 32px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px;">💡</div>
      <div>
        <h3 style="margin-bottom: 8px; font-size: 18px;">AI Financial Insight</h3>
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
  </div>
</div>

<!-- Investor Readiness Modal -->
<div class="bi-modal" id="investorModal">
  <div class="bi-modal-content">
    <button class="bi-modal-close" onclick="FinancialModals.closeModal('investorModal')">&times;</button>
    <h3 style="margin-bottom: 4px; font-size: 20px;">Investor Readiness Breakdown</h3>
    <p class="muted" style="margin-bottom: 20px; font-size: 13px;">Comprehensive component analysis for fundraising potential.</p>
    
    <div style="display: flex; gap: 24px; align-items: center; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
       <div>
         <div class="muted" style="font-size: 12px; text-transform: uppercase;">Total Score</div>
         <div id="invModalScore" style="font-size: 42px; font-weight: 800;">0/100</div>
       </div>
       <div>
         <div style="font-size: 14px;"><strong>Risk Level:</strong> <span id="invModalRisk"></span></div>
         <div style="font-size: 13px; margin-top: 4px; color: #94a3b8;" id="invModalRec"></div>
       </div>
    </div>

    <div class="radial-breakdown" id="invModalBreakdown">
      <!-- Populated via JS -->
    </div>
  </div>
</div>
"""
content = content + modals

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated financials.html.")
