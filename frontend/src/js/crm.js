// crm.js - High-End AI SaaS Customer Intelligence Dashboard

let saasCustomers = [];
let charts = {
 userGrowth: null,
 startupCategories: null,
 subscriptionDistribution: null,
 aiModuleUsage: null
};

// Colors for gradients
const avatarColors = [
 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
 'linear-gradient(135deg, #10b981, #059669)',
 'linear-gradient(135deg, #f59e0b, #d97706)',
 'linear-gradient(135deg, #ec4899, #db2777)',
 'linear-gradient(135deg, #6366f1, #4f46e5)'
];

function getAvatarStyle(name) {
 let hash = 0;
 for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
 const index = Math.abs(hash) % avatarColors.length;
 return avatarColors[index];
}

window.initCRMPage = function() {
 loadCustomers();
 renderLeads();
 updatePipelineStats();
 renderCRMCharts();
 populateBusinessInsightsSelect();
};

function loadCustomers() {
 const stored = localStorage.getItem("saasCustomers");
 if (stored) {
  saasCustomers = JSON.parse(stored);
  // Force migration if old western demo data is still in localStorage
  if (saasCustomers.length > 0 && saasCustomers[0].fullName === 'Elena Rodriguez') {
    saasCustomers = null; // force fallback below
  }
 } 
 
 if (!saasCustomers) {
  saasCustomers = [
   {
    id: 'user_1',
    fullName: 'Aarav Sharma',
    email: 'aarav@bharatai.in',
    startupName: 'BharatAI Solutions',
    startupIndustry: 'Data Science',
    subscriptionPlan: 'enterprise',
    joinedDate: new Date(Date.now() - 90 * 24*60*60*1000).toISOString(),
    activityLevel: 'Highly Active',
    aiToolsUsed: 4,
    status: 'Investor Ready',
    lastActive: new Date().toISOString(),
    forecastsCreated: 14,
    campaignsCreated: 8,
    segmentationReports: 5,
    crmInteractions: 120
   },
   {
    id: 'user_2',
    fullName: 'Priya Patil',
    email: 'priya@punetechlabs.in',
    startupName: 'PuneTech Labs',
    startupIndustry: 'Finance',
    subscriptionPlan: 'pro',
    joinedDate: new Date(Date.now() - 30 * 24*60*60*1000).toISOString(),
    activityLevel: 'Highly Active',
    aiToolsUsed: 3,
    status: 'High Growth Potential',
    lastActive: new Date().toISOString(),
    forecastsCreated: 6,
    campaignsCreated: 2,
    segmentationReports: 2,
    crmInteractions: 45
   },
   {
    id: 'user_3',
    fullName: 'Rohan Deshmukh',
    email: 'rohan@finedgeindia.in',
    startupName: 'FinEdge India',
    startupIndustry: 'Healthcare',
    subscriptionPlan: 'free',
    joinedDate: new Date(Date.now() - 5 * 24*60*60*1000).toISOString(),
    activityLevel: 'Moderate',
    aiToolsUsed: 1,
    status: 'Expansion Opportunity',
    lastActive: new Date(Date.now() - 2 * 24*60*60*1000).toISOString(),
    forecastsCreated: 1,
    campaignsCreated: 0,
    segmentationReports: 0,
    crmInteractions: 2
   }
  ];
  saveCustomersToStorage();
 }
}

function saveCustomersToStorage() {
 localStorage.setItem("saasCustomers", JSON.stringify(saasCustomers));
}

