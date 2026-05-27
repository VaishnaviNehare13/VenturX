// dashboard.js - Premium VenturX Edition (Ultra-Stable)

window.dashboardCharts = [];
window.LiveMongoDashboard = {};
let premiumMainChart = null;

window.initDashboardPage = function() {
    console.log("INITIALIZING VENTURX PREMIUM DASHBOARD");

    // Session Sync
    const sessionStr = localStorage.getItem("venturx_session");
    if (sessionStr) {
        try {
            const session = JSON.parse(sessionStr);
            if (!session.name || !session.email) {
                localStorage.removeItem("venturx_session");
                window.location.hash = "#/login";
                return;
            } else {
                const welcomeTitle = document.querySelector('.dash-header h1');
                if (welcomeTitle) {
                    welcomeTitle.innerHTML = `Welcome back, ${session.name.split(' ')[0]}`;
                }
                const workspaceTitle = document.querySelector('.dash-header .status-pill:first-child');
                if (workspaceTitle) {
                    const wsName = session.company || session.name + "'s HQ";
                    workspaceTitle.innerHTML = `<i data-lucide="folder" style="width:12px; margin-right:4px;"></i> Workspace: ${wsName}`;
                }
            }
        } catch (e) {
            localStorage.removeItem("venturx_session");
            window.location.hash = "#/login";
            return;
        }
    } else {
        window.location.hash = "#/login";
        return;
    }

    // 1. Safety Guard
    setTimeout(() => {
        document.body.classList.remove("loading");
        const loader = document.getElementById("globalLoader");
        if(loader) loader.remove();
    }, 100);

    // 2. Load Live Analytics from MongoDB
    loadDashboard();

    // 4. Update Time
    updateClock();
    setInterval(updateClock, 60000);

    // 5. Activity Feed Scroll
    startFeedScroll();
};

function updateClock() {
    const el = document.getElementById('dashClock');
    if (!el) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    el.innerText = `${timeStr} (IST)`;
}

window.toggleKPI = function(id) {
    const detailEl = document.getElementById('kpi-detail-' + id);
    if (!detailEl) return;
    if (detailEl.style.display === 'none' || detailEl.style.display === '') {
        // Hide others
        document.querySelectorAll('.kpi-details').forEach(el => el.style.display = 'none');
        detailEl.style.display = 'block';
    } else {
        detailEl.style.display = 'none';
    }
};

let feedScrollInterval;
function startFeedScroll() {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;
    clearInterval(feedScrollInterval);
    feedScrollInterval = setInterval(() => {
        if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight) {
            feed.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            feed.scrollBy({ top: 40, behavior: 'smooth' });
        }
    }, 5000);
}

window.destroyDashboardCharts = function() {
    console.log("Destroying premium dashboard charts...");
    if (window.dashboardCharts) {
        window.dashboardCharts.forEach(chart => {
            if (chart) chart.destroy();
        });
        window.dashboardCharts = [];
window.LiveMongoDashboard = {};
    }
    premiumMainChart = null;
    if (typeof feedScrollInterval !== 'undefined') clearInterval(feedScrollInterval);
};

// ---------------------------------------------------------
// SAFE ONE-TIME ANIMATIONS
// ---------------------------------------------------------
function animateCounters() {
    const counters = document.querySelectorAll('.anim-counter');
    counters.forEach(counter => {
        const targetStr = counter.getAttribute('data-target');
        const target = parseFloat(targetStr);
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const isFloat = counter.getAttribute('data-float') === 'true';
        
        const duration = 1200; // 1.2s smooth ease
        let startTime = null;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = ease * target;

            if (isFloat) {
                counter.innerText = prefix + current.toFixed(1) + suffix;
            } else {
                counter.innerText = prefix + Math.floor(current).toLocaleString('en-IN') + suffix;
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure exact final value
                counter.innerText = prefix + (isFloat ? target.toFixed(1) : target.toLocaleString('en-IN')) + suffix;
            }
        };
        
        window.requestAnimationFrame(step);
    });
}

// ---------------------------------------------------------
// STATIC CHART RENDERING (NO LOOPS)
// ---------------------------------------------------------
const chartDatasets = {
    revenue: {
        label: 'Revenue (Lakhs)',
        data: [8.4, 9.2, 10.1, 10.8, 11.5, 12.4],
        borderColor: '#6366f1',
        fillColor: 'rgba(99,102,241,0.1)'
    },
    growth: {
        label: 'Client Growth',
        data: [98, 105, 112, 115, 120, 124],
        borderColor: '#10b981',
        fillColor: 'rgba(16,185,129,0.1)'
    },
    clients: {
        label: 'Client Engagement',
        data: [42, 48, 55, 62, 70, 78],
        borderColor: '#f59e0b',
        fillColor: 'rgba(245,158,11,0.1)'
    },
    aiMetrics: {
        label: 'AI Accuracy %',
        data: [82, 85, 88, 91, 93, 96],
        borderColor: '#8b5cf6',
        fillColor: 'rgba(139,92,246,0.1)'
    }
};

