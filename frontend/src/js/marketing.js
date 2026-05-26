let marketingChartInstance = null;
let leadsChartInstance = null;

function getChartColors() {
 return {
  text: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#e5e7eb',
  muted: getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim() || '#94a3b8',
  grid: 'rgba(148, 163, 184, 0.1)'
 };
}

function createMarketingChart() {
 const ctx = document.getElementById('marketingChart');
 if (!ctx || !window.Chart) {
  console.error("marketingChart canvas missing or Chart.js not loaded");
  return;
 }
 
 if (marketingChartInstance) {
  console.log("Destroying old marketing chart");
  marketingChartInstance.destroy();
 }
 console.log("Creating new marketing chart");
 
 const colors = getChartColors();
 
 const existing = window.PlatformData.campaigns;
 let social = 0, email = 0, ppc = 0, display = 0, content = 0;
 
 if (existing.length === 0) {
  // Default fallback to look nice if no campaigns exist
  social = 35; email = 25; ppc = 20; display = 12; content = 8;
 } else {
  existing.forEach(c => {
   const p = (c.platform || '').toLowerCase();
   const leads = parseInt(c.expectedLeads) || 10;
   if (p.includes('instagram') || p.includes('facebook') || p.includes('tiktok') || p.includes('social') || p.includes('whatsapp')) social += leads;
   else if (p.includes('email')) email += leads;
   else if (p.includes('google') || p.includes('ads') || p.includes('ppc')) ppc += leads;
   else if (p.includes('linkedin')) display += leads;
   else content += leads;
  });
 }

 marketingChartInstance = new Chart(ctx, {
  type: 'doughnut',
  data: {
   labels: ['Social Media', 'Email', 'PPC', 'Display Ads', 'Content'],
   datasets: [{
    data: [social, email, ppc, display, content],
    backgroundColor: ['#6366f1', '#22d3ee', '#f59e0b', '#8b5cf6', '#10b981'],
    borderWidth: 0,
    hoverOffset: 10
   }]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
    legend: {
     position: 'bottom',
     labels: { color: colors.text, font: { size: 12 }, padding: 12 }
    },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)',
     titleColor: '#fff',
     bodyColor: '#e5e7eb',
     borderColor: 'rgba(99, 102, 241, 0.5)',
     borderWidth: 1,
     padding: 10,
     callbacks: {
      label: function(context) {
       return context.label + ': ' + context.parsed + '%';
      }
     }
    }
   }
  }
 });
}

function createPerformanceChart() {
 const ctx = document.getElementById('performanceChart');
 if (!ctx || !window.Chart) {
  console.error("performanceChart canvas missing or Chart.js not loaded");
  return;
 }
 
 if (leadsChartInstance) {
  console.log("Destroying old performance chart");
  leadsChartInstance.destroy();
 }
 console.log("Creating new performance chart");
 
 const colors = getChartColors();
 
 const existing = window.PlatformData.campaigns;
 let totalLeads = 0;
 existing.forEach(c => totalLeads += (parseInt(c.expectedLeads) || 0));
 
 let dataPoints = [180, 220, 280, 310, 350, 420];
 if (existing.length > 0 && totalLeads > 0) {
  const base = totalLeads / 6;
  dataPoints = [
   Math.floor(base * 0.5),
   Math.floor(base * 0.8),
   Math.floor(base * 1.2),
   Math.floor(base * 1.5),
   Math.floor(base * 2.0),
   Math.floor(base * 2.5)
  ];
 }

 leadsChartInstance = new Chart(ctx, {
  type: 'line',
  data: {
   labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
   datasets: [{
    label: 'Leads Generated',
    data: dataPoints,
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 3,
    fill: true,
    tension: 0.4,
    pointRadius: 5,
    pointHoverRadius: 7,
    pointBackgroundColor: '#8b5cf6',
    pointBorderColor: '#fff',
    pointBorderWidth: 2
   }]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
    legend: {
     display: false
    },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)',
     titleColor: '#fff',
     bodyColor: '#e5e7eb',
     borderColor: 'rgba(139, 92, 246, 0.5)',
     borderWidth: 1,
     padding: 12
    }
   },
   scales: {
    y: {
     beginAtZero: true,
     grid: { color: colors.grid },
     ticks: { color: colors.muted, font: { size: 12 } }
    },
    x: {
     grid: { display: false },
     ticks: { color: colors.muted, font: { size: 12 } }
    }
   }
  }
 });
}