// AI Lead Scoring Logic
function calculateAIScore(customer) {
 let score = 0;
 if (customer.subscriptionPlan === 'enterprise') score += 20;
 else if (customer.subscriptionPlan === 'pro') score += 15;
 
 if (customer.forecastsCreated > 5) score += 15;
 else if (customer.forecastsCreated > 0) score += 5;
 
 if (customer.crmInteractions > 20) score += 15;
 else if (customer.crmInteractions > 5) score += 5;
 
 if (customer.activityLevel === 'Highly Active') score += 20;
 else if (customer.activityLevel === 'Moderate') score += 10;
 
 if (customer.aiToolsUsed > 2) score += 10;
 
 const enterpriseKeywords = ['enterprise', 'global', 'corp'];
 const nameLower = (customer.startupName || '').toLowerCase();
 if (enterpriseKeywords.some(kw => nameLower.includes(kw))) {
  score += 20;
 }
 return Math.min(score, 100);
}

function getScoreBar(score) {
 let barClass = 'ai-score-cold';
 let color = '#3b82f6';
 if (score >= 71) { barClass = 'ai-score-hot'; color = '#ef4444'; }
 else if (score >= 41) { barClass = 'ai-score-active'; color = '#f59e0b'; }
 
 return `
  <div style="display:flex; align-items:center; gap:8px;">
   <span style="color: ${color}; font-weight:600; min-width: 24px;">${score}</span>
   <div class="ai-score-bar-bg">
    <div class="ai-score-bar-fill ${barClass}" style="width: ${score}%;"></div>
   </div>
  </div>
 `;
}

function getPlanBadge(plan) {
 switch(plan) {
  case 'enterprise': return `<span class="badge" style="color:#8b5cf6; background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.3); box-shadow: 0 0 10px rgba(139,92,246,0.2);">Enterprise</span>`;
  case 'pro': return `<span class="badge" style="color:#10b981; background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.3);">Pro</span>`;
  default: return `<span class="badge" style="color:#64748b; background:rgba(100,116,139,0.15); border-color:rgba(100,116,139,0.3);">Free</span>`;
 }
}

function getActivityBadge(activity) {
 if (activity === 'Highly Active') return `<span class="badge" style="color:#10b981; background:rgba(16,185,129,0.1); border:none;"> Highly Active</span>`;
 if (activity === 'Moderate') return `<span class="badge" style="color:#f59e0b; background:rgba(245,158,11,0.1); border:none;"> Moderate</span>`;
 return `<span class="badge" style="color:#ef4444; background:rgba(239,68,68,0.1); border:none;"> Inactive</span>`;
}

function getHealthStatus(customer, score) {
 if (score > 70 && customer.activityLevel === 'Highly Active') return `<span style="color:#10b981; font-weight:600;">Healthy <i data-lucide="heart" class="icon-sm text-red-500"></i></span>`;
 if (score > 40 && customer.forecastsCreated > 0) return `<span style="color:#3b82f6; font-weight:600;">Growing <i data-lucide="trending-up" class="icon-sm text-green-500"></i></span>`;
 if (customer.activityLevel === 'Inactive') return `<span style="color:#ef4444; font-weight:600;">At Risk <i data-lucide="alert-triangle" class="icon-sm text-amber-500"></i></span>`;
 return `<span style="color:#f59e0b; font-weight:600;">Needs Attention </span>`;
}

