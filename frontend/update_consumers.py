import sys

base_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/"

# 1. Update analyticsEngine.js
analytics_path = base_path + "analyticsEngine.js"
with open(analytics_path, "r", encoding="utf-8") as f:
    analytics = f.read()

# Replace getCRMData, getMarketingData, getContentData, getBrandingData
analytics_orig = """  function getCRMData() {
    const data = JSON.parse(localStorage.getItem('saasCustomers') || '[]');
    const totalUsers = data.length || 0;
    
    // Growth (simulate based on total)
    const activeUsers = data.filter(c => c.activityLevel !== 'Inactive').length;
    let retention = 0;
    let churnRisk = 0;
    
    if (totalUsers > 0) {
      retention = (activeUsers / totalUsers) * 100;
      churnRisk = 100 - retention;
    }

    return { totalUsers, activeUsers, retention, churnRisk, data };
  }

  function getMarketingData() {
    const data = JSON.parse(localStorage.getItem('campaigns') || '[]');
    let totalLeads = 0;
    let totalBudget = 0;
    let totalSuccess = 0;
    
    data.forEach(c => {
      totalLeads += parseInt(c.expectedLeads) || 0;
      totalBudget += parseFloat(c.budget) || 0;
      totalSuccess += parseFloat(c.successRate) || 0;
    });

    const avgSuccess = data.length > 0 ? (totalSuccess / data.length) : 0;
    const avgROI = totalBudget > 0 ? (((totalLeads * 120) - totalBudget) / totalBudget * 100) : 0;
    const reach = totalLeads * 150; // Simulated multiplier for impressions
    
    return { totalLeads, reach, avgROI, avgSuccess, data };
  }

  function getContentData() {
    const drafts = JSON.parse(localStorage.getItem('contentDrafts') || '[]');
    const schedule = JSON.parse(localStorage.getItem('contentSchedule') || '[]');
    return { draftsCount: drafts.length, scheduledCount: schedule.length };
  }

  function getBrandingData() {
    const brand = JSON.parse(localStorage.getItem('latestBrand') || 'null');
    return { hasBrand: !!brand, brandName: brand ? brand.startupName : null };
  }"""

analytics_new = """  function getCRMData() {
    const pde = window.PlatformDataEngine;
    if (!pde) return { totalUsers:0, activeUsers:0, retention:0, churnRisk:0, data:[] };
    
    const data = pde.getData().crm;
    const totalUsers = pde.getTotalUsers();
    const activeUsers = pde.getActiveUsers();
    const retention = pde.getRetentionRate();
    const churnRisk = 100 - retention;

    return { totalUsers, activeUsers, retention, churnRisk, data };
  }

  function getMarketingData() {
    const pde = window.PlatformDataEngine;
    if (!pde) return { totalLeads:0, reach:0, avgROI:0, avgSuccess:0, data:[] };
    
    const data = pde.getData().campaigns;
    let totalLeads = 0;
    let totalBudget = 0;
    let totalSuccess = 0;
    
    data.forEach(c => {
      totalLeads += parseInt(c.expectedLeads) || 0;
      totalBudget += parseFloat(c.budget) || 0;
      totalSuccess += parseFloat(c.successRate) || 0;
    });

    const avgSuccess = data.length > 0 ? (totalSuccess / data.length) : 0;
    const avgROI = totalBudget > 0 ? (((totalLeads * 120) - totalBudget) / totalBudget * 100) : 0;
    const reach = pde.getMarketingReach();
    
    return { totalLeads, reach, avgROI, avgSuccess, data };
  }

  function getContentData() {
    const pde = window.PlatformDataEngine;
    if (!pde) return { draftsCount: 0, scheduledCount: 0 };
    const aiUsage = pde.getData().aiUsage.filter(a => a.module === 'content');
    return { draftsCount: aiUsage.length, scheduledCount: 0 };
  }

  function getBrandingData() {
    const pde = window.PlatformDataEngine;
    if (!pde) return { hasBrand: false, brandName: null };
    const brands = pde.getData().branding;
    const hasBrand = brands.length > 0;
    return { hasBrand, brandName: hasBrand ? brands[brands.length-1].startupName : null };
  }"""

analytics = analytics.replace(analytics_orig, analytics_new)
with open(analytics_path, "w", encoding="utf-8") as f:
    f.write(analytics)


# 2. Update financialEngine.js
financial_path = base_path + "financialEngine.js"
with open(financial_path, "r", encoding="utf-8") as f:
    financial = f.read()

# Replace getCRMData and getMarketingData
fin_orig = """  // Raw Data Fetchers
  function getCRMData() {
    return JSON.parse(localStorage.getItem('saasCustomers') || '[]');
  }

  function getMarketingData() {
    return JSON.parse(localStorage.getItem('campaigns') || '[]');
  }"""

