import sys

base_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/"

# 1. Update financials.js
fin_js_path = base_path + "financials.js"
with open(fin_js_path, "r", encoding="utf-8") as f:
    fin = f.read()

# Add listener for platform:data-updated in initFinancialsPage
fin_init_orig = """window.initFinancialsPage = () => {
    // Populate cards
    populateFinKPIs();
    // Initialize charts
    if (typeof FinancialCharts !== 'undefined') {
       FinancialCharts.initCharts();
    }
    // Init Insights
    if (typeof FinancialInsights !== 'undefined') {
       FinancialInsights.initInsights();
    }
    // Init modals
    if (typeof FinancialModals !== 'undefined') {
       FinancialModals.init();
    }
    
    // Live feed
    initFinActivityFeed();
};"""

fin_init_new = """window.initFinancialsPage = () => {
    // Populate cards
    populateFinKPIs();
    // Initialize charts
    if (typeof FinancialCharts !== 'undefined') {
       FinancialCharts.initCharts();
    }
    // Init Insights
    if (typeof FinancialInsights !== 'undefined') {
       FinancialInsights.initInsights();
    }
    // Init modals
    if (typeof FinancialModals !== 'undefined') {
       FinancialModals.init();
    }
    
    // Live feed
    initFinActivityFeed();

    // Listen for live cross-module updates
    window.addEventListener('platform:data-updated', handlePlatformUpdate);
};

function handlePlatformUpdate() {
    if (window.location.hash !== '#/financials') return;
    populateFinKPIs();
    if (typeof FinancialCharts !== 'undefined') FinancialCharts.initCharts();
    if (typeof FinancialInsights !== 'undefined') FinancialInsights.initInsights();
}"""
fin = fin.replace(fin_init_orig, fin_init_new)

# Add Empty state handler to populateFinKPIs
pop_orig = """function populateFinKPIs() {
    if (!window.FinancialEngine) return;
    const kpis = window.FinancialEngine.getFinancialKPIs();

    const revEl = document.getElementById('finTotalRevenue');
    if (revEl) revEl.innerText = '$' + kpis.mrr.toLocaleString(); // using mrr as proxy for display based on YTD
    
    const mrrEl = document.getElementById('finMRR');
    if (mrrEl) mrrEl.innerText = '$' + kpis.mrr.toLocaleString();

    const expEl = document.getElementById('finTotalExpenses');
    if (expEl) expEl.innerText = '$' + kpis.expenses.toLocaleString();

    const profitEl = document.getElementById('finNetProfit');
    if (profitEl) {
        profitEl.innerText = (kpis.profit < 0 ? '-$' : '$') + Math.abs(kpis.profit).toLocaleString();
        profitEl.style.color = kpis.profit < 0 ? '#ef4444' : '#10b981';
    }

    const burnEl = document.getElementById('finBurnRate');
    if (burnEl) {
        burnEl.innerText = kpis.burnRate > 0 ? ('$' + kpis.burnRate.toLocaleString()) : '$0';
        burnEl.style.color = kpis.burnRate > 0 ? '#ef4444' : '#10b981';
    }
}"""