window.renderLeads = function() {
 const tbody = document.getElementById('leadsTableBody');
 if (!tbody) return;
 tbody.innerHTML = '';
 
 const stageFilter = document.getElementById('filterStage') ? document.getElementById('filterStage').value : 'all';
 const search = document.getElementById('searchLead') ? document.getElementById('searchLead').value.toLowerCase() : '';
 
 let filtered = saasCustomers;
 if (stageFilter !== 'all') {
  filtered = filtered.filter(l => l.status.toLowerCase() === stageFilter.toLowerCase());
 }
 if (search) {
  filtered = filtered.filter(l => 
   l.fullName.toLowerCase().includes(search) || 
   l.startupName.toLowerCase().includes(search) ||
   l.email.toLowerCase().includes(search)
  );
 }
 
 if (filtered.length === 0) {
  tbody.innerHTML = `
   <tr>
    <td colspan="7" style="text-align: center; padding: 60px 20px;">
     <div style="font-size: 40px; margin-bottom: 16px;"></div>
     <h3 style="margin-bottom: 8px;">No Startups Found</h3>
     <p class="muted" style="margin-bottom: 24px;">No matching SaaS users in the platform.</p>
    </td>
   </tr>
  `;
  return;
 }
 
 filtered.forEach(customer => {
  const score = calculateAIScore(customer);
  const lastActiveDate = new Date(customer.lastActive).toLocaleDateString();
  const initials = customer.startupName.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  
  const tr = document.createElement('tr');
  tr.style.cursor = 'pointer';
  tr.className = 'fade-in glass-row';
  tr.onclick = (e) => {
   if (!e.target.closest('.actions')) {
    window.openCustomerProfile(customer.id);
   }
  };
  
  tr.innerHTML = `
   <td>
    <div style="display:flex; align-items:center;">
     <div class="crm-avatar" style="background: ${getAvatarStyle(customer.startupName)};">${initials}</div>
     <div>
      <strong>${customer.startupName}</strong><br>
      <span style="font-size: 11px; display: inline-block; margin-top: 2px;" class="muted">${customer.fullName} • ${customer.email}</span>
     </div>
    </div>
   </td>
   <td>${getPlanBadge(customer.subscriptionPlan)}</td>
   <td>${getActivityBadge(customer.activityLevel)}</td>
   <td>${getHealthStatus(customer, score)}</td>
   <td>${getScoreBar(score)}</td>
   <td style="text-align: right;" class="muted">${lastActiveDate}</td>
   <td style="text-align: center;" class="actions">
    <button class="btn-premium" onclick="window.editLead('${customer.id}')">Edit</button>
    <button class="btn-premium" style=" " onclick="window.deleteLead('${customer.id}')">Del</button>
   </td>
  `;
  tbody.appendChild(tr);
 });
};

window.filterLeads = function() {
 renderLeads();
};

let editingLeadId = null;

window.openAddLeadModal = function() {
 editingLeadId = null;
 document.getElementById('leadName').value = '';
 document.getElementById('leadEmail').value = '';
 document.getElementById('leadCompany').value = '';
 document.getElementById('leadIndustry').value = '';
 document.getElementById('leadPlan').value = 'free';
 document.getElementById('leadActivity').value = 'Moderate';
 document.getElementById('leadStage').value = 'New Signup';
 document.getElementById('leadForecasts').value = '0';
 document.getElementById('leadNotes').value = '';
 
 const modalTitle = document.querySelector('#modalAddLead h3');
 if (modalTitle) modalTitle.textContent = 'Add Startup';
 
 const submitBtn = document.querySelector('#modalAddLead button[type="submit"]');
 if (submitBtn) submitBtn.innerHTML = '<i data-lucide="check-circle-2" class="icon-sm text-green-500"></i> Add Startup';
 
 document.getElementById('modalAddLead').classList.add('open');
};

window.closeAddLeadModal = function() {
 document.getElementById('modalAddLead').classList.remove('open');
};

window.handleAddLead = function(e) {
 e.preventDefault();
 
 const leadData = {
  fullName: document.getElementById('leadName').value,
  email: document.getElementById('leadEmail').value,
  startupName: document.getElementById('leadCompany').value,
  startupIndustry: document.getElementById('leadIndustry').value,
  subscriptionPlan: document.getElementById('leadPlan').value,
  activityLevel: document.getElementById('leadActivity').value,
  status: document.getElementById('leadStage').value,
  forecastsCreated: parseInt(document.getElementById('leadForecasts').value) || 0,
  notes: document.getElementById('leadNotes').value,
  lastActive: new Date().toISOString()
 };
 
 if (editingLeadId) {
  const index = saasCustomers.findIndex(l => l.id === editingLeadId);
  if (index !== -1) {
   saasCustomers[index] = { ...saasCustomers[index], ...leadData };
  }
 } else {
  saasCustomers.push({
   id: 'user_' + Date.now(),
   joinedDate: new Date().toISOString(),
   aiToolsUsed: 1,
   campaignsCreated: 0,
   segmentationReports: 0,
   crmInteractions: 0,
   ...leadData
  });
 }
 
 saveCustomersToStorage();
 window.closeAddLeadModal();
 renderLeads();
 updatePipelineStats();
 renderCRMCharts();
 populateBusinessInsightsSelect();
};

