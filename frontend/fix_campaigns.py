import sys
import re

# Update HTML
html_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('id="activeCampaignsGrid"', 'id="activeCampaignsList"')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# Update JS
js_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/marketing.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Change 'startup_campaigns' to 'campaigns' globally to match user requirements
js = js.replace("'startup_campaigns'", "'campaigns'")

new_render = '''function renderActiveCampaigns() {
  const container = document.getElementById("activeCampaignsList");
  if (!container) {
      console.error("activeCampaignsList not found");
      return;
  }
  
  const campaigns = JSON.parse(localStorage.getItem("campaigns")) || [];
  console.log("Rendering active campaigns...");
  console.log("Campaign count:", campaigns.length);
  
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
      localStorage.setItem("campaigns", JSON.stringify(campaigns));
  }
  
  if (campaigns.length === 0) {
      container.innerHTML = `
          <div class="empty-state">
              No active campaigns found
          </div>
      `;
      return;
  }

  container.innerHTML = campaigns.map(campaign => `
      <div class="campaign-card">
          <h3>${campaign.name}</h3>
          <p>Platform: ${campaign.platform}</p>
          <p>Type: ${campaign.type}</p>
          <p>Budget: ₹${campaign.budget}</p>
          <p>ROI: ${campaign.roi || campaign.predictedROI || 0}%</p>
          <p>Status: ${campaign.status}</p>
          <div class="campaign-actions">
              <button onclick="viewCampaign('${campaign.id}')">View</button>
              <button onclick="deleteCampaign('${campaign.id}')">Delete</button>
          </div>
      </div>
  `).join("");
}'''

# Extract the old renderCampaigns function and replace it
start_idx = js.find('function renderCampaigns() {')
if start_idx != -1:
    end_idx = js.find('}', js.find('}).join(\'\');', start_idx)) + 1
    if end_idx <= start_idx:
        # Fallback regex if precise string doesn't match
        match = re.search(r'function renderCampaigns\(\)\s*\{.*?\n\}\s*\n', js, re.DOTALL)
        if match:
            start_idx = match.start()
            end_idx = match.end()
    
    js = js[:start_idx] + new_render + '\n\n' + js[end_idx:]
else:
    print('Could not find renderCampaigns')

js = js.replace('renderCampaigns()', 'renderActiveCampaigns()')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print('Success')