function renderPremiumChart() {
    if (!window.Chart) return;
    
    const ctx = document.getElementById('premiumMainChart');
    if (!ctx) return;

    const context = ctx.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, chartDatasets.revenue.fillColor);
    gradient.addColorStop(1, 'transparent');

    premiumMainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: chartDatasets.revenue.label,
                data: chartDatasets.revenue.data,
                borderColor: chartDatasets.revenue.borderColor,
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: chartDatasets.revenue.borderColor,
                pointBorderWidth: 0,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                y: { 
                    grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false }, 
                    ticks: { color: '#64748b', font: { family: 'Inter' } } 
                },
                x: { 
                    grid: { display: false, drawBorder: false }, 
                    ticks: { color: '#64748b', font: { family: 'Inter' } } 
                }
            }
        }
    });

    window.dashboardCharts.push(premiumMainChart);
}

window.switchChartTab = function(type, element) {
    if (!premiumMainChart) return;

    // Update active UI
    document.querySelectorAll('.chart-tab').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Update Chart Data securely (no destroy/recreate to prevent memory leaks)
    const set = chartDatasets[type];
    
    const ctx = document.getElementById('premiumMainChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, set.fillColor);
    gradient.addColorStop(1, 'transparent');

    premiumMainChart.data.datasets[0].label = set.label;
    premiumMainChart.data.datasets[0].data = set.data;
    premiumMainChart.data.datasets[0].borderColor = set.borderColor;
    premiumMainChart.data.datasets[0].backgroundColor = gradient;
    premiumMainChart.data.datasets[0].pointBackgroundColor = set.borderColor;
    
    premiumMainChart.update();
};

async function loadLiveAnalytics() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/analytics");
        if (!response.ok) throw new Error("Analytics API error");
        const json = await response.json();
        
        if (json.success && json.data) {
            console.log("Live Analytics Loaded", json.data);
            const data = json.data;
            
            // Update Data Targets for animations
            const revEl = document.querySelector('#kpi-detail-revenue').previousElementSibling.querySelector('.anim-counter');
            if (revEl) revEl.setAttribute('data-target', data.revenue || 1245600);
            
            const subsEl = document.querySelector('#kpi-detail-subs').previousElementSibling.querySelector('.anim-counter');
            if (subsEl) subsEl.setAttribute('data-target', data.subscriptions || 124);
            
            const aiEl = document.querySelector('#kpi-detail-ai').previousElementSibling.querySelector('.anim-counter');
            if (aiEl) aiEl.setAttribute('data-target', data.ai_confidence || 94);
            
            const roiEl = document.querySelector('#kpi-detail-roi').previousElementSibling.querySelector('.anim-counter');
            if (roiEl) roiEl.setAttribute('data-target', data.marketing_roi || 3.2);

            // Update KPI Detail Texts (Retention/Churn)
            const retentionSpan = document.querySelector('#kpi-detail-subs div:nth-child(2) span:nth-child(2)');
            if (retentionSpan) retentionSpan.innerText = (data.retention_rate || 94.5) + '%';
            
            const churnSpan = document.querySelector('#kpi-detail-subs div:nth-child(1) span:nth-child(2)');
            if (churnSpan) churnSpan.innerText = (data.churn_rate || 1.2) + '% (Healthy)';
            
            // Overwrite Growth History
            if (data.growth_history && Array.isArray(data.growth_history)) {
                chartDatasets.growth.data = data.growth_history;
            }
        }
    } catch (e) {
        console.error("Failed to load live analytics, using fallback:", e);
    }
    
    requestAnimationFrame(() => {
        animateCounters();
    });

    setTimeout(() => {
        renderPremiumChart();
    }, 200);
}


async function loadDashboard() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/dashboard");
        if (!response.ok) throw new Error("Dashboard API error");
        const json = await response.json();
        
        if (json.success && json.data) {
            console.log("Dashboard Loaded:", json.data);
            window.LiveMongoDashboard = json.data;
            renderDashboard();
            console.log("Live Mongo Dashboard Synced");
        }
    } catch (e) {
        console.error("Failed to load live dashboard, using fallback:", e);
    }
}