window.editLead = function(id) {
 const customer = saasCustomers.find(l => l.id === id);
 if (!customer) return;
 
 editingLeadId = id;
 document.getElementById('leadName').value = customer.fullName || '';
 document.getElementById('leadEmail').value = customer.email || '';
 document.getElementById('leadCompany').value = customer.startupName || '';
 document.getElementById('leadIndustry').value = customer.startupIndustry || '';
 document.getElementById('leadPlan').value = customer.subscriptionPlan || 'free';
 document.getElementById('leadActivity').value = customer.activityLevel || 'Moderate';
 document.getElementById('leadStage').value = customer.status || 'New Signup';
 document.getElementById('leadForecasts').value = customer.forecastsCreated || 0;
 document.getElementById('leadNotes').value = customer.notes || '';
 
 const modalTitle = document.querySelector('#modalAddLead h3');
 if (modalTitle) modalTitle.textContent = 'Edit Startup Profile';
 
 const submitBtn = document.querySelector('#modalAddLead button[type="submit"]');
 if (submitBtn) submitBtn.innerHTML = ' Save Changes';
 
 document.getElementById('modalAddLead').classList.add('open');
};

window.deleteLead = function(id) {
 if (confirm("Are you sure you want to delete this startup?")) {
  saasCustomers = saasCustomers.filter(l => l.id !== id);
  saveCustomersToStorage();
  renderLeads();
  updatePipelineStats();
  renderCRMCharts();
  populateBusinessInsightsSelect();
 }
};

/* ==============================================================
  AI BUSINESS INSIGHTS SECTION
============================================================== */
function populateBusinessInsightsSelect() {
 const select = document.getElementById('insightsCustomerSelect');
 if (!select) return;
 
 select.innerHTML = '<option value="">Select Startup...</option>';
 saasCustomers.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c.id;
  opt.textContent = c.startupName;
  select.appendChild(opt);
 });
 
 if(saasCustomers.length > 0) {
  select.value = saasCustomers[0].id;
  window.loadBusinessInsights();
 }
}