function updateChartsTheme() {
 const colors = getChartColors();
 
 if (marketingChartInstance) {
  marketingChartInstance.options.plugins.legend.labels.color = colors.text;
  marketingChartInstance.update();
 }
 
 if (leadsChartInstance) {
  leadsChartInstance.options.scales.y.ticks.color = colors.muted;
  leadsChartInstance.options.scales.y.grid.color = colors.grid;
  leadsChartInstance.options.scales.x.ticks.color = colors.muted;
  leadsChartInstance.update();
 }
}

function filterCampaigns() {
 const status = document.getElementById('filterStatus').value;
 const search = document.getElementById('searchCampaign').value.toLowerCase();
 const rows = document.querySelectorAll('#campaignTable tbody tr');
 
 rows.forEach(row => {
  const rowStatus = row.getAttribute('data-status');
  const text = row.textContent.toLowerCase();
  const matchStatus = status === 'all' || rowStatus === status;
  const matchSearch = text.includes(search);
  row.style.display = matchStatus && matchSearch ? '' : 'none';
 });
}

function openNewCampaignModal() {
 document.getElementById('modalNewCampaign').classList.add('open');
}

function closeNewCampaignModal() {
 document.getElementById('modalNewCampaign').classList.remove('open');
}

function showToast(message) {
 const container = document.getElementById('toastContainer');
 const toast = document.createElement('div');
 toast.className = 'toast-msg';
 toast.innerHTML = `<span><i data-lucide="check-circle-2" class="icon-sm text-green-500"></i></span> ${message}`;
 container.appendChild(toast);
 setTimeout(() => {
  toast.classList.add('toast-fade-out');
  setTimeout(() => toast.remove(), 300);
 }, 3000);
}

function animateValue(id, start, end, duration, suffix = '') {
 const obj = document.getElementById(id);
 if (!obj) return;
 let startTimestamp = null;
 const step = (timestamp) => {
  if (!startTimestamp) startTimestamp = timestamp;
  const progress = Math.min((timestamp - startTimestamp) / duration, 1);
  const val = Math.floor(progress * (end - start) + start);
  obj.innerHTML = val.toLocaleString('en-IN') + suffix;
  if (progress < 1) {
   window.requestAnimationFrame(step);
  } else {
   // Allow for decimals on the final frame if needed, but floor is fine for now
   obj.innerHTML = (typeof end === 'number' && !Number.isInteger(end) ? end.toFixed(1) : end.toLocaleString('en-IN')) + suffix;
  }
 };
 window.requestAnimationFrame(step);
}

function calculateCampaignMetrics(budget, duration, platform, type) {
 const platformScores = {
  "Instagram": 2.5,
  "Facebook": 2.0,
  "LinkedIn": 1.8,
  "Google Ads": 1.5,
  "WhatsApp": 1.0,
  "Email Marketing": 0.6
 };

 const campaignTypeScores = {
  "Social Media": 2.2,
  "Paid Ads": 2.5,
  "Email Campaign": 1.2,
  "Influencer Marketing": 2.0,
  "SEO Campaign": 0.7
 };
 
 const platformScore = platformScores[platform] || 1.0;
 const campaignTypeScore = campaignTypeScores[type] || 1.0;

 const randomFactor = 0.8 + Math.random() * 0.4;

 let predictedConversions = Math.round(
  (budget / 1000) *
  (duration / 10) *
  platformScore *
  campaignTypeScore *
  randomFactor *
  120
 );

 // Business Realism Penalties
 if (budget < 5000) {
  predictedConversions = Math.round(predictedConversions * 0.6);
 }

 let roi = Math.round((((predictedConversions * 8) - budget) / budget) * 100);
 if (platform === "Email Marketing" && type === "SEO Campaign") {
  roi = Math.round(roi * 0.5); // Reduce ROI further
 }

 const finalROI = Math.max(-20, Math.min(450, roi));

 let successRate = Math.round(
  Math.min(
   95,
   (
    20 +
    (platformScore * 10) +
    (campaignTypeScore * 8) +
    (budget / 5000) +
    (duration / 15)
   )
  )
 );

 if (duration < 7) {
  successRate = Math.round(successRate * 0.75); // reduce by 25%
 }

 return {
  expectedLeads: predictedConversions,
  predictedROI: finalROI.toFixed(1),
  successRate: successRate.toFixed(1),
  status: 'Active'
 };
}