fin_new = """  // Raw Data Fetchers
  function getCRMData() {
    if (window.PlatformDataEngine) return window.PlatformDataEngine.getData().crm;
    return [];
  }

  function getMarketingData() {
    if (window.PlatformDataEngine) return window.PlatformDataEngine.getData().campaigns;
    return [];
  }"""

financial = financial.replace(fin_orig, fin_new)
with open(financial_path, "w", encoding="utf-8") as f:
    f.write(financial)


# 3. Update activity feed in analytics.js to use PlatformDataEngine
analytics_js_path = base_path + "analytics.js"
with open(analytics_js_path, "r", encoding="utf-8") as f:
    an_js = f.read()

feed_orig = """function initActivityFeed() {
    const feed = document.getElementById('liveActivityFeed');
    if (!feed) return;
    
    // Initial pop
    feed.innerHTML = '';
    for(let i=0; i<3; i++) pushActivityEvent(feed);
    
    if (activityFeedInterval) clearInterval(activityFeedInterval);
    activityFeedInterval = setInterval(() => {
        pushActivityEvent(feed);
    }, 4000);
}

function pushActivityEvent(feed) {
    const event = activityEvents[Math.floor(Math.random() * activityEvents.length)];
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
        <div style="font-size: 16px;">${event.icon}</div>
        <div>
            <div style="font-size: 13.5px; color: #e2e8f0;">${event.msg}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Just now</div>
        </div>
    `;
    feed.prepend(el);
    if (feed.children.length > 8) {
        feed.removeChild(feed.lastChild);
    }
}"""

feed_new = """function initActivityFeed() {
    const feed = document.getElementById('liveActivityFeed');
    if (!feed) return;
    
    const refreshFeed = () => {
        if (!window.PlatformDataEngine) return;
        const notifications = window.PlatformDataEngine.getRecentNotifications(8);
        feed.innerHTML = notifications.map(n => `
            <div class="activity-item">
                <div style="font-size: 16px;">${n.icon}</div>
                <div>
                    <div style="font-size: 13.5px; color: #e2e8f0;">${n.message}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Just now</div>
                </div>
            </div>
        `).join('');
    };

    refreshFeed();
    if (activityFeedInterval) clearInterval(activityFeedInterval);
    activityFeedInterval = setInterval(refreshFeed, 3000); // Check engine every 3s
}"""

an_js = an_js.replace(feed_orig, feed_new)
with open(analytics_js_path, "w", encoding="utf-8") as f:
    f.write(an_js)

# 4. Update activity feed in financials.js
fin_js_path = base_path + "financials.js"
with open(fin_js_path, "r", encoding="utf-8") as f:
    f_js = f.read()

fin_feed_orig = """function initFinActivityFeed() {
    const feed = document.getElementById('finLiveActivityFeed');
    if (!feed) return;
    
    feed.innerHTML = '';
    for(let i=0; i<3; i++) pushFinEvent(feed);
    
    if (finActivityInterval) clearInterval(finActivityInterval);
    finActivityInterval = setInterval(() => { pushFinEvent(feed); }, 5000);
}

function pushFinEvent(feed) {
    const event = finEvents[Math.floor(Math.random() * finEvents.length)];
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.innerHTML = `
        <div style="font-size: 16px;">${event.icon}</div>
        <div>
            <div style="font-size: 13.5px; color: #e2e8f0;">${event.msg}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Just now</div>
        </div>
    `;
    feed.prepend(el);
    if (feed.children.length > 6) feed.removeChild(feed.lastChild);
}"""

fin_feed_new = """function initFinActivityFeed() {
    const feed = document.getElementById('finLiveActivityFeed');
    if (!feed) return;
    
    const refreshFeed = () => {
        if (!window.PlatformDataEngine) return;
        // Filter notifications slightly if we want, but global is fine
        const notifications = window.PlatformDataEngine.getRecentNotifications(6);
        feed.innerHTML = notifications.map(n => `
            <div class="activity-item">
                <div style="font-size: 16px;">${n.icon}</div>
                <div>
                    <div style="font-size: 13.5px; color: #e2e8f0;">${n.message}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Just now</div>
                </div>
            </div>
        `).join('');
    };

    refreshFeed();
    if (finActivityInterval) clearInterval(finActivityInterval);
    finActivityInterval = setInterval(refreshFeed, 3000);
}"""

f_js = f_js.replace(fin_feed_orig, fin_feed_new)
with open(fin_js_path, "w", encoding="utf-8") as f:
    f.write(f_js)

print("Updated consumers to use PlatformDataEngine.")