window.loadBusinessInsights = function() {
 const select = document.getElementById('insightsCustomerSelect');
 const container = document.getElementById('businessInsightsContainer');
 if (!select || !container) return;
 
 const customerId = select.value;
 if (!customerId) {
  container.innerHTML = '<p class="muted" style="padding: 20px 0;">Select a startup to generate AI intelligence insights...</p>';
  return;
 }
 
 const c = saasCustomers.find(l => l.id === customerId);
 const score = calculateAIScore(c);
 
 // Dynamic metrics
 let churnRisk = 45;
 let retention = 55;
 
 if (score > 70) { churnRisk = Math.max(5, 20 - (c.forecastsCreated)); retention = 100 - churnRisk; }
 else if (score > 40) { churnRisk = 30; retention = 70; }
 else { churnRisk = 75; retention = 25; }
 
 let actionRec = "";
 if (c.subscriptionPlan === 'free' && score > 40) actionRec = `Recommend upgrading to <strong>Pro Plan</strong>. Forecast usage is at capacity.`;
 else if (c.subscriptionPlan === 'pro' && score > 60) actionRec = `Recommend upgrading to <strong>Enterprise Plan</strong>. High engagement detected.`;
 else if (c.activityLevel === 'Inactive') actionRec = `Send automated re-engagement drip sequence. Highlight new AI features.`;
 else actionRec = `Encourage exploring the Customer Segmentation tool to increase stickiness.`;
 
 let engagementTrend = score > 60 ? ' Increasing (+12%)' : (score > 40 ? '→ Stable' : ' Declining (-8%)');

 container.innerHTML = `
  <div class="insight-card">
   <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Churn Risk</div>
   <div style="font-size: 24px; font-weight: 700; color: ${churnRisk > 50 ? '#ef4444' : '#10b981'}; margin: 8px 0;">${churnRisk}%</div>
   <div class="muted" style="font-size: 13px;">Retention Prob: ${retention}%</div>
  </div>
  <div class="insight-card">
   <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Engagement Trend</div>
   <div style="font-size: 20px; font-weight: 700; color: #f8fafc; margin: 8px 0;">${engagementTrend}</div>
   <div class="muted" style="font-size: 13px;">Based on 30-day activity</div>
  </div>
  <div class="insight-card">
   <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Upgrade Probability</div>
   <div style="font-size: 20px; font-weight: 700; color: #8b5cf6; margin: 8px 0;">${c.subscriptionPlan === 'enterprise' ? 'Optimized' : (score > 50 ? 'High' : 'Low')}</div>
   <div class="muted" style="font-size: 13px;">Based on feature adoption</div>
  </div>
  <div class="insight-card" style="grid-column: 1 / -1; background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.3);">
   <div class="muted" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">AI Strategic Recommendation</div>
   <div style="font-size: 15px; color: #f8fafc;">${c.startupName} is ${c.activityLevel.toLowerCase()}. ${actionRec}</div>
  </div>
 `;
};

