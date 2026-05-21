import sys
import re

js_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/marketing.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the dummy saveCampaign I just added and handleNewCampaign with the proper one
old_block = r'function saveCampaign\(\) \{.*?function handleNewCampaign\(e\) \{.*?createPerformanceChart\(\);\s*\}'
new_block = '''function saveCampaign(e) {
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

  const campaigns = JSON.parse(localStorage.getItem("campaigns")) || [];
  campaigns.push(newCampaign);
  localStorage.setItem("campaigns", JSON.stringify(campaigns));
  
  showToast(`Campaign "${newCampaign.name}" launched successfully!`);
  closeNewCampaignModal();
  if(e && e.target) e.target.reset();
  renderActiveCampaigns();
  loadCampaignStats();
  createMarketingChart();
  createPerformanceChart();
}'''

js = re.sub(old_block, new_block, js, flags=re.DOTALL)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

# Update HTML to point to saveCampaign(event)
html_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('onsubmit="handleNewCampaign(event)"', 'onsubmit="saveCampaign(event)"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Success')