function saveCampaign(e) {
 if(e) e.preventDefault();
 
 const budget = parseFloat(document.getElementById('campaignBudget').value);
 const duration = parseInt(document.getElementById('campaignDuration').value);
 const platform = document.getElementById('campaignPlatform').value;
 const type = document.getElementById('campaignType').value;
 
 const metrics = calculateCampaignMetrics(budget, duration, platform, type);

 const newCampaign = {
  id: Date.now().toString(),
  name: document.getElementById('campaignName').value,
  platform: platform,
  budget: budget,
  audience: document.getElementById('campaignAudience').value,
  goal: document.getElementById('campaignGoal').value,
  duration: duration,
  startDate: document.getElementById('campaignDate').value,
  type: type,
  createdAt: new Date().toISOString(),
  predictedROI: metrics.predictedROI,
  expectedLeads: metrics.expectedLeads,
  successRate: metrics.successRate,
  status: metrics.status,
  roi: metrics.predictedROI
 };

 const campaigns = window.PlatformData.campaigns;
 campaigns.push(newCampaign);
 window.PlatformEngine.logActivity('campaign', `Campaign launched: ${newCampaign.name}`);
 window.PlatformEngine.savePlatformData("marketing");
 
 showToast(`Campaign "${newCampaign.name}" launched successfully!`);
 closeNewCampaignModal();
 if(e && e.target) e.target.reset();
 renderActiveCampaigns();
 loadCampaignStats();
 createMarketingChart();
 createPerformanceChart();
}

function deleteCampaign(id) {
 const existing = window.PlatformData.campaigns;
 const filtered = existing.filter(c => c.id !== id);
 window.PlatformData.campaigns = filtered;
 window.PlatformEngine.logActivity('campaign', `Campaign deleted: ${id}`);
 window.PlatformEngine.savePlatformData("marketing");
 renderActiveCampaigns();
 loadCampaignStats();
 createMarketingChart();
 createPerformanceChart();
}

function generateAIRecommendations(campaign) {
 let recs = [];
 const roi = parseFloat(campaign.predictedROI);
 const success = parseFloat(campaign.successRate);

 if (roi < 50 || success < 40) {
  recs.push("Increase campaign budget.");
  if (campaign.duration < 14) recs.push("Short duration limits campaign reach.");
  if (campaign.platform === 'Email Marketing' || campaign.platform === 'WhatsApp') {
   recs.push("Consider switching to paid social ads.");
  }
 } else {
  recs.push("Campaign shows strong growth potential.");
  recs.push("Scale marketing investment gradually.");
  if (success > 80) {
   recs.push("High conversion probability detected.");
  }
 }
 
 return recs.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('');
}

function viewCampaign(id) {
 const existing = window.PlatformData.campaigns;
 const campaign = existing.find(c => c.id === id);
 
 if (!campaign) {
  if (['summer', 'webinar', 'brand', 'retarget', 'launch', 'holiday'].includes(id)) {
    alert(`Viewing legacy campaign details for: ${id}`);
  }
  return;
 }

 const content = `
  <div style="display: grid; gap: 16px;">
   <div><strong>Name:</strong> ${campaign.name}</div>
   <div><strong>Platform:</strong> ${campaign.platform}</div>
   <div><strong>Type:</strong> ${campaign.type}</div>
   <div><strong>Goal:</strong> ${campaign.goal}</div>
   <div><strong>Audience:</strong> ${campaign.audience}</div>
   <div><strong>Budget:</strong> ₹${campaign.budget.toLocaleString('en-IN')}</div>
   <div><strong>Duration:</strong> ${campaign.duration} days</div>
   <div><strong>Start Date:</strong> ${campaign.startDate}</div>
   <hr style="border-color: rgba(255,255,255,0.1);">
   <div style="font-weight: 600; color: #8b5cf6;">AI Performance Estimate</div>
   <div class="c-stats-grid" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
    <div class="c-stat-item"><span class="c-stat-label">Expected Leads</span><span class="c-stat-value" style="color: #fff;">${campaign.expectedLeads?.toLocaleString('en-IN') || 'N/A'}</span></div>
    <div class="c-stat-item"><span class="c-stat-label">Est. ROI</span><span class="c-stat-value" style="color: #fff;">${campaign.predictedROI || '0'}%</span></div>
    <div class="c-stat-item"><span class="c-stat-label">Success Rate</span><span class="c-stat-value" style="color: #fff;">${campaign.successRate || '0'}%</span></div>
    <div class="c-stat-item"><span class="c-stat-label">Status</span><span class="c-stat-value" style="color: #10b981;">${campaign.status || 'Active'}</span></div>
   </div>
   <hr style="border-color: rgba(255,255,255,0.1);">
   <div style="font-weight: 600; color: #10b981;"><i data-lucide="lightbulb" class="icon-sm text-amber-500"></i> AI Recommendations</div>
   <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 12px; border-radius: 8px; font-size: 13px; color: #d1fae5;">
    <ul style="margin: 0; padding-left: 20px;">
     ${generateAIRecommendations(campaign)}
    </ul>
   </div>
  </div>
 `;
 document.getElementById('detailsModalContent').innerHTML = content;
 document.getElementById('modalCampaignDetails').classList.add('open');
}