/* ==============================================================
  CUSTOMER PROFILE MODAL
============================================================== */
window.openCustomerProfile = function(id) {
 const customer = saasCustomers.find(l => l.id === id);
 if (!customer) return;
 
 const score = calculateAIScore(customer);
 const initials = customer.startupName.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
 
 // Header
 document.getElementById('modalProfileHeader').innerHTML = `
  <div class="crm-avatar" style="width: 56px; height: 56px; font-size: 20px; background: ${getAvatarStyle(customer.startupName)};">${initials}</div>
  <div>
   <h2 style="margin: 0 0 4px 0; font-size: 22px; color: #f8fafc; display: flex; align-items: center; gap: 12px;">
    ${customer.startupName} ${getPlanBadge(customer.subscriptionPlan)}
   </h2>
   <div class="muted" style="font-size: 14px;">
    ${customer.startupIndustry || 'Unknown Industry'} • Joined ${new Date(customer.joinedDate).toLocaleDateString()}
   </div>
  </div>
 `;
 
 // Analytics
 document.getElementById('modalProfileAnalytics').innerHTML = `
  <div>
   <div class="muted" style="font-size: 12px;">AI Score</div>
   <div style="margin-top: 4px;">${getScoreBar(score)}</div>
  </div>
  <div>
   <div class="muted" style="font-size: 12px;">Activity Level</div>
   <div style="margin-top: 4px;">${getActivityBadge(customer.activityLevel)}</div>
  </div>
  <div style="margin-top: 12px;">
   <div class="muted" style="font-size: 12px;">Forecasts Generated</div>
   <div style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${customer.forecastsCreated}</div>
  </div>
  <div style="margin-top: 12px;">
   <div class="muted" style="font-size: 12px;">Campaigns Launched</div>
   <div style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${customer.campaignsCreated}</div>
  </div>
 `;
 
 // Insights
 let churnRisk = score > 70 ? 12 : (score > 40 ? 35 : 75);
 document.getElementById('modalProfileInsights').innerHTML = `
  <p style="margin: 0 0 12px 0;"><strong>Health Status:</strong> ${getHealthStatus(customer, score)}</p>
  <p style="margin: 0 0 12px 0;"><strong>Churn Prediction:</strong> ${churnRisk}% risk. Retention probability is ${100 - churnRisk}%.</p>
  <p style="margin: 0;"><strong>Action Required:</strong> ${score > 60 ? 'Schedule Enterprise demo call.' : 'Send re-engagement email sequence focusing on predictive forecasting.'}</p>
 `;
 
 // Timeline (Deterministic generation based on joined date)
 const timelineEl = document.getElementById('modalProfileTimeline');
 timelineEl.innerHTML = '';
 
 let events = [];
 const joinT = new Date(customer.joinedDate).getTime();
 const nowT = new Date().getTime();
 
 events.push({ text: 'Account Created', date: new Date(joinT) });
 
 if (customer.subscriptionPlan !== 'free') {
  events.push({ text: `Upgraded to ${customer.subscriptionPlan} Plan`, date: new Date(joinT + 86400000 * 2) });
 }
 
 if (customer.forecastsCreated > 0) {
  events.push({ text: 'Generated Sales Forecast', date: new Date(joinT + 86400000 * 5) });
 }
 
 if (customer.campaignsCreated > 0) {
  events.push({ text: 'Launched AI Campaign', date: new Date(joinT + 86400000 * 10) });
 }
 
 if (customer.activityLevel !== 'Inactive') {
  events.push({ text: 'Logged into SaaS Platform', date: new Date(nowT - 86400000 * 1) });
 }
 
 // Sort and render
 events.sort((a,b) => b.date - a.date);
 
 events.forEach(ev => {
  timelineEl.innerHTML += `
   <div class="timeline-item">
    <div style="font-weight: 500; color: #e2e8f0; font-size: 14px;">${ev.text}</div>
    <div class="muted" style="font-size: 12px; margin-top: 2px;">${ev.date.toLocaleDateString()} at ${ev.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
   </div>
  `;
 });
 
 // Notes
 const notesContainer = document.getElementById('modalProfileNotesContainer');
 if (customer.notes) {
  notesContainer.innerHTML = `
   <div style="padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.1);">
    <h4 style="margin-top: 0; margin-bottom: 12px; color: #94a3b8; font-size: 14px;">Admin Notes</h4>
    <p class="muted" style="margin: 0; white-space: pre-wrap; font-size: 13px;">${customer.notes}</p>
   </div>
  `;
 } else {
  notesContainer.innerHTML = '';
 }
 
 document.getElementById('modalCustomerProfile').classList.add('open');
};

window.closeCustomerProfileModal = function() {
 document.getElementById('modalCustomerProfile').classList.remove('open');
};

// Update Pipeline Stats & Charts remain same logic
function updatePipelineStats() {
 const counts = { 'New Signup': 0, 'Active User': 0, 'Premium Prospect': 0, 'Enterprise Client': 0, 'Loyal Customer': 0 };
 let premiumCount = 0;
 let enterpriseCount = 0;
 saasCustomers.forEach(customer => {
  if (counts[customer.status] !== undefined) counts[customer.status]++;
  if (customer.subscriptionPlan === 'pro' || customer.subscriptionPlan === 'enterprise') premiumCount++;
  if (customer.subscriptionPlan === 'enterprise') enterpriseCount++;
 });
 
 if (document.getElementById('countSignup')) document.getElementById('countSignup').textContent = counts['New Signup'];
 if (document.getElementById('countActive')) document.getElementById('countActive').textContent = counts['Active User'];
 if (document.getElementById('countPremium')) document.getElementById('countPremium').textContent = counts['Premium Prospect'];
 if (document.getElementById('countEnterprise')) document.getElementById('countEnterprise').textContent = counts['Enterprise Client'];
 if (document.getElementById('countLoyal')) document.getElementById('countLoyal').textContent = counts['Loyal Customer'];
 if (document.getElementById('kpiTotalStartups')) document.getElementById('kpiTotalStartups').textContent = saasCustomers.length;
 const activeCount = saasCustomers.filter(c => c.activityLevel !== 'Inactive').length;
 if (document.getElementById('kpiActiveUsers')) document.getElementById('kpiActiveUsers').textContent = activeCount;
 if (document.getElementById('kpiPremium')) document.getElementById('kpiPremium').textContent = premiumCount;
 if (document.getElementById('kpiEnterprise')) document.getElementById('kpiEnterprise').textContent = enterpriseCount;
}