pop_new = """function populateFinKPIs() {
    if (!window.FinancialEngine) return;
    const kpis = window.FinancialEngine.getFinancialKPIs();

    // Check for empty state
    if (kpis.mrr === 0 && kpis.expenses === 0) {
        showEmptyState();
        return;
    } else {
        hideEmptyState();
    }

    const revEl = document.getElementById('finTotalRevenue');
    // Using MRR as proxy for display unless totalRevenueYTD is explicitly calculated
    if (revEl) revEl.innerText = '$' + (window.PlatformEngine ? window.PlatformEngine.calculateTotalRevenue() : kpis.mrr).toLocaleString();
    
    const mrrEl = document.getElementById('finMRR');
    if (mrrEl) mrrEl.innerText = '$' + kpis.mrr.toLocaleString();

    const expEl = document.getElementById('finTotalExpenses');
    if (expEl) expEl.innerText = '$' + kpis.expenses.toLocaleString();

    const profitEl = document.getElementById('finNetProfit');
    if (profitEl) {
        profitEl.innerText = (kpis.profit < 0 ? '-$' : '$') + Math.abs(kpis.profit).toLocaleString();
        profitEl.style.color = kpis.profit < 0 ? '#ef4444' : '#10b981';
    }

    const burnEl = document.getElementById('finBurnRate');
    if (burnEl) {
        burnEl.innerText = kpis.burnRate > 0 ? ('$' + kpis.burnRate.toLocaleString()) : '$0';
        burnEl.style.color = kpis.burnRate > 0 ? '#ef4444' : '#10b981';
    }
}

function showEmptyState() {
    const chartContainer = document.getElementById('financialsChart');
    if (chartContainer && chartContainer.parentElement) {
        if (!document.getElementById('finEmptyState')) {
            const emptyEl = document.createElement('div');
            emptyEl.id = 'finEmptyState';
            emptyEl.style.position = 'absolute';
            emptyEl.style.inset = '0';
            emptyEl.style.background = 'rgba(15, 23, 42, 0.8)';
            emptyEl.style.backdropFilter = 'blur(4px)';
            emptyEl.style.display = 'flex';
            emptyEl.style.flexDirection = 'column';
            emptyEl.style.alignItems = 'center';
            emptyEl.style.justifyContent = 'center';
            emptyEl.style.zIndex = '10';
            emptyEl.style.borderRadius = '8px';
            emptyEl.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 12px;">📊</div>
                <h3 style="margin-bottom: 8px;">No Revenue Data</h3>
                <p class="muted" style="font-size: 13px; text-align: center;">Go to CRM to add customers or Marketing to add campaigns.</p>
                <button class="btn-premium" style="margin-top: 16px;" onclick="window.Router.navigate('#/crm')">Go to CRM</button>
            `;
            chartContainer.parentElement.appendChild(emptyEl);
        }
    }
}

function hideEmptyState() {
    const emptyEl = document.getElementById('finEmptyState');
    if (emptyEl) emptyEl.remove();
}"""
fin = fin.replace(pop_orig, pop_new)

# Upgrade live feed to use PlatformData directly
fin_feed_orig = """function initFinActivityFeed() {
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

fin_feed_new = """function initFinActivityFeed() {
    const feed = document.getElementById('finLiveActivityFeed');
    if (!feed) return;
    
    const refreshFeed = () => {
        if (!window.PlatformData || !window.PlatformData.notifications) return;
        const notifications = window.PlatformData.notifications.slice(0, 6);
        
        if (notifications.length === 0) {
            feed.innerHTML = '<div class="muted" style="font-size: 13px; text-align: center; padding: 20px;">No platform activity yet.</div>';
            return;
        }

        feed.innerHTML = notifications.map(n => `
            <div class="activity-item">
                <div style="font-size: 16px;">⚡</div>
                <div>
                    <div style="font-size: 13.5px; color: #e2e8f0;">${n.message}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        `).join('');
    };

    refreshFeed();
    if (finActivityInterval) clearInterval(finActivityInterval);
    finActivityInterval = setInterval(refreshFeed, 3000);
    window.addEventListener('platform:data-updated', refreshFeed);
}"""
fin = fin.replace(fin_feed_orig, fin_feed_new)

# Add removeEventListener to destroyFinancialCharts
destroy_orig = """window.destroyFinancialCharts = () => {
    if (typeof FinancialCharts !== 'undefined') {
        FinancialCharts.destroyAll();
    }
    if (finActivityInterval) {
        clearInterval(finActivityInterval);
    }
};"""

destroy_new = """window.destroyFinancialCharts = () => {
    if (typeof FinancialCharts !== 'undefined') {
        FinancialCharts.destroyAll();
    }
    if (finActivityInterval) {
        clearInterval(finActivityInterval);
    }
    if (typeof handlePlatformUpdate !== 'undefined') {
        window.removeEventListener('platform:data-updated', handlePlatformUpdate);
    }
};"""
fin = fin.replace(destroy_orig, destroy_new)

with open(fin_js_path, "w", encoding="utf-8") as f:
    f.write(fin)


# 2. Update analytics.js
an_js_path = base_path + "analytics.js"
with open(an_js_path, "r", encoding="utf-8") as f:
    an_js = f.read()

# Add listener for platform:data-updated
an_init_orig = """window.initAnalyticsPage = () => {
    // Initial fetch
    if (window.AnalyticsEngine) {
        window.AnalyticsEngine.updateDashboard();
    }

    // Set up table filtering
    setupTableFiltering();

    // Init live activity
    initActivityFeed();
};"""

an_init_new = """window.initAnalyticsPage = () => {
    // Initial fetch
    if (window.AnalyticsEngine) {
        window.AnalyticsEngine.updateDashboard();
    }

    // Set up table filtering
    setupTableFiltering();

    // Init live activity
    initActivityFeed();

    window.addEventListener('platform:data-updated', handleAnalyticsPlatformUpdate);
};