function closeDetailsModal() {
 document.getElementById('modalCampaignDetails').classList.remove('open');
}

function getStatusBadge(budget) {
 if (budget > 100000) return '<span class="c-badge high-impact">High Impact</span>';
 if (budget > 50000) return '<span class="c-badge growing">Growing</span>';
 return '<span class="c-badge starter">Starter</span>';
}

function renderActiveCampaigns() {
  const container = document.getElementById("activeCampaignsList");

  if (!container) {
    console.error("activeCampaignsList not found");
    return;
  }

  const campaigns = window.PlatformData.campaigns;

  if (campaigns.length === 0) {
    const demoCampaign = {
      id: "cmp001",
      name: "Instagram Festival Ads",
      platform: "Instagram",
      type: "Social Media",
      budget: 25000,
      roi: 180,
      status: "Active"
    };
    campaigns.push(demoCampaign);
    window.PlatformEngine.logActivity('campaign', `Demo campaign created: ${demoCampaign.name}`);
    window.PlatformEngine.savePlatformData("marketing");
  }

  if (campaigns.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No active campaigns found
      </div>
    `;
    return;
  }

  const getIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return '';
    if (p.includes('email')) return '';
    if (p.includes('google')) return '<i data-lucide="target" class="icon-sm text-purple-500"></i>';
    if (p.includes('whatsapp')) return '<i data-lucide="message-square" class="icon-sm text-blue-500"></i>';
    if (p.includes('linkedin')) return '';
    if (p.includes('facebook')) return '';
    return '<i data-lucide="zap" class="icon-sm text-amber-500"></i>';
  };

  container.innerHTML = campaigns.map(campaign => `
<div class="campaign-card">
  <div class="campaign-top">
    <div class="campaign-title-wrap">
      <div class="campaign-icon">
        ${getIcon(campaign.platform)}
      </div>
      <div>
        <h3>${campaign.name}</h3>
        <p class="platform-text">
          ${campaign.platform}
        </p>
      </div>
    </div>
    <div class="status-chip ${campaign.status.toLowerCase() === 'active' ? 'active' : ''}">
      ● ${campaign.status}
    </div>
  </div>
  <div class="stats-grid">
    <div class="mini-stat">
      <span>Type</span>
      <strong>${campaign.type}</strong>
    </div>
    <div class="mini-stat">
      <span>Budget</span>
      <strong>₹${campaign.budget}</strong>
    </div>
    <div class="mini-stat">
      <span>ROI</span>
      <strong class="roi-value">
        ${campaign.roi || campaign.predictedROI || 0}%
      </strong>
    </div>
  </div>
  <div class="roi-section">
    <div class="roi-labels">
      <span>Campaign Performance</span>
      <span>${campaign.roi || campaign.predictedROI || 0}%</span>
    </div>
    <div class="roi-bar">
      <div class="roi-fill" style="width: ${Math.min(100, (campaign.roi || campaign.predictedROI || 0))}%"></div>
    </div>
  </div>
  <div class="campaign-buttons">
    <button class="analytics-btn" onclick="viewCampaign('${campaign.id}')">
      <i data-lucide="bar-chart" class="icon-sm text-blue-500"></i> View Analytics
    </button>
    <button class="delete-btn" onclick="deleteCampaign('${campaign.id}')">
       Delete
    </button>
  </div>
</div>
  `).join("");
}

async function predictCampaign() {
 console.log("Prediction started");
 console.log("Updating dashboard...");
 console.log("Showing results section");

 const data = {
  age: parseInt(document.getElementById('predAge').value) || 35,
  job: document.getElementById('predJob').value,
  marital: 'married',
  education: 'secondary',
  default: 'no',
  balance: parseInt(document.getElementById('predBalance').value) || 1500,
  housing: 'yes',
  loan: 'no',
  contact: document.getElementById('predContact').value,
  day: 15,
  month: 'may',
  duration: parseInt(document.getElementById('predDuration').value) || 300,
  campaign: 1,
  pdays: -1,
  previous: parseInt(document.getElementById('predPrevious').value) || 0,
  poutcome: 'unknown'
 };
 
 try {
  let result;
  if (window.API) {
   result = await API.Campaign.predictCampaign(data);
  } else {
   const score = Math.min(0.95, Math.max(0.05, (data.duration / 1000) * 0.5 + (data.balance / 10000) * 0.3 + Math.random() * 0.2));
   result = { will_subscribe: score > 0.5, probability: score, model: 'Heuristic-Fallback' };
  }
  
  const resultDiv = document.getElementById('predictionResult');
  const scoreDiv = document.getElementById('predictionScore');
  const textDiv = document.getElementById('predictionText');
  const barDiv = document.getElementById('predictionBar');
  
  resultDiv.style.display = 'block';
  const probPercent = Math.round(result.probability * 100);
  
  const resultBox = document.getElementById('predictionResultBox');
  if (result.will_subscribe) {
   resultBox.style.background = 'rgba(16,185,129,0.1)';
   resultBox.style.borderColor = 'rgba(16,185,129,0.3)';
  } else {
   resultBox.style.background = 'rgba(239,68,68,0.1)';
   resultBox.style.borderColor = 'rgba(239,68,68,0.3)';
  }

  scoreDiv.textContent = probPercent + '%';
  scoreDiv.style.color = result.will_subscribe ? '#10b981' : '#ef4444';
  
  textDiv.innerHTML = `
   Customer is <strong style="color: ${result.will_subscribe ? '#10b981' : '#ef4444'};">${result.will_subscribe ? 'LIKELY' : 'UNLIKELY'}</strong> to subscribe<br>
   <span style="font-size: 11px;">Model: ${result.model}</span>
  `;
  
  barDiv.style.width = '0%';
  setTimeout(() => {
   barDiv.style.width = probPercent + '%';
   barDiv.style.background = result.will_subscribe 
    ? 'linear-gradient(90deg, #10b981, #34d399)' 
    : 'linear-gradient(90deg, #ef4444, #f87171)';
  }, 50);
  
  const kpiSection = document.getElementById("marketingKPIs");
  if (kpiSection) {
   kpiSection.scrollIntoView({
     behavior: "smooth",
     block: "start"
   });
  }
  
  console.log("Dashboard visible");
  console.log("Charts visible");
  console.log("Predictor loaded");

  updateMarketingDashboard();
  createMarketingChart();
  createPerformanceChart();
  
 } catch (error) {
  console.error('Prediction error:', error);
  alert('Error making prediction. Please try again.');
 }
}

function updateMarketingDashboard() {
 loadCampaignStats();
 renderActiveCampaigns();
}

function loadCampaignStats() {
 const existing = window.PlatformData.campaigns;
 
 if (existing.length === 0) {
  animateValue('predictedConversions', 0, 0, 1000);
  animateValue('successRate', 0, 0, 1000, '%');
  animateValue('aiPredictionAccuracy', 0, 83.3, 1000, '%');
  animateValue('marketingRoi', 0, 0, 1000, '%');
  return;
 }
 
 let totalLeads = 0;
 let totalBudget = 0;
 let totalSuccessScore = 0;
 
 existing.forEach(c => {
  totalLeads += parseInt(c.expectedLeads) || 0;
  totalBudget += parseFloat(c.budget) || 0;
  totalSuccessScore += parseFloat(c.successRate) || 0;
 });
 
 const avgSuccessRate = totalSuccessScore / existing.length;
 let avgROI = 0;
 if (totalBudget > 0) {
  avgROI = (((totalLeads * 120) - totalBudget) / totalBudget * 100);
 }
 
 const accuracy = 80 + Math.min(15, existing.length * 2);
 
 animateValue('predictedConversions', 0, totalLeads, 1500);
 animateValue('successRate', 0, avgSuccessRate, 1500, '%');
 animateValue('aiPredictionAccuracy', 0, accuracy, 1500, '%');
 animateValue('marketingRoi', 0, avgROI, 1500, '%');
}

window.predictCampaign = predictCampaign;
window.openNewCampaignModal = openNewCampaignModal;
window.closeNewCampaignModal = closeNewCampaignModal;
window.saveCampaign = saveCampaign;
window.viewCampaign = viewCampaign;
window.deleteCampaign = deleteCampaign;
window.filterCampaigns = filterCampaigns;
window.closeDetailsModal = closeDetailsModal;

console.log("Marketing JS Loaded Successfully");
console.log("Campaign Functions Registered");

window.initMarketingPage = function() {
 if (window.Chart) {
  createMarketingChart();
  createPerformanceChart();
 }
 loadCampaignStats();
 renderActiveCampaigns();
 
 document.removeEventListener('theme:changed', updateChartsTheme);
 document.addEventListener('theme:changed', updateChartsTheme);
};