function renderDashboard() {
    const data = window.LiveMongoDashboard;
    if (!data) return;

    // Update Header
    const welcomeTitle = document.querySelector('.dash-header h1');
    if (welcomeTitle && data.workspace) {
        welcomeTitle.innerHTML = `Welcome back to ${data.workspace}`;
    }

    // Update KPI Data Targets
    const revEl = document.querySelector('#kpi-detail-revenue');
    if (revEl && revEl.previousElementSibling) {
        const counter = revEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.total_revenue || 0);
    }
    
    const subsEl = document.querySelector('#kpi-detail-subs');
    if (subsEl && subsEl.previousElementSibling) {
        const counter = subsEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.active_subscriptions || 0);
    }
    
    const aiEl = document.querySelector('#kpi-detail-ai');
    if (aiEl && aiEl.previousElementSibling) {
        const counter = aiEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.ai_confidence || 0);
    }
    
    const roiEl = document.querySelector('#kpi-detail-roi');
    if (roiEl && roiEl.previousElementSibling) {
        const counter = roiEl.previousElementSibling.querySelector('.anim-counter');
        if (counter) counter.setAttribute('data-target', data.marketing_roi || 0);
    }

    // Update KPI Detail Texts (Retention/Churn)
    const retentionSpan = document.querySelector('#kpi-detail-subs div:nth-child(2) span:nth-child(2)');
    if (retentionSpan) retentionSpan.innerText = (data.retention_rate || 0) + '%';
    
    const churnSpan = document.querySelector('#kpi-detail-subs div:nth-child(1) span:nth-child(2)');
    if (churnSpan) churnSpan.innerText = (data.churn_rate || 0) + '% (Healthy)';

    // Update Health Score UI
    const healthEls = document.querySelectorAll('.health-score-container'); // Find any element that might display health
    // Actually in dashboard.html it's typically within a specific card. Let's rely on standard elements if any.


    // Update Activity Feed
    const feedContainer = document.getElementById('activityFeed');
    if (feedContainer && data.activity_feed) {
        feedContainer.innerHTML = data.activity_feed.map(item => `
            <div class="feed-item">
                <div class="feed-icon"><i data-lucide="${item.type === 'revenue' ? 'indian-rupee' : (item.type === 'user' ? 'user' : 'cpu')}" class="icon-sm text-${item.type === 'revenue' ? 'green' : (item.type === 'user' ? 'blue' : 'purple')}-500"></i></div>
                <div class="feed-content">
                    <h5>${item.type === 'revenue' ? 'Payment Event' : (item.type === 'user' ? 'User Activity' : 'System Event')}</h5>
                    <p>${item.message}</p>
                    <span class="feed-time">${item.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Update AI Insights
    const aiContainer = document.querySelector('.dash-card-header + .insight-card');
    if (aiContainer && data.ai_insights) {
        const parent = aiContainer.parentElement;
        if (parent) {
            const insightsHtml = data.ai_insights.map((msg, idx) => `
                <div class="insight-card">
                    <div class="insight-top">
                        <div class="insight-title"><i data-lucide="${idx === 0 ? 'trending-up' : 'alert-circle'}" class="icon-sm text-${idx === 0 ? 'blue' : 'amber'}-400"></i> ${idx === 0 ? 'Trajectory Optimal' : 'Retention Risk'}</div>
                        <div class="insight-confidence" ${idx !== 0 ? 'style="color: #f59e0b; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.2);"' : ''}>${idx === 0 ? '96% Conf.' : '82% Conf.'}</div>
                    </div>
                    <div class="insight-body">
                        ${msg}
                    </div>
                </div>
            `).join('');
            
            // Remove old insight cards safely using the cached parent reference
            const oldCards = parent.querySelectorAll('.insight-card');
            oldCards.forEach(c => c.remove());
            
            // Insert new ones safely
            parent.insertAdjacentHTML('beforeend', insightsHtml);
        }
    }
    
    // Re-initialize lucide icons for new HTML
    if (window.lucide) {
        setTimeout(() => { window.lucide.createIcons(); }, 50);
    }

    // Overwrite Chart Datasets

    if (data.revenue_growth) chartDatasets.revenue.data = data.revenue_growth;
    if (data.client_growth) chartDatasets.growth.data = data.client_growth;
    if (data.ai_metrics) chartDatasets.aiMetrics.data = data.ai_metrics;

    // Trigger Animations and Chart rendering
    requestAnimationFrame(() => {
        try {
            animateCounters();
        } catch (e) {
            console.error("Counter animation failed:", e);
        }
    });

    setTimeout(() => {
        try {
            renderPremiumChart();
            console.log("Dashboard Render Complete");
        } catch (e) {
            console.error("Premium chart rendering failed:", e);
        }
    }, 200);
}