function renderCRMCharts() {
 if (!window.Chart) return;
 const ctxGrowth = document.getElementById('userGrowthChart');
 if (ctxGrowth) {
  if (charts.userGrowth) charts.userGrowth.destroy();
  charts.userGrowth = new Chart(ctxGrowth, {
   type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Signups', data: [12, 19, 35, 48, 62, Math.max(70, saasCustomers.length * 5)], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] },
   options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Startup Growth', color: '#f8fafc', font: { family: "'Google Sans', sans-serif", size: 14 } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
  });
 }
 const ctxCat = document.getElementById('startupCategoriesChart');
 if (ctxCat) {
  const industries = {};
  saasCustomers.forEach(c => { const ind = c.startupIndustry || 'Other'; industries[ind] = (industries[ind] || 0) + 1; });
  if (charts.startupCategories) charts.startupCategories.destroy();
  charts.startupCategories = new Chart(ctxCat, {
   type: 'doughnut', data: { labels: Object.keys(industries), datasets: [{ data: Object.values(industries), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'], borderWidth: 0, hoverOffset: 4 }] },
   options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#e2e8f0', boxWidth: 12, font: { size: 11 } } }, title: { display: true, text: 'Industry Distribution', color: '#f8fafc', font: { family: "'Google Sans', sans-serif", size: 14 } } }, cutout: '70%' }
  });
 }
 const ctxPlan = document.getElementById('subscriptionDistributionChart');
 if (ctxPlan) {
  const plans = { 'Free': 0, 'Pro': 0, 'Enterprise': 0 };
  saasCustomers.forEach(c => { if (c.subscriptionPlan === 'enterprise') plans['Enterprise']++; else if (c.subscriptionPlan === 'pro') plans['Pro']++; else plans['Free']++; });
  if (charts.subscriptionDistribution) charts.subscriptionDistribution.destroy();
  charts.subscriptionDistribution = new Chart(ctxPlan, {
   type: 'pie', data: { labels: Object.keys(plans), datasets: [{ data: Object.values(plans), backgroundColor: ['#64748b', '#10b981', '#8b5cf6'], borderWidth: 0, hoverOffset: 4 }] },
   options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0' } }, title: { display: true, text: 'Subscription Tier', color: '#f8fafc', font: { family: "'Google Sans', sans-serif", size: 14 } } } }
  });
 }
 const ctxAi = document.getElementById('aiModuleUsageChart');
 if (ctxAi) {
  let forecastUses = 0; let campaignUses = 0; let segmentationUses = 0; let crmUses = 0;
  saasCustomers.forEach(c => { forecastUses += (c.forecastsCreated || 0); campaignUses += (c.campaignsCreated || 0); segmentationUses += (c.segmentationReports || 0); crmUses += (c.crmInteractions || 0); });
  if (charts.aiModuleUsage) charts.aiModuleUsage.destroy();
  charts.aiModuleUsage = new Chart(ctxAi, {
   type: 'bar', data: { labels: ['Forecasts', 'Campaigns', 'Segmentation', 'CRM'], datasets: [{ label: 'Platform Events', data: [Math.max(forecastUses, 12), Math.max(campaignUses, 8), Math.max(segmentationUses, 5), Math.max(crmUses, 15)], backgroundColor: '#3b82f6', borderRadius: 4 }] },
   options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Platform AI Adoption', color: '#f8fafc', font: { family: "'Google Sans', sans-serif", size: 14 } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
  });
 }
}
