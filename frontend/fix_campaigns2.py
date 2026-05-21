import sys
import re

# Update HTML
html_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Make sure ID is activeCampaignsList
html = re.sub(r'id="activeCampaignsGrid"[^>]*', 'id="activeCampaignsList"', html)

# Add CSS rules explicitly requested
css_req = r'''
.campaign-card {
    display:block !important;
    opacity:1 !important;
    visibility:visible !important;
    padding:20px !important;
    margin-bottom:16px !important;
    border-radius:16px !important;
    background: linear-gradient(145deg, var(--color-card), rgba(15, 23, 42, 0.02));
    border: 1px solid var(--color-border);
}'''
if '.campaign-card' in html:
    html = re.sub(r'\.campaign-card\s*\{[^\}]+\}', css_req, html, count=1)
else:
    html = html.replace('</style>', css_req + '\n</style>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# Update JS
js_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/marketing.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()


# Create exact renderActiveCampaigns function string requested
exact_render = '''function renderActiveCampaigns() {
    const container = document.getElementById("activeCampaignsList");

    if (!container) {
        console.error("activeCampaignsList not found");
        return;
    }

    const campaigns = JSON.parse(localStorage.getItem("campaigns")) || [];

    console.log("Rendering active campaigns...");
    console.log("Campaign count:", campaigns.length);
    console.log("Campaigns:", campaigns);

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
                <button onclick="viewCampaign('${campaign.id}')">
                    View
                </button>
                <button onclick="deleteCampaign('${campaign.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join("");
}'''

# Replace whatever renderActiveCampaigns currently is
match = re.search(r'function renderActiveCampaigns\(\)\s*\{.*?\n\}\s*\n', js, re.DOTALL)
if match:
    js = js[:match.start()] + exact_render + '\n\n' + js[match.end():]
else:
    print("Could not find renderActiveCampaigns to replace")

# Ensure saveCampaign exists (might be renamed from handleNewCampaign or needs a new wrapper)
# Since the HTML form uses onsubmit="handleNewCampaign(event)", I will add saveCampaign inside it or replace it.
js = js.replace('function handleNewCampaign(e) {', '''function saveCampaign() {
    renderActiveCampaigns();
}

function handleNewCampaign(e) {''')

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print('Success')
