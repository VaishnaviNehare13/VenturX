import sys
import re

# Update JS template
js_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/marketing.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

new_render_template = '''function renderActiveCampaigns() {
    const container = document.getElementById("activeCampaignsList");

    if (!container) {
        console.error("activeCampaignsList not found");
        return;
    }

    const campaigns = JSON.parse(localStorage.getItem("campaigns")) || [];

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

    const getIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('instagram')) return '📸';
        if (p.includes('email')) return '📧';
        if (p.includes('google')) return '🎯';
        if (p.includes('whatsapp')) return '💬';
        if (p.includes('linkedin')) return '💼';
        if (p.includes('facebook')) return '👍';
        return '🚀';
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
            📊 View Analytics
        </button>
        <button class="delete-btn" onclick="deleteCampaign('${campaign.id}')">
            🗑 Delete
        </button>
    </div>
</div>
    `).join("");
}'''

match = re.search(r'function renderActiveCampaigns\(\)\s*\{.*?\n\}\s*\n', js, re.DOTALL)
if match:
    js = js[:match.start()] + new_render_template + '\n\n' + js[match.end():]
else:
    print("Could not find renderActiveCampaigns to replace")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

# Update CSS in HTML
html_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

new_css = '''
#activeCampaignsList {
    display:grid;
    grid-template-columns: repeat(auto-fit,minmax(420px,1fr));
    gap:28px;
}

.campaign-card {
    position:relative;
    overflow:hidden;
    background: linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.75));
    border: 1px solid rgba(139,92,246,0.18);
    border-radius:28px;
    padding:28px;
    backdrop-filter: blur(18px);
    transition: all 0.35s ease;
    box-shadow: 0 10px 40px rgba(0,0,0,0.25);
}

.campaign-card::before {
    content:"";
    position:absolute;
    inset:0;
    background: radial-gradient(circle at top right, rgba(139,92,246,0.18), transparent 40%);
    pointer-events:none;
}

.campaign-card:hover {
    transform: translateY(-8px) scale(1.01);
    border-color:#8b5cf6;
    box-shadow: 0 18px 50px rgba(139,92,246,0.25);
}

.campaign-top {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    margin-bottom:24px;
}

.campaign-title-wrap {
    display:flex;
    gap:18px;
    align-items:center;
}

.campaign-icon {
    width:64px;
    height:64px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:20px;
    font-size:28px;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    box-shadow: 0 10px 25px rgba(139,92,246,0.35);
}

.campaign-title-wrap h3 {
    color:white;
    font-size:28px;
    font-weight:700;
    margin-bottom:6px;
    margin-top: 0;
}

.platform-text {
    color:#a78bfa;
    font-size:15px;
    margin: 0;
}

.status-chip {
    padding:10px 18px;
    border-radius:999px;
    font-size:13px;
    font-weight:700;
    background: rgba(255,255,255,0.1);
    color: #cbd5e1;
}

.status-chip.active {
    background: rgba(34,197,94,0.15);
    color:#22c55e;
    border: 1px solid rgba(34,197,94,0.3);
}

.stats-grid {
    display:grid;
    grid-template-columns: repeat(3,1fr);
    gap:18px;
    margin-bottom:24px;
}

.mini-stat {
    background: rgba(255,255,255,0.04);
    border-radius:18px;
    padding:18px;
}

.mini-stat span {
    display:block;
    color:#94a3b8;
    font-size:13px;
    margin-bottom:8px;
}

.mini-stat strong {
    color:white;
    font-size:20px;
}

.roi-value {
    color:#22c55e !important;
}

.roi-section {
    margin-bottom:28px;
}

.roi-labels {
    display:flex;
    justify-content:space-between;
    margin-bottom:10px;
    color:#cbd5e1;
    font-size:14px;
}

.roi-bar {
    width:100%;
    height:12px;
    background: rgba(255,255,255,0.05);
    border-radius:999px;
    overflow:hidden;
}

.roi-fill {
    height:100%;
    border-radius:999px;
    background: linear-gradient(90deg, #8b5cf6, #ec4899);
    box-shadow: 0 0 18px rgba(139,92,246,0.45);
}

.campaign-buttons {
    display:flex;
    gap:14px;
}

.analytics-btn,
.delete-btn {
    flex:1;
    border:none;
    padding:16px;
    border-radius:16px;
    font-weight:600;
    cursor:pointer;
    transition:0.3s;
}

.analytics-btn {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color:white;
}

.analytics-btn:hover {
    transform:translateY(-3px);
    box-shadow: 0 12px 30px rgba(139,92,246,0.35);
}

.delete-btn {
    background: rgba(239,68,68,0.12);
    color:#ef4444;
}

.delete-btn:hover {
    background:#ef4444;
    color:white;
}
</style>'''

# Replace old CSS for campaign-card and c-badge
# The old one might just be .campaign-card {...}
if '.campaign-card' in html:
    # We strip the old .campaign-card and things around it carefully, or just append to end and rely on CSS cascade.
    # Appending to the end before </style> is safer
    html = re.sub(r'\.campaign-card\s*\{[^}]+\}', '', html)
    html = re.sub(r'\.campaign-card:hover\s*\{[^}]+\}', '', html)
    html = re.sub(r'\.campaign-card::before\s*\{[^}]+\}', '', html)
    html = html.replace('</style>', new_css)
else:
    html = html.replace('</style>', new_css)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

print('Success')