function handleAnalyticsPlatformUpdate() {
    if (window.location.hash !== '#/analytics') return;
    if (window.AnalyticsEngine) window.AnalyticsEngine.updateDashboard();
}"""
an_js = an_js.replace(an_init_orig, an_init_new)

an_feed_orig = """function initActivityFeed() {
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

an_feed_new = """function initActivityFeed() {
    const feed = document.getElementById('liveActivityFeed');
    if (!feed) return;
    
    const refreshFeed = () => {
        if (!window.PlatformData || !window.PlatformData.notifications) return;
        const notifications = window.PlatformData.notifications.slice(0, 8);
        
        if (notifications.length === 0) {
            feed.innerHTML = '<div class="muted" style="font-size: 13px; text-align: center; padding: 20px;">No platform activity yet.</div>';
            return;
        }

        feed.innerHTML = notifications.map(n => `
            <div class="activity-item">
                <div style="font-size: 16px;">⚡</div>
                <div>
                    <div style="font-size: 13.5px; color: #e2e8f0;">${n.message}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        `).join('');
    };

    refreshFeed();
    if (activityFeedInterval) clearInterval(activityFeedInterval);
    activityFeedInterval = setInterval(refreshFeed, 3000);
    window.addEventListener('platform:data-updated', refreshFeed);
}"""
an_js = an_js.replace(an_feed_orig, an_feed_new)

an_destroy_orig = """window.destroyAnalyticsCharts = () => {
    if (trafficChart) trafficChart.destroy();
    if (usersChart) usersChart.destroy();
    if (forecastChart) forecastChart.destroy();
    if (radarChart) radarChart.destroy();
    if (sourcesChart) sourcesChart.destroy();
    
    if (modalChart) modalChart.destroy();
    
    if (activityFeedInterval) clearInterval(activityFeedInterval);
};"""

an_destroy_new = """window.destroyAnalyticsCharts = () => {
    if (trafficChart) trafficChart.destroy();
    if (usersChart) usersChart.destroy();
    if (forecastChart) forecastChart.destroy();
    if (radarChart) radarChart.destroy();
    if (sourcesChart) sourcesChart.destroy();
    
    if (modalChart) modalChart.destroy();
    
    if (activityFeedInterval) clearInterval(activityFeedInterval);
    if (typeof handleAnalyticsPlatformUpdate !== 'undefined') {
        window.removeEventListener('platform:data-updated', handleAnalyticsPlatformUpdate);
    }
};"""
an_js = an_js.replace(an_destroy_orig, an_destroy_new)

with open(an_js_path, "w", encoding="utf-8") as f:
    f.write(an_js)

print("Upgraded consumers to listen to events and handle empty states.")
