// dashboard.js - Premium VenturX Edition (Ultra-Stable)

window.dashboardCharts = [];
let premiumMainChart = null;

window.initDashboardPage = function() {
    console.log("INITIALIZING VENTURX PREMIUM DASHBOARD");

    // 1. Safety Guard
    setTimeout(() => {
        document.body.classList.remove("loading");
        const loader = document.getElementById("globalLoader");
        if(loader) loader.remove();
    }, 100);

    // 2. Safe KPI Animations (Runs ONCE)
    requestAnimationFrame(() => {
        animateCounters();
    });

    // 3. Safe Chart Rendering (Deferred slightly to ensure layout is ready)
    setTimeout(() => {
        renderPremiumChart();
    }, 200);

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
