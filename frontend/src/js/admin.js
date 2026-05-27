// src/js/admin.js - VenturX Admin Control Center Logic (Highly Interactive)

window.AdminState = {
  currentTab: localStorage.getItem('admin_currentTab') || 'overview',
  searchQuery: '',
  planFilter: 'All'
};

window.AdminUI = {
  activeCharts: {},
  
  openOverlay: function(type, title, htmlContent) {
    const root = document.getElementById('admin-overlay-root');
    if(!root) return;
    
    // Clear root first to prevent duplication
    root.innerHTML = '';
    
    if (type === 'modal') {
      root.className = 'admin-overlay-root modal-mode';
      root.innerHTML = `
        <div class="admin-backdrop" onclick="window.closeAdminOverlay()"></div>
        <div class="admin-modal" style="display:flex;">
          <div class="admin-drawer-header">
            <h3 class="admin-drawer-title">${title}</h3>
            <button class="admin-drawer-close" onclick="window.closeAdminOverlay()"><i data-lucide="x"></i></button>
          </div>
          <div class="admin-drawer-body">
            ${htmlContent}
          </div>
        </div>
      `;
    } else {
      root.className = 'admin-overlay-root';
      root.innerHTML = `
        <div class="admin-backdrop" onclick="window.closeAdminOverlay()"></div>
        <div class="admin-drawer" style="transform:translateX(0);">
          <div class="admin-drawer-header">
            <h3 class="admin-drawer-title">${title}</h3>
            <button class="admin-drawer-close" onclick="window.closeAdminOverlay()"><i data-lucide="x"></i></button>
          </div>
          <div class="admin-drawer-body">
            ${htmlContent}
          </div>
        </div>
      `;
    }
    
    // Slight delay for animation if needed
    setTimeout(() => {
      root.classList.add('active');
    }, 10);
    
    if (window.lucide) window.lucide.createIcons();
  },
  
  closeOverlay: function() {
    const root = document.getElementById('admin-overlay-root');
    if(root) {
      root.classList.remove('active');
      setTimeout(() => {
        root.innerHTML = '';
        root.className = 'admin-overlay-root';
      }, 300);
    }
  },
  
  destroyAllCharts: function() {
    for (const key in this.activeCharts) {
      if (this.activeCharts[key]) {
        this.activeCharts[key].destroy();
        delete this.activeCharts[key];
      }
    }
  },
  
  renderLineChart: function(canvasId, labels, dataPoints, color) {
    const ctx = document.getElementById(canvasId);
    if(!ctx) return;
    
    if(this.activeCharts[canvasId]) {
      this.activeCharts[canvasId].destroy();
    }
    if(!window.Chart) return;
    
    // Enterprise Gradient
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color + '60');
    gradient.addColorStop(1, color + '00');
    
    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Metric',
          data: dataPoints,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { 
            display: true, 
            min: Math.min(...dataPoints) * 0.9,
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { display: false }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  },
  
  renderMultiLineChart: function(canvasId, labels, datasets) {
    const ctx = document.getElementById(canvasId);
    if(!ctx) return;
    
    if(this.activeCharts[canvasId]) {
      this.activeCharts[canvasId].destroy();
    }
    if(!window.Chart) return;
    
    const chartDatasets = datasets.map(ds => {
      let bg = ds.color + '20';
      if (ds.fill !== false) {
        bg = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        bg.addColorStop(0, ds.color + '60');
        bg.addColorStop(1, ds.color + '00');
      }
      return {
        label: ds.label,
        data: ds.data,
        borderColor: ds.color,
        backgroundColor: bg,
        borderWidth: 2,
        fill: ds.fill !== false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: ds.color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
      };
    });

    let allData = [];
    datasets.forEach(ds => { allData = allData.concat(ds.data); });
    const globalMin = Math.min(...allData) * 0.9;
    
    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: chartDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 8 },
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { 
            display: true, 
            min: globalMin,
            grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { display: false }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  },
  
  renderDoughnut: function(canvasId, labels, dataPoints, colors) {
    const ctx = document.getElementById(canvasId);
    if(!ctx || !window.Chart) return;
    if(this.activeCharts[canvasId]) this.activeCharts[canvasId].destroy();
    
    this.activeCharts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Google Sans' } } }
        }
      }
    });
  },

  animateNumber: function(elementId, start, end, duration = 800) {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(progress * (end - start) + start);
      
      // format logic
      if (end > 1000000) obj.innerHTML = window.formatCurrency(current);
      else if (end > 1000) obj.innerHTML = current.toLocaleString();
      else obj.innerHTML = current;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },
  
  generateTrendData: function(currentValue, length = 12, volatility = 0.1, trend = 'up') {
    // Generate a smooth historical trend ending roughly at currentValue
    const data = [];
    let val = trend === 'up' ? currentValue * 0.4 : currentValue * 1.6;
    const step = (currentValue - val) / length;
    
    for (let i = 0; i < length - 1; i++) {
      val = val + step + (Math.random() * (currentValue * volatility) - (currentValue * volatility / 2));
      data.push(Math.max(0, Math.floor(val)));
    }
    data.push(currentValue);
    return data;
  }
};


window.LiveMongoUsers = null;

function renderUsers(mongoUsers) {
    if (!Array.isArray(mongoUsers)) return;
    window.LiveMongoUsers = mongoUsers.map(u => ({
        id: u._id,
        name: u.name || u.company || 'Unknown Workspace',
        email: u.email || 'contact@workspace.com',
        plan: u.plan || 'Starter',
        status: u.status || 'Active',
        metrics: {
            churnRisk: u.churn_risk || 'Low',
            aiUsageScore: u.ai_engagement || Math.floor(Math.random() * 50 + 20),
            revenueContribution: u.revenue || 0,
            activeCampaigns: Math.floor(Math.random() * 5)
        }
    }));
    
    // Trigger re-render if Users tab is active
    if (window.AdminState && window.AdminState.currentTab === 'users') {
        const activeView = document.getElementById('admin-view-users');
        setTimeout(() => {
            if (
                activeView &&
                window.renderAdminTab &&
                document.body.contains(activeView)
            ) {
                window.renderAdminTab('users', activeView, true);
            }
        }, 50);
    }
}

async function loadUsers() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/users");
        if (!response.ok) throw new Error("API response not OK");
        const users = await response.json();
        console.log("Live MongoDB Users:", users);
        renderUsers(users);
    } catch (error) {
        console.error("Failed to load users:", error);
    }
}

window.LiveMongoSubscriptions = [];

function renderMongoSubscriptions(mongoSubs) {
    if (!Array.isArray(mongoSubs)) return;
    window.LiveMongoSubscriptions = mongoSubs;
    
    // Trigger re-render if Subscriptions tab is active
    if (window.AdminState && window.AdminState.currentTab === 'subscriptions') {
        const activeView = document.getElementById('admin-view-subscriptions');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('subscriptions', activeView, true);
            }
        }, 50);
    }
}

async function loadSubscriptions() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/subscriptions");
        if (!response.ok) throw new Error("API response not OK");
        const subs = await response.json();
        console.log("Subscriptions Loaded:", subs);
        renderMongoSubscriptions(subs);
    } catch (error) {
        console.error("Failed to load subscriptions:", error);
    }
}

window.LiveMongoAnalytics = [];

function renderMongoAnalytics(mongoAnalytics) {
    if (!Array.isArray(mongoAnalytics)) return;
    window.LiveMongoAnalytics = mongoAnalytics;
    
    // Trigger re-render if AI Analytics tab is active
    if (window.AdminState && window.AdminState.currentTab === 'ai-analytics') {
        const activeView = document.getElementById('admin-view-ai-analytics');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('ai-analytics', activeView, true);
            }
        }, 50);
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/analytics");
        if (!response.ok) throw new Error("API response not OK");
        const analytics = await response.json();
        console.log("AI Analytics Loaded:", analytics);
        renderMongoAnalytics(analytics);
    } catch (error) {
        console.error("Failed to load AI analytics:", error);
    }
}

window.LiveMongoRecommendations = [];

function renderMongoRecommendations(mongoRecommendations) {
    if (!Array.isArray(mongoRecommendations)) return;
    window.LiveMongoRecommendations = mongoRecommendations;
    
    // Trigger re-render if Recommendations tab is active
    if (window.AdminState && window.AdminState.currentTab === 'recommendations') {
        const activeView = document.getElementById('admin-view-recommendations');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('recommendations', activeView, true);
            }
        }, 50);
    }
}

async function loadRecommendations() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/recommendations");
        if (!response.ok) throw new Error("API response not OK");
        const recommendations = await response.json();
        console.log("Recommendations Loaded:", recommendations);
        renderMongoRecommendations(recommendations);
    } catch (error) {
        console.error("Failed to load recommendations:", error);
    }
}

window.LivePlatformHealth = null;

function renderPlatformHealth(healthData) {
    if (!healthData) return;
    window.LivePlatformHealth = healthData;
    
    // Trigger re-render if Platform Health tab is active
    if (window.AdminState && window.AdminState.currentTab === 'health') {
        const activeView = document.getElementById('admin-view-health');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('health', activeView, true);
            }
        }, 50);
    }
}

async function loadPlatformHealth() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/platform-health");
        if (!response.ok) throw new Error("API response not OK");
        const health = await response.json();
        console.log("Platform Health Loaded:", health);
        renderPlatformHealth(health);
    } catch (error) {
        console.error("Failed to load platform health:", error);
    }
}

window.LiveMongoReports = [];

function renderMongoReports(reports) {
    if (!Array.isArray(reports)) return;
    window.LiveMongoReports = reports;
    
    // Trigger re-render if Reports tab is active
    if (window.AdminState && window.AdminState.currentTab === 'reports') {
        const activeView = document.getElementById('admin-view-reports');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('reports', activeView, true);
            }
        }, 50);
    }
}

async function loadReports() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/reports");
        if (!response.ok) throw new Error("API response not OK");
        const reports = await response.json();
        console.log("Reports Loaded:", reports);
        renderMongoReports(reports);
    } catch (error) {
        console.error("Failed to load reports:", error);
    }
}

window.LiveMongoSettings = null;

function renderMongoSettings(settings) {
    if (!settings) return;
    window.LiveMongoSettings = settings;
    
    if (window.AdminState && window.AdminState.currentTab === 'settings') {
        const activeView = document.getElementById('admin-view-settings');
        setTimeout(() => {
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                window.renderAdminTab('settings', activeView, true);
            }
        }, 50);
    }
}

async function loadSettings() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/settings");
        if (!response.ok) throw new Error("API response not OK");
        const settings = await response.json();
        console.log("Settings Loaded:", settings);
        renderMongoSettings(settings);
    } catch (error) {
        console.error("Failed to load settings:", error);
    }
}

async function saveSettings(updates) {
    if (!window.LiveMongoSettings) return;
    try {
        const updatedSettings = { ...window.LiveMongoSettings, ...updates };
        
        // Remove undefined fields
        Object.keys(updatedSettings).forEach(key => {
            if (updatedSettings[key] === undefined) {
                delete updatedSettings[key];
            }
        });
        
        const settingId = updatedSettings._id;
        const endpoint = settingId ? `http://127.0.0.1:5000/api/settings/${settingId}` : "http://127.0.0.1:5000/api/settings";
        const method = settingId ? "PUT" : "POST";
        
        const response = await fetch(endpoint, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSettings)
        });
        
        if (!response.ok) throw new Error("API response not OK");
        const data = await response.json();
        if (data.success) {
            console.log("Settings Saved:", data.settings);
            window.LiveMongoSettings = data.settings;
            // Optionally dispatch an event or show toast
        }
    } catch (error) {
        console.error("Failed to save settings:", error);
    }
}

window.initAdminDashboard = function() {
  const navItems = document.querySelectorAll('.admin-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-admin-tab');
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      const views = document.querySelectorAll('.admin-view');
      views.forEach(v => v.classList.remove('active'));
      
      const activeView = document.getElementById(`admin-view-${tab}`);
      if (activeView) {
        console.log("Rendering users safely...");
        activeView.classList.add('active');
        const adminTopTitle = document.getElementById('adminTopTitle');
        if (adminTopTitle) {
          let title = item.textContent.trim();
          if (tab === 'ai-analytics') {
            title = "AI Analytics Dashboard";
          } else if (tab === 'recommendations') {
            title = "AI Recommendation Intelligence";
          }
          adminTopTitle.textContent = title;
        }
        window.AdminState.currentTab = tab;
        localStorage.setItem('admin_currentTab', tab);
        renderAdminTab(tab, activeView);
      }
    });
  });

  window.addEventListener('admin:data-synced', () => {
    const activeView = document.getElementById(`admin-view-${window.AdminState.currentTab}`);
    if (activeView) {
      renderAdminTab(window.AdminState.currentTab, activeView, true);
    }
  });

  // Initial Render (restore state)
  const initialTab = window.AdminState.currentTab;
  const initialNav = document.querySelector(`.admin-nav-item[data-admin-tab="${initialTab}"]`);
  if(initialNav) {
    initialNav.click();
  } else {
    renderAdminTab('overview', document.getElementById('admin-view-overview'));
  }

  // Enterprise Live Event Loop
  if (!window.AdminState.liveInterval) {
    window.AdminState.liveInterval = setInterval(() => {
      const adminPanel = document.getElementById('adminPanel');
      if (adminPanel) {
        console.log("Rendering users safely...");
        if (adminPanel.classList.contains('active')) {
          window.dispatchEvent(new CustomEvent('admin:live-tick'));
        }
      }
    }, 4500); // Tick every 4.5 seconds
  }

  // Live Streams Sync (Terminal + Feed + KPIs)
  window.addEventListener('admin:live-tick', () => {
    // 1. Update KPIs if they exist (Overview)
    if (document.getElementById('card-revenue') && document.querySelector('#card-revenue .admin-kpi-value')) {
      const el = document.querySelector('#card-revenue .admin-kpi-value');
      const val = parseInt(el.textContent.replace(/[^0-9]/g, ''));
      if (!isNaN(val)) window.AdminUI.animateNumber(el.id || (el.id = 'kpi-rev'), val, val + Math.floor(Math.random() * 500));
    }
    
    // 2. Stream AI Terminal (if on Health or Analytics tab)
    const terminal = document.querySelector('.admin-terminal-content');
    if (terminal) {
      let msgs = [];
      if (window.LivePlatformHealth && window.LivePlatformHealth.logs && window.LivePlatformHealth.logs.length > 0) {
        msgs = window.LivePlatformHealth.logs.map(log => {
          let color = '#fff';
          if (log.type === 'WARN') color = '#f59e0b';
          if (log.type === 'ERR') color = '#ef4444';
          if (log.type === 'SYS') color = '#94a3b8';
          if (log.type === 'SEC') color = '#10b981';
          return `<span style="color:${color}">[${log.type}] ${log.message}</span>`;
        });
      } else {
        msgs = [
          '[SYS] Checking container registry... OK',
          '[AI] Optimized vector embeddings (12ms)',
          '[DB] Executing vacuum on accounts table... OK',
          '[SEC] Token rotation successful.',
          `[ROUTE] /api/v1/workspaces - 200 OK (${Math.floor(Math.random()*40+10)}ms)`,
          '[AI] Queue flushed. 0 pending jobs.',
          '<span style="color:#f59e0b;">[WARN] GC Pause detected on redis cluster 2.</span>',
          '[SYS] Autoscaling node provisioned...',
          `[ROUTE] /api/v1/auth - 200 OK (${Math.floor(Math.random()*20+10)}ms)`,
          `> req_id:${Math.floor(Math.random()*90000+10000)} processing CRM... ${Math.floor(Math.random()*30+10)}ms`,
          `> req_id:${Math.floor(Math.random()*90000+10000)} generating forecast... ${Math.floor(Math.random()*150+50)}ms`
        ];
      }
      const newDiv = document.createElement('div');
      newDiv.innerHTML = msgs[Math.floor(Math.random() * msgs.length)];
      newDiv.classList.add('admin-anim-slide-down');
      terminal.prepend(newDiv);
      if (terminal.children.length > 20) {
        terminal.removeChild(terminal.lastChild);
      }
    }
    
    // 3. Scroll Charts (simulated streaming)
    if (window.AdminUI.activeCharts) {
      Object.keys(window.AdminUI.activeCharts).forEach(key => {
        const chart = window.AdminUI.activeCharts[key];
        if (chart.config.type === 'line' && chart.data.datasets.length > 0) {
          chart.data.datasets.forEach(ds => {
             if (ds.data.length > 0) {
                const last = ds.data[ds.data.length - 1];
                const shift = ds.data.shift();
                ds.data.push(last + (Math.random() * (last * 0.05) - (last * 0.025)));
             }
          });
          chart.update('none'); // Update without full animation for smoother streaming
        }
      });
    }
  });

  // Load live MongoDB users, subscriptions, analytics, and recommendations
  loadUsers();
  loadSubscriptions();
  loadAnalytics();
  loadRecommendations();
  loadPlatformHealth();
  loadReports();
  loadSettings();
  loadOverview();
  
  // Platform Health polling loop (every 10s)
  if (!window.AdminState.healthInterval) {
    window.AdminState.healthInterval = setInterval(() => {
      loadPlatformHealth();
    }, 10000);
  }

  // Overview polling loop (every 15s)
  if (!window.AdminState.overviewInterval) {
    window.AdminState.overviewInterval = setInterval(() => {
      loadOverview();
    }, 15000);
  }
};

const renderedTabs = new Set();

function renderAdminTab(tab, container, force = false) {
  if (renderedTabs.has(tab) && !force && tab !== 'recommendations' && tab !== 'users' && tab !== 'subscriptions' && tab !== 'ai-analytics') return;
  renderedTabs.add(tab);
  
  if (!container) return;


  
  // Safely destroy charts before replacing innerHTML
  window.AdminUI.destroyAllCharts();
  
  try {
    console.log("Rendering users safely...");
    switch(tab) {
      case 'overview': container.innerHTML = getOverviewHTML(); setTimeout(() => { bindOverviewEvents(); }, 0); break;
            case 'users': 
        const usersHTML = getUsersHTML();
        console.log("Users HTML Generated");
        console.log(usersHTML.substring(0, 50) + "...");
        console.log(container);
        container.innerHTML = usersHTML; 
        bindUserEvents(); 
        break;
      case 'subscriptions': container.innerHTML = getSubscriptionsHTML(); bindSubscriptionEvents(); break;
      case 'ai-analytics': container.innerHTML = getAiAnalyticsHTML(); bindAiAnalyticsEvents(); break;
      case 'recommendations': container.innerHTML = getRecommendationsHTML(); bindRecommendationEvents(); break;
      case 'health': container.innerHTML = getHealthHTML(); bindHealthEvents(); break;
      case 'reports': container.innerHTML = getReportsHTML(); bindReportsEvents(); break;
      case 'settings': container.innerHTML = getSettingsHTML(); bindSettingsEvents(); break;
    }
  } catch (err) {
    console.error("Admin Render Error:", err);
    console.log("Rendering users safely...");
    if (container) {
      container.innerHTML = `<div style="padding: 20px; color: #ef4444;">Failed to load view: ${err.message}</div>`;
    }
  }
  
  if (window.lucide) window.lucide.createIcons();
}

function formatCurrency(num) {
  return '₹' + Number(num || 0).toLocaleString('en-IN');
}

// --- Overview ---

window.LiveOverviewData = null;

async function loadOverview() {
    try {
        const response = await fetch("http://127.0.0.1:5000/api/admin/overview");
        if (!response.ok) throw new Error("API response not OK");
        const data = await response.json();
        
        const isFirstLoad = !window.LiveOverviewData;
        window.LiveOverviewData = data;
        
        if (isFirstLoad) {
            console.log("Overview Loaded");
        } else {
            console.log("Overview Refreshed");
        }
        
        if (window.AdminState && window.AdminState.currentTab === 'overview') {
            const activeView = document.getElementById('admin-view-overview');
            if (activeView && window.renderAdminTab && document.body.contains(activeView)) {
                // Render silently without jumping
                activeView.innerHTML = getOverviewHTML();
                if (typeof bindOverviewEvents === 'function') setTimeout(() => { bindOverviewEvents(); }, 0);
            }
        }
    } catch (error) {
        console.error("Failed to load overview:", error);
    }
}

function getOverviewHTML() {
  const data = window.LiveOverviewData;
  if (!data) return `<div style="color:#94a3b8; padding:20px;">Loading overview telemetry...</div>`;

  const logs = data.activity_logs || [];
  const feedHTML = logs.length === 0 
    ? `<tr><td colspan="3" style="text-align:center; color:#94a3b8;">No recent activity</td></tr>`
    : logs.map(item => {
        let actionColor = '#10b981';
        if (item.action && item.action.includes('Failed')) actionColor = '#ef4444';
        if (item.action && item.action.includes('Deleted')) actionColor = '#ef4444';
        
        return `
      <tr class="admin-table-row-interactive">
        <td style="display:flex; align-items:center; gap:8px; padding:8px 12px;">
          <div style="width:6px; height:6px; border-radius:50%; background:${actionColor};"></div>
          <i data-lucide="activity" style="width:12px; color:#94a3b8;"></i>
          ${item.user_email || 'System'}
        </td>
        <td style="padding:8px 12px;"><span class="admin-badge admin-badge-info">[${item.module || 'SYS'}]</span> ${item.action || item.message}</td>
        <td style="color:#64748b; font-family:monospace; font-size:11px; padding:8px 12px;">${new Date(item.timestamp).toLocaleTimeString()}</td>
      </tr>
    `}).join('');

  return `
    <div class="admin-section-header">
      <h2>Platform Overview</h2>
    </div>
    
    <div class="admin-executive-strip" style="padding: 12px 20px;">
      <div class="admin-executive-text" style="font-size:14px;">
        <i data-lucide="zap" class="text-amber-500"></i>
        Platform Telemetry is Online. Aggregate data fetched successfully.
      </div>
      <div class="admin-executive-metrics">
        <div class="admin-executive-metric">
          <span style="font-size:11px; color:#94a3b8;">Global Platform Health</span>
          <span style="font-size:18px; font-weight:600; color:#10b981;">${data.telemetry?.system_health_status || 100}/100</span>
        </div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-users">
        <div class="admin-kpi-title" style="font-size:12px;">Total Users</div>
        <div class="admin-kpi-value" style="font-size:24px;">${(data.total_users || 0).toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="users" style="width:12px;"></i> Active Accounts</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-workspaces">
        <div class="admin-kpi-title" style="font-size:12px;">Active Subscriptions</div>
        <div class="admin-kpi-value" style="font-size:24px;">${(data.active_subscriptions || 0).toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="briefcase" style="width:12px;"></i> View Directory</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-revenue">
        <div class="admin-kpi-title" style="font-size:12px;">Analyzed Revenue</div>
        <div class="admin-kpi-value" style="font-size:24px;">₹${Number(data.total_revenue || 0).toLocaleString('en-IN')}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="dollar-sign" style="width:12px;"></i> Click for trends</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-health">
        <div class="admin-kpi-title" style="font-size:12px;">Avg AI Score</div>
        <div class="admin-kpi-value" style="font-size:24px; color:#10b981;">${data.avg_ai_score || 0}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="activity" style="width:12px;"></i> Intelligent Index</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Live Activity Feed</h3>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="padding:8px 12px;">User / Source</th>
                <th style="padding:8px 12px;">Event</th>
                <th style="padding:8px 12px;">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${feedHTML}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">System Telemetry</h3>
          <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:12px; font-size:13px;">
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">API Latency</span>
              <span style="color:#f8fafc;">${data.telemetry?.api_latency || 0}ms</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Active Sessions</span>
              <span style="color:#f8fafc;">${data.telemetry?.active_sessions || 0}</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">CPU Usage</span>
              <span style="color:#f8fafc;">${data.telemetry?.cpu_usage || 0}%</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Enterprise Accounts</span>
              <span style="color:#f8fafc;">${data.enterprise_accounts || 0}</span>
            </li>
            <li style="display:flex; justify-content:space-between;">
              <span style="color:#94a3b8;">Total Reports</span>
              <span style="color:#f8fafc;">${data.total_reports || 0}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function bindOverviewEvents() {
  setTimeout(() => {
    console.log("Overview Events Bound");
    
    const revenueCard = document.getElementById('card-revenue');
    if (revenueCard) {
      revenueCard.onclick = () => {
        window.AdminUI.openOverlay('drawer', 'Revenue Intelligence', `
          <div style="color:#94a3b8; font-size:14px; margin-bottom:24px;">Deep dive into platform financial health and cohort behavior.</div>
          <div class="admin-chart-wrapper" style="height:220px; margin-bottom:24px; position:relative;">
            <div class="admin-chart-overlay">
              <div class="overlay-title">Forecast</div>
              <div class="overlay-value" style="color:#10b981;">Strong Growth</div>
            </div>
            <canvas id="drawerRevChart"></canvas>
          </div>
          <h4 style="color:#fff; margin-bottom:12px;">Top Performing Tiers</h4>
          <p style="color:#10b981;">Enterprise subscriptions account for 68% of new MRR this month.</p>
        `);
        
        setTimeout(() => {
          const current = (window.LiveOverviewData && window.LiveOverviewData.total_revenue) ? window.LiveOverviewData.total_revenue : 0;
          const ds1 = window.AdminUI.generateTrendData(current || 10000, 12, 0.1, 'up');
          const ds2 = window.AdminUI.generateTrendData((current || 10000) * 1.2, 12, 0.05, 'up'); // Projection
          
          window.AdminUI.renderMultiLineChart('drawerRevChart', Array(12).fill(''), [
            { data: ds1, color: '#3b82f6', label: 'Current MRR', fill: true },
            { data: ds2, color: '#10b981', label: 'Projected', fill: false }
          ]);
        }, 50);
      };
    }

    const usersCard = document.getElementById('card-users');
    if (usersCard) {
      usersCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="users"]');
          if (tab) tab.click();
      };
    }

    const workspacesCard = document.getElementById('card-workspaces');
    if (workspacesCard) {
      workspacesCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="subscriptions"]');
          if (tab) tab.click();
      };
    }

    const healthCard = document.getElementById('card-health');
    if (healthCard) {
      healthCard.onclick = () => {
          const tab = document.querySelector('.admin-nav-item[data-admin-tab="ai-analytics"]');
          if (tab) tab.click();
      };
    }

    console.log("Overview Render Complete");
  }, 0);
}

// --- Users ---
function getUsersHTML() {
  const accounts = window.LiveMongoUsers || window.AdminEngine.getAccountsData() || [];
  const query = window.AdminState.searchQuery.toLowerCase();
  
  const filtered = accounts.filter(acc => 
    acc.name.toLowerCase().includes(query) || acc.email.toLowerCase().includes(query)
  );
  
  const rows = filtered.map((acc, idx) => `
    <tr class="admin-table-row-interactive" data-user-idx="${idx}">
      <td>
        <div class="admin-user-cell">
          <div class="admin-user-avatar">${acc.name.substring(0, 2).toUpperCase()}</div>
          <div>
            <div style="font-weight:600; display:flex; align-items:center; gap:6px;">${acc.name} ${idx % 3 === 0 ? '<span style="width:6px; height:6px; background:#10b981; border-radius:50%;" title="Active Now"></span>' : ''}</div>
            <div style="font-size:12px; color:#94a3b8;">${acc.email}</div>
          </div>
        </div>
      </td>
      <td><span class="admin-badge admin-badge-${acc.metrics.churnRisk === 'High' ? 'danger' : (acc.metrics.churnRisk === 'Medium' ? 'warning' : 'success')}">${acc.metrics.churnRisk}</span></td>
      <td><div style="display:flex; align-items:center; gap:8px;">${acc.metrics.aiUsageScore} <div class="admin-progress-bar" style="width:40px;"><div class="admin-progress-fill" style="width:${acc.metrics.aiUsageScore}%; background:#3b82f6;"></div></div></div></td>
      <td>${formatCurrency(acc.metrics.revenueContribution)}</td>
      <td><span class="admin-badge ${acc.plan === 'Enterprise' ? 'admin-badge-success' : 'admin-badge-info'}">${acc.plan}</span></td>
      <td>${idx % 2 === 0 ? 'Today' : '3d ago'}</td>
      <td>${acc.metrics.activeCampaigns}</td>
      <td>${Math.floor(acc.metrics.revenueContribution * 0.42)}</td>
      <td><button class="admin-btn" style="padding:4px 8px; font-size:12px;"><i data-lucide="eye" style="width:12px;"></i> View</button></td>
    </tr>
  `).join('');

  return `
    <div class="admin-section-header">
      <h2>User & Workspace Analytics</h2>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr; margin-bottom: 24px;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Active Users Growth & Signup Trend</h3>
        <div class="admin-chart-wrapper" style="height:180px;">
          <canvas id="usersGrowthChart"></canvas>
        </div>
      </div>
      <div class="admin-card" style="display:flex; flex-direction:column; gap:16px;">
        <h3 style="margin: 0; font-size: 16px;">Workspace Intelligence Summary</h3>
        <div class="admin-grid" style="grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:0;">
           <div style="background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.1); padding: 12px; border-radius: 8px;">
             <div style="color: #94a3b8; font-size: 12px;">Avg AI Score</div>
             <div style="color: #10b981; font-weight: 600; font-size: 20px;">84/100</div>
           </div>
           <div style="background: rgba(244,63,94,0.05); border: 1px solid rgba(244,63,94,0.1); padding: 12px; border-radius: 8px;">
             <div style="color: #94a3b8; font-size: 12px;">High Churn Risk</div>
             <div style="color: #f43f5e; font-weight: 600; font-size: 20px;">${accounts.filter(a => a.metrics.churnRisk === 'High').length}</div>
           </div>
           <div style="background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.1); padding: 12px; border-radius: 8px;">
             <div style="color: #94a3b8; font-size: 12px;">Global Retention</div>
             <div style="color: #3b82f6; font-weight: 600; font-size: 20px;">94.2%</div>
           </div>
           <div style="background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.1); padding: 12px; border-radius: 8px;">
             <div style="color: #94a3b8; font-size: 12px;">Activity Score</div>
             <div style="color: #8b5cf6; font-weight: 600; font-size: 20px;">High</div>
           </div>
        </div>
        <div style="margin-top:auto;">
          <h4 style="color:#94a3b8; font-size:12px; margin-bottom:8px;">Plan Distribution Matrix</h4>
          <div style="display:flex; height:24px; border-radius:4px; overflow:hidden;">
             <div style="width:20%; background:#f43f5e;" title="Enterprise"></div>
             <div style="width:50%; background:#8b5cf6;" title="Growth"></div>
             <div style="width:30%; background:#3b82f6;" title="Starter"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="display:flex; gap:16px; margin-bottom:16px;">
      <div style="flex:1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px;">
        <div style="font-size:12px; color:#94a3b8;">Active Workspaces</div>
        <div style="font-size:18px; font-weight:600; color:#fff;">${window.LiveOverviewData ? window.LiveOverviewData.active_subscriptions : (window.LiveMongoUsers ? window.LiveMongoUsers.length : 0)}</div>
      </div>
      <div style="flex:1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px;">
        <div style="font-size:12px; color:#94a3b8;">Enterprise Users</div>
        <div style="font-size:18px; font-weight:600; color:#fff;">${window.LiveOverviewData ? window.LiveOverviewData.enterprise_accounts : (window.LiveMongoUsers ? window.LiveMongoUsers.filter(a => a.plan === 'Enterprise').length : 0)}</div>
      </div>
      <div style="flex:1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px;">
        <div style="font-size:12px; color:#94a3b8;">Suspended Accounts</div>
        <div style="font-size:18px; font-weight:600; color:#f43f5e;">2</div>
      </div>
      <div style="flex:1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px;">
        <div style="font-size:12px; color:#94a3b8;">Avg AI Interactions</div>
        <div style="font-size:18px; font-weight:600; color:#10b981;">142/day</div>
      </div>
    </div>

    <div class="admin-input-group">
      <div class="admin-input-wrapper">
        <i data-lucide="search" class="admin-input-icon"></i>
        <input type="text" class="admin-input" id="adminUserSearch" placeholder="Search by name, email, or domain..." value="${window.AdminState.searchQuery}">
      </div>
      <button class="admin-btn admin-btn-primary"><i data-lucide="filter" style="width:16px;"></i> Filter</button>
    </div>

    <div class="admin-card">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>User / Company</th>
              <th>Churn Risk</th>
              <th>AI Score</th>
              <th>Revenue (MRR)</th>
              <th>Plan</th>
              <th>Last Active</th>
              <th>Campaigns</th>
              <th>AI Requests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : '<tr><td colspan="9"><div class="admin-empty-state"><i data-lucide="user-x" class="admin-empty-icon"></i><div class="admin-empty-title">No users found</div></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindUserEvents() {
  const searchInput = document.getElementById('adminUserSearch');
  if(searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.AdminState.searchQuery = e.target.value;
      clearTimeout(window.adminSearchTimeout);
      window.adminSearchTimeout = setTimeout(() => {
        renderAdminTab('users', document.getElementById('admin-view-users'), true);
        document.getElementById('adminUserSearch').focus();
      }, 300);
    });
  }

  document.querySelectorAll('.admin-table-row-interactive').forEach(row => {
    row.onclick = () => {
      const idx = row.getAttribute('data-user-idx');
      const accounts = window.LiveMongoUsers || (window.AdminEngine ? window.AdminEngine.getAccountsData() : []);
      const acc = accounts[idx];
      
      window.AdminUI.openOverlay('modal', 'Enterprise Profile: ' + acc.name, `
        <div style="display:flex; gap:24px;">
          <div style="flex:1;">
            <div class="admin-user-avatar" style="width:64px; height:64px; font-size:24px; margin-bottom:16px; border:2px solid #10b981;">${acc.name.substring(0,2).toUpperCase()}</div>
            <h3 style="color:#fff; margin-bottom:4px; font-size:20px;">${acc.name}</h3>
            <p style="color:#94a3b8; font-size:14px; margin-bottom:16px;">${acc.email}</p>
            <div class="admin-badge admin-badge-success" style="margin-bottom:16px;">${acc.plan}</div>
            <p style="color:#94a3b8; font-size:13px;"><i data-lucide="briefcase" style="width:14px;"></i> ${acc.industry || 'Tech Sector'}</p>
            <div style="margin-top:24px;">
              <h4 style="color:#fff; margin-bottom:8px;">Churn Risk Profile</h4>
              <div class="admin-progress-bar"><div class="admin-progress-fill" style="width:${acc.metrics.churnRisk === 'High' ? '90%' : (acc.metrics.churnRisk === 'Medium' ? '50%' : '15%')}; background:${acc.metrics.churnRisk === 'High' ? '#ef4444' : '#10b981'}"></div></div>
            </div>
          </div>
          <div style="flex:2; display:flex; flex-direction:column; gap:16px;">
            <div class="admin-grid" style="grid-template-columns: 1fr 1fr; margin-bottom:0;">
                <div class="admin-card" style="padding:16px;">
                  <h4 style="color:#94a3b8; font-size:13px; margin:0 0 8px 0;">Active Campaigns</h4>
                  <div style="font-size:24px; font-weight:700; color:#fff;">${acc.metrics.activeCampaigns}</div>
                </div>
                <div class="admin-card" style="padding:16px;">
                  <h4 style="color:#94a3b8; font-size:13px; margin:0 0 8px 0;">Forecast Models</h4>
                  <div style="font-size:24px; font-weight:700; color:#fff;">${acc.metrics.totalForecasts}</div>
                </div>
            </div>
            <div class="admin-card" style="padding:16px; flex:1;">
               <h4 style="color:#fff; margin-bottom:16px;">Engagement Timeline</h4>
               <div class="admin-chart-wrapper" style="height:150px; padding:0; border:none; background:transparent;">
                 <canvas id="userTimelineChart"></canvas>
               </div>
            </div>
            <button class="admin-btn admin-btn-primary" style="width:100%;"><i data-lucide="activity" style="width:14px;"></i> Export Full Audit Trail</button>
          </div>
        </div>
      `);
      setTimeout(() => {
        const timelineData = Array.from({length: 10}, () => Math.floor(Math.random() * 100));
        window.AdminUI.renderLineChart('userTimelineChart', Array(10).fill(''), timelineData, '#8b5cf6');
      }, 50);
    };
  });
  
  setTimeout(() => {
    const activeUsers = window.LiveOverviewData ? window.LiveOverviewData.total_users : (window.LiveMongoUsers ? window.LiveMongoUsers.length : 0);
    const uGrowthData = window.AdminUI.generateTrendData(activeUsers, 12, 0.1, 'up');
    window.AdminUI.renderLineChart('usersGrowthChart', ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], uGrowthData, '#10b981');
  }, 100);
}

// --- Subscriptions ---
function getSubscriptionsHTML() {
  const subsData = window.LiveMongoSubscriptions || [];
  
  // Calculate dynamic metrics
  let totalMRR = 0;
  let starterCount = 0;
  let growthCount = 0;
  let enterpriseCount = 0;
  let highChurnCount = 0;
  
  subsData.forEach(sub => {
      totalMRR += parseFloat(sub.amount || 0);
      if (sub.plan === 'Starter') starterCount++;
      else if (sub.plan === 'Growth') growthCount++;
      else if (sub.plan === 'Enterprise') enterpriseCount++;
      if (sub.churn_risk === 'High') highChurnCount++;
  });
  
  const totalActive = subsData.length;
  const churnRate = totalActive > 0 ? ((highChurnCount / totalActive) * 100).toFixed(1) : 0;
  
  // Render tables dynamically
  const activeSubsRows = subsData.filter(s => s.status === 'Active').slice(0, 5).map(s => {
      let badgeClass = s.plan === 'Enterprise' ? 'admin-badge-success' : 'admin-badge-info';
      return `<tr><td>${s.company || 'Unknown'}</td><td><span class="admin-badge ${badgeClass}">${s.plan || 'Starter'}</span></td><td>${formatCurrency(s.amount || 0)}</td><td>${s.renewal_date || 'N/A'}</td></tr>`;
  }).join('');
  
  const atRiskSubsRows = subsData.filter(s => s.churn_risk === 'High' || s.churn_risk === 'Medium').slice(0, 5).map(s => {
      let badgeClass = s.churn_risk === 'High' ? 'admin-badge-danger' : 'admin-badge-warning';
      return `<tr><td>${s.company || 'Unknown'}</td><td><span class="admin-badge ${badgeClass}">${s.churn_risk} Risk</span></td><td><button class="admin-btn" style="padding:4px 8px;">Alert</button></td></tr>`;
  }).join('');

  return `
    <div class="admin-section-header">
      <h2>Subscription Analytics</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #3b82f6;">
        <div class="admin-kpi-title" style="font-size:12px;">Monthly Recurring Revenue (MRR)</div>
        <div class="admin-kpi-value" style="font-size:24px;">${formatCurrency(totalMRR)}</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">+4.2% from last month</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #f43f5e;">
        <div class="admin-kpi-title" style="font-size:12px;">Churn Risk Rate</div>
        <div class="admin-kpi-value" style="font-size:24px;">${churnRate}%</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">Active Monitoring</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #10b981;">
        <div class="admin-kpi-title" style="font-size:12px;">Enterprise Accounts</div>
        <div class="admin-kpi-value" style="font-size:24px;">${enterpriseCount}</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">Live from MongoDB</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #8b5cf6;">
        <div class="admin-kpi-title" style="font-size:12px;">Total Workspaces</div>
        <div class="admin-kpi-value" style="font-size:24px;">${totalActive}</div>
        <div style="color:#94a3b8; font-size:11px; margin-top:8px;">Subscribed SaaS Clients</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 2fr;">
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Plan Distribution</h3>
        <div class="admin-chart-wrapper" style="height:180px; position:relative;">
          <div class="admin-chart-overlay left" style="background:transparent; border:none; backdrop-filter:none;">
             <div class="overlay-value" style="color:#fff; font-size:24px;">${totalActive}</div>
             <div class="overlay-title">Total Active</div>
          </div>
          <canvas id="subDoughnutChart"></canvas>
        </div>
        <h3 style="margin: 24px 0 12px 0; font-size: 15px;">Revenue Contribution</h3>
        <div class="admin-chart-wrapper" style="height:140px; position:relative;">
          <canvas id="subRevenueDistChart"></canvas>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Upgrade Dynamics & Churn Trend</h3>
          <div class="admin-chart-wrapper" style="height:200px; position:relative;">
            <div class="admin-chart-overlay">
              <div class="overlay-title">Net Upgrades</div>
              <div class="overlay-value" style="color:#10b981;">+42 This Month</div>
            </div>
            <canvas id="subGrowthChart"></canvas>
          </div>
          <div style="margin-top:8px;">
            <span class="admin-micro-pill" style="color:#10b981;"><span style="width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block;"></span> Upgrades</span>
            <span class="admin-micro-pill" style="color:#f43f5e;"><span style="width:8px; height:8px; background:#f43f5e; border-radius:50%; display:inline-block;"></span> Downgrades</span>
            <span class="admin-micro-pill" style="color:#f59e0b;"><span style="width:8px; height:8px; background:#f59e0b; border-radius:50%; display:inline-block;"></span> Churn</span>
          </div>
        </div>
        <div class="admin-card admin-card-compact">
           <h3 style="margin: 0 0 12px 0; font-size: 15px;">Monthly Subscription Activity</h3>
           <div class="admin-chart-wrapper" style="height:120px; padding:0; position:relative;">
             <canvas id="subMonthlyActivityChart"></canvas>
           </div>
        </div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Live Active Subscriptions</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <thead>
              <tr><th>Company</th><th>Plan</th><th>MRR</th><th>Renewal</th></tr>
            </thead>
            <tbody>
              ${activeSubsRows || '<tr><td colspan="4" style="text-align:center;">No active subscriptions</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">At-Risk Accounts</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <thead>
               <tr><th>Company</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${atRiskSubsRows || '<tr><td colspan="3" style="text-align:center;">No at-risk accounts</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
function bindSubscriptionEvents() {
  const subsData = window.LiveMongoSubscriptions || [];
  
  let starterCount = 0;
  let growthCount = 0;
  let enterpriseCount = 0;
  
  let starterRev = 0;
  let growthRev = 0;
  let enterpriseRev = 0;
  
  subsData.forEach(sub => {
      let amt = parseFloat(sub.amount || 0);
      if (sub.plan === 'Starter') { starterCount++; starterRev += amt; }
      else if (sub.plan === 'Growth') { growthCount++; growthRev += amt; }
      else if (sub.plan === 'Enterprise') { enterpriseCount++; enterpriseRev += amt; }
  });
  
  setTimeout(() => {
    window.AdminUI.renderDoughnut('subDoughnutChart', ['Starter', 'Growth', 'Enterprise'], [starterCount || 1, growthCount || 1, enterpriseCount || 1], ['#3b82f6', '#8b5cf6', '#f43f5e']);
    
    // Multi-line Upgrade vs Downgrade vs Churn
    const upData = window.AdminUI.generateTrendData(120, 6, 0.2, 'up');
    const downData = window.AdminUI.generateTrendData(30, 6, 0.1, 'up');
    const churnData = window.AdminUI.generateTrendData(15, 6, 0.05, 'up');
    
    window.AdminUI.renderMultiLineChart('subGrowthChart', ['Jan','Feb','Mar','Apr','May','Jun'], [
      { data: upData, color: '#10b981', label: 'Upgrades', fill: true },
      { data: downData, color: '#f43f5e', label: 'Downgrades', fill: false },
      { data: churnData, color: '#f59e0b', label: 'Churn', fill: false }
    ]);
    
    window.AdminUI.renderDoughnut('subRevenueDistChart', ['Starter Rev', 'Growth Rev', 'Enterprise Rev'], [starterRev || 1, growthRev || 1, enterpriseRev || 1], ['#60a5fa', '#a78bfa', '#fb7185']);
    
    const activityData = Array.from({length:12}, () => Math.floor(Math.random() * 40) + 10);
    window.AdminUI.renderLineChart('subMonthlyActivityChart', Array(12).fill(''), activityData, '#3b82f6');
  }, 100);
}

// --- AI Analytics ---
function getAiAnalyticsHTML() {
  const analyticsData = window.LiveMongoAnalytics || [];
  
  let totalAiScore = 0;
  let totalRequests = 0;
  let totalRetention = 0;
  let churnLow = 0;
  let churnMedium = 0;
  let churnHigh = 0;
  
  analyticsData.forEach(a => {
      totalAiScore += (a.ai_score || 0);
      totalRequests += (a.monthly_ai_requests || 0);
      totalRetention += (a.retention_score || 0);
      
      if (a.predicted_churn === 'Low') churnLow++;
      else if (a.predicted_churn === 'Medium') churnMedium++;
      else if (a.predicted_churn === 'High') churnHigh++;
  });
  
  const count = analyticsData.length || 1; 
  const avgAiScore = Math.round(totalAiScore / count);
  const avgRetention = Math.round(totalRetention / count);

  const topCompaniesRows = [...analyticsData].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0)).slice(0, 5).map(a => {
      return `<tr><td>${a.company || 'Unknown'}</td><td><span class="admin-badge admin-badge-success">${a.ai_score || 0}</span></td><td>${(a.monthly_ai_requests || 0).toLocaleString()}</td><td>+${a.growth_index || 0}%</td><td>${a.retention_score || 0}%</td></tr>`;
  }).join('');
  
  const atRiskRows = analyticsData.filter(a => a.predicted_churn !== 'Low').map(a => {
      let badgeClass = a.predicted_churn === 'High' ? 'admin-badge-danger' : 'admin-badge-warning';
      return `<tr><td>${a.company || 'Unknown'}</td><td><span class="admin-badge ${badgeClass}">${a.predicted_churn}</span></td><td><button class="admin-btn" style="padding:4px 8px;">Review Strategy</button></td></tr>`;
  }).join('');

  return `
    <div class="admin-section-header">
      <h2>AI Platform Intelligence</h2>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Monthly AI Requests & Intelligence Score</h3>
          <div class="admin-grid" style="grid-template-columns: 2fr 1fr; gap:16px; margin-bottom:0;">
            <div>
              <div class="admin-chart-wrapper" style="height:180px; position:relative;">
                <div class="admin-chart-overlay">
                  <div class="overlay-title">Total Processed</div>
                  <div class="overlay-value" style="color:#8b5cf6;">${(totalRequests / 1000).toFixed(1)}k Req</div>
                </div>
                <canvas id="aiTokensChart"></canvas>
              </div>
            </div>
            <div>
              <div class="admin-chart-wrapper" style="height:180px; position:relative;">
                <canvas id="aiForecastAccuracyChart"></canvas>
              </div>
              <div style="margin-top:8px; text-align:center;">
                <span class="admin-micro-pill"><i data-lucide="target" style="width:12px;"></i> ${avgAiScore} Avg Score</span>
              </div>
            </div>
          </div>
          <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-top:16px; margin-bottom:0;">
             <div style="background: rgba(16,185,129,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">Average Retention</div>
               <div style="color: #10b981; font-weight: 600; font-size: 16px;">${avgRetention}%</div>
             </div>
             <div style="background: rgba(59,130,246,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">Total Connected</div>
               <div style="color: #3b82f6; font-weight: 600; font-size: 16px;">${count} Accounts</div>
             </div>
             <div style="background: rgba(245,158,11,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">High Churn Risk</div>
               <div style="color: #f59e0b; font-weight: 600; font-size: 16px;">${churnHigh} Accounts</div>
             </div>
          </div>
        </div>
        
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Engagement Density</h3>
          <div class="admin-grid" style="grid-template-columns: 1fr; gap:16px; margin-bottom:0;">
             <div>
                 <div class="admin-chart-wrapper" style="height:140px; position:relative;">
                    <div class="admin-chart-overlay">
                      <div class="overlay-title">Live Tracking</div>
                    </div>
                    <canvas id="aiLatencyHeatmap"></canvas>
                 </div>
             </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Churn Risk Distribution</h3>
          <div class="admin-chart-wrapper" style="height:180px; margin-bottom:12px; position:relative;">
            <canvas id="aiModelDistChart"></canvas>
          </div>
          <div style="margin-top:8px; margin-bottom:16px;">
            <span class="admin-micro-pill" style="color:#10b981;"><span style="width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block;"></span> Low ${churnLow}</span>
            <span class="admin-micro-pill" style="color:#f59e0b;"><span style="width:8px; height:8px; background:#f59e0b; border-radius:50%; display:inline-block;"></span> Medium ${churnMedium}</span>
            <span class="admin-micro-pill" style="color:#f43f5e;"><span style="width:8px; height:8px; background:#f43f5e; border-radius:50%; display:inline-block;"></span> High ${churnHigh}</span>
          </div>
          
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:#94a3b8; font-size:12px;">Global Platform Health</span>
            <span style="color:#fff; font-weight:600; font-size:12px;">${avgRetention > 80 ? 'Optimal' : 'Warning'}</span>
          </div>
          <div class="admin-progress-bar" style="height:4px;"><div class="admin-progress-fill" style="width:${avgRetention}%; background:#3b82f6"></div></div>
        </div>
        
        <div class="admin-card admin-card-compact" style="padding:0; overflow:hidden;">
          <div style="padding:12px; background:rgba(0,0,0,0.5); border-bottom:1px solid #334155;">
            <h3 style="margin:0; font-size:12px; font-family:monospace; color:#94a3b8; display:flex; justify-content:space-between;">Live Inference Monitor <span class="admin-pulse-indicator live"></span></h3>
          </div>
          <div style="padding:12px; font-family:monospace; font-size:11px; color:#10b981; height:120px; overflow:hidden; background:#000;">
             <div>> req_id:48324 processing CRM... 24ms</div>
             <div>> req_id:48325 segmentation... 12ms</div>
             <div>> req_id:48326 generating forecast... 112ms</div>
             <div style="color:#f59e0b;">> req_id:48327 LLM payload large... 450ms</div>
             <div>> cluster autoscaling triggered...</div>
             <div>> nodes allocated... OK</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr; margin-top:16px;">
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Top AI Companies</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <thead>
              <tr><th>Company</th><th>AI Score</th><th>Monthly Requests</th><th>Growth Index</th><th>Retention Score</th></tr>
            </thead>
            <tbody>
              ${topCompaniesRows || '<tr><td colspan="5" style="text-align:center;">No analytics data available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">At-Risk AI Accounts</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <thead>
               <tr><th>Company</th><th>Risk Level</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${atRiskRows || '<tr><td colspan="3" style="text-align:center;">No accounts currently at risk</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function bindAiAnalyticsEvents() {
  const analyticsData = window.LiveMongoAnalytics || [];
  
  let churnLow = 0; let churnMedium = 0; let churnHigh = 0;
  
  analyticsData.forEach(a => {
      if (a.predicted_churn === 'Low') churnLow++;
      else if (a.predicted_churn === 'Medium') churnMedium++;
      else if (a.predicted_churn === 'High') churnHigh++;
  });

  setTimeout(() => {
    const scores = analyticsData.map(a => a.ai_score || 0).slice(0, 14);
    const requests = analyticsData.map(a => a.monthly_ai_requests || 0).slice(0, 14);
    const engagement = analyticsData.map(a => a.engagement_rate || 0).slice(0, 20);
    
    // Ensure we have enough data points to plot by padding if needed
    while (scores.length < 14) scores.push(Math.floor(Math.random() * 40 + 60));
    while (requests.length < 14) requests.push(Math.floor(Math.random() * 5000 + 1000));
    while (engagement.length < 20) engagement.push(Math.floor(Math.random() * 100));

    window.AdminUI.renderMultiLineChart('aiTokensChart', Array(14).fill(''), [
      { data: requests, color: '#8b5cf6', label: 'AI Requests', fill: true }
    ]);
    
    window.AdminUI.renderLineChart('aiForecastAccuracyChart', Array(14).fill(''), scores, '#10b981');
    
    window.AdminUI.renderDoughnut('aiModelDistChart', ['Low Risk', 'Medium Risk', 'High Risk'], [churnLow || 1, churnMedium || 1, churnHigh || 1], ['#10b981', '#f59e0b', '#f43f5e']);
    
    window.AdminUI.renderMultiLineChart('aiLatencyHeatmap', Array(20).fill(''), [
      { data: engagement, color: '#f43f5e', label: 'Engagement Density', fill: true }
    ]);
  }, 100);
}

// --- Recommendations ---
function getRecommendationsHTML() {
  const recommendations = window.LiveMongoRecommendations || [];
  
  let totalHighPriority = 0;
  let totalConfidence = 0;
  let totalAccepted = 0;
  let totalIgnored = 0;
  let totalImpact = 0;
  
  recommendations.forEach(r => {
      if (r.priority === 'High') totalHighPriority++;
      if (r.status === 'Accepted') totalAccepted++;
      if (r.status === 'Ignored') totalIgnored++;
      totalConfidence += (r.ai_confidence || 0);
      totalImpact += (r.impact || 0);
  });
  
  const count = recommendations.length || 1;
  const avgConfidence = Math.round(totalConfidence / count);
  const acceptanceRate = Math.round((totalAccepted / count) * 100);
  const ignoredRate = Math.round((totalIgnored / count) * 100);
  
  const formattedImpact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalImpact);

  return `
    <div class="admin-section-header">
      <h2>Global Recommendation Triggers</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr 1fr; margin-bottom:24px;">
      <div class="admin-card admin-kpi-card">
        <div class="admin-kpi-title">High Priority Triggers</div>
        <div class="admin-kpi-value">${totalHighPriority}</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #10b981;">
        <div class="admin-kpi-title">Acceptance Rate</div>
        <div class="admin-kpi-value">${acceptanceRate}%</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #f43f5e;">
        <div class="admin-kpi-title">Ignored Rate</div>
        <div class="admin-kpi-value">${ignoredRate}%</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #8b5cf6;">
        <div class="admin-kpi-title">Avg Confidence</div>
        <div class="admin-kpi-value">${avgConfidence}%</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #f59e0b;">
        <div class="admin-kpi-title">Est. Revenue Impact</div>
        <div class="admin-kpi-value" style="color:#f59e0b">${formattedImpact}</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Acceptance & Engagement Trend</h3>
          <div class="admin-grid" style="grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="admin-chart-wrapper" style="height:220px;">
              <canvas id="recConfChart"></canvas>
            </div>
            <div class="admin-chart-wrapper" style="height:220px;">
              <canvas id="recEngagementChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Real-Time Recommendation Stream</h3>
          <div class="admin-table-container">
            <table class="admin-table" style="font-size:12px;">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Target Workspace</th>
                  <th>Trigger Context</th>
                  <th>Impact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${recommendations.length > 0 ? recommendations.map(q => `
                  <tr>
                    <td><span class="admin-badge admin-badge-${q.category === 'CRM' ? 'info' : (q.category === 'Financial' ? 'warning' : 'success')}">${q.category || 'System'}</span></td>
                    <td>${q.company || 'Unknown'}</td>
                    <td>${q.recommendation || 'N/A'}</td>
                    <td style="color:#10b981; font-weight:600;">₹${Number(q.impact || 0).toLocaleString('en-IN')}</td>
                    <td><span style="color:${q.status === 'Accepted' ? '#10b981' : (q.status === 'Ignored' ? '#ef4444' : '#f59e0b')}">${q.status || 'Pending'}</span></td>
                  </tr>
                `).join('') : '<tr><td colspan="5" style="text-align:center;">No recommendations available</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Trigger Heatmap</h3>
          <div class="admin-chart-wrapper" style="height:150px; margin-bottom:16px;">
            <canvas id="recTriggerHeatmap"></canvas>
          </div>
          <h4 style="color:#94a3b8; font-size:12px; margin-bottom:8px;">High Performing Triggers</h4>
          <div style="background: rgba(16,185,129,0.05); padding: 8px; border-radius: 4px; border-left: 2px solid #10b981; font-size:12px; margin-bottom:8px;">"Churn Risk Detected" -> "Offer Discount" (85% CTR)</div>
          <div style="background: rgba(16,185,129,0.05); padding: 8px; border-radius: 4px; border-left: 2px solid #10b981; font-size:12px; margin-bottom:16px;">"Campaign Stalled" -> "AI Rewrite" (72% CTR)</div>
          
          <h4 style="color:#94a3b8; font-size:12px; margin-bottom:8px;">Low Performing Triggers</h4>
          <div style="background: rgba(239,68,68,0.05); padding: 8px; border-radius: 4px; border-left: 2px solid #ef4444; font-size:12px;">"New Feature" -> "Try Now" (12% CTR)</div>
        </div>
        
        <div class="admin-card" style="padding:0; overflow:hidden;">
          <div style="padding:12px; background:rgba(0,0,0,0.5); border-bottom:1px solid #334155;">
            <h3 style="margin:0; font-size:12px; font-family:monospace; color:#94a3b8;">AI Decision Trace</h3>
          </div>
          <div style="padding:12px; font-family:monospace; font-size:11px; color:#3b82f6; height:180px; overflow:hidden; background:#000;">
             <div>[EVAL] User 48A engaged with AI module.</div>
             <div>[CALC] Probability of upgrade: 68%</div>
             <div>[DECISION] Triggering "Upgrade Plan" notification.</div>
             <div style="color:#10b981;">[RSLT] Notification sent.</div>
             <br>
             <div>[EVAL] Workspace 9B activity dropped 40%.</div>
             <div>[CALC] Churn risk elevated to High.</div>
             <div>[DECISION] Generating custom retention email.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindRecommendationEvents() {
  const recommendations = window.LiveMongoRecommendations || [];
  let totalAccepted = 0;
  
  recommendations.forEach(r => {
      if (r.status === 'Accepted') totalAccepted++;
  });
  
  const count = recommendations.length || 1;
  const acceptanceRate = (totalAccepted / count) * 100;

  setTimeout(() => {
    // Acceptance Trend
    const trendData = window.AdminUI.generateTrendData(acceptanceRate || 40, 10, 0.1, 'up');
    window.AdminUI.renderLineChart('recConfChart', Array(10).fill(''), trendData, '#10b981');
    
    // Engagement Trend
    const engData = window.AdminUI.generateTrendData(65, 10, 0.2, 'up');
    window.AdminUI.renderLineChart('recEngagementChart', Array(10).fill(''), engData, '#3b82f6');
    
    // Trigger Heatmap (using line chart simulation)
    const heatData = Array.from({length: 12}, () => Math.floor(Math.random() * 50) + 10);
    window.AdminUI.renderLineChart('recTriggerHeatmap', Array(12).fill(''), heatData, '#f59e0b');
  }, 100);
}

// --- Health ---
function getHealthHTML() {
  const h = window.LivePlatformHealth || {
    system_status: "Offline",
    mongodb_status: "Disconnected",
    api_latency: "0ms",
    active_sessions: 0,
    total_users: 0,
    ai_engine_status: "Offline",
    requests_per_minute: 0,
    cpu_usage: 0,
    memory_usage: 0,
    error_rate: 0,
    uptime: "0.00%",
    logs: []
  };
  
  const getStatusColor = (status) => {
    if (status === 'Operational' || status === 'Connected' || status === 'Normal') return '#10b981';
    if (status === 'Degraded' || status === 'Warning') return '#f59e0b';
    return '#ef4444';
  };

  const sysColor = getStatusColor(h.system_status);
  const dbColor = getStatusColor(h.mongodb_status);
  const aiColor = getStatusColor(h.ai_engine_status);

  return `
    <div class="admin-section-header">
      <h2>Platform Operational Health</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom:0;">
          <div class="admin-card admin-card-interactive" onclick="window.AdminUI.openOverlay('drawer', 'API Services Log', '<pre style=\\'color:#10b981; font-family:monospace; background:#000; padding:16px; border-radius:8px;\\'>[SYS] Gateway Active\\n[SYS] Authentication Pool 100%\\n[SYS] Latency optimal</pre>')">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live" style="background:${sysColor}"></span>
              <h3 style="margin:0; font-size:16px;">API Services</h3>
            </div>
            <div style="color:${sysColor}; font-size:24px; font-weight:600; margin-bottom:8px;">${h.system_status}</div>
            <div style="font-size:13px; color:#94a3b8;">Latency: ${h.api_latency} | Uptime: ${h.uptime}</div>
          </div>
          <div class="admin-card admin-card-interactive" onclick="window.AdminUI.openOverlay('drawer', 'Database Telemetry', '<div class=\\'admin-chart-wrapper\\'><canvas id=\\'dbLoadChart\\'></canvas></div>')">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live" style="background:${dbColor}"></span>
              <h3 style="margin:0; font-size:16px;">Database Cluster</h3>
            </div>
            <div style="color:${dbColor}; font-size:24px; font-weight:600; margin-bottom:8px;">${h.mongodb_status}</div>
            <div style="font-size:13px; color:#94a3b8;">Sessions: ${h.active_sessions.toLocaleString()} | Users: ${h.total_users.toLocaleString()}</div>
          </div>
          <div class="admin-card admin-card-interactive">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live" style="background:${aiColor}"></span>
              <h3 style="margin:0; font-size:16px;">AI Compute Cluster</h3>
            </div>
            <div style="color:${aiColor}; font-size:24px; font-weight:600; margin-bottom:8px;">${h.ai_engine_status}</div>
            <div style="font-size:13px; color:#94a3b8;">Error Rate: ${(h.error_rate * 100).toFixed(1)}% | Req/min: ${h.requests_per_minute.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="admin-grid" style="grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:0;">
          <div class="admin-card">
             <h3 style="margin: 0 0 16px 0; font-size: 16px;">Memory Consumption</h3>
             <div class="admin-chart-wrapper" style="height:150px; padding:0; border:none; background:transparent;">
               <canvas id="healthMemoryChart"></canvas>
             </div>
          </div>
          <div class="admin-card">
             <h3 style="margin: 0 0 16px 0; font-size: 16px;">API Latency & Throughput</h3>
             <div class="admin-chart-wrapper" style="height:150px; padding:0; border:none; background:transparent;">
               <canvas id="healthLatencyChart"></canvas>
             </div>
          </div>
        </div>
        
        <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom:0;">
          <div class="admin-card" style="padding:16px; background: rgba(0,0,0,0.2);">
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">Active Sessions</div>
            <div style="color:#3b82f6; font-size:20px; font-weight:700;">${h.active_sessions.toLocaleString()}</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:${Math.min(100, (h.active_sessions / 20000) * 100)}%; background:#3b82f6"></div></div>
          </div>
          <div class="admin-card" style="padding:16px; background: rgba(0,0,0,0.2);">
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">CPU Allocation</div>
            <div style="color:#f43f5e; font-size:20px; font-weight:700;">${h.cpu_usage}%</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:${h.cpu_usage}%; background:${h.cpu_usage > 85 ? '#ef4444' : '#f43f5e'}"></div></div>
          </div>
          <div class="admin-card" style="padding:16px; background: rgba(0,0,0,0.2);">
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">Memory Usage</div>
            <div style="color:#10b981; font-size:20px; font-weight:700;">${h.memory_usage}%</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:${h.memory_usage}%; background:${h.memory_usage > 85 ? '#ef4444' : '#10b981'}"></div></div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card" style="padding:0; overflow:hidden;">
          <div style="padding:16px; background:rgba(0,0,0,0.5); border-bottom:1px solid #334155;">
            <h3 style="margin:0; font-size:14px; font-family:monospace; color:#94a3b8; display:flex; align-items:center;"><i data-lucide="terminal" style="width:14px; margin-right:8px;"></i>System Terminal (Live) <span class="admin-pulse-indicator live" style="margin-left:auto; background:${sysColor}"></span></h3>
          </div>
          <div class="admin-terminal-window" style="height:350px;">
            <div class="admin-terminal-content" style="font-size:11px;">
              ${h.logs && h.logs.length > 0 ? h.logs.map(log => {
                let color = '#fff';
                if (log.type === 'WARN') color = '#f59e0b';
                if (log.type === 'ERR') color = '#ef4444';
                if (log.type === 'SYS') color = '#94a3b8';
                if (log.type === 'SEC') color = '#10b981';
                return `<div class="admin-anim-slide-down"><span style="color:${color}">[${log.type}] ${log.message}</span></div>`;
              }).join('') : '<div>[SYS] Waiting for log stream...</div>'}
            </div>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Event Bus Activity</h3>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="color:#94a3b8; font-size:13px;">Platform Sync Events</div>
            <div style="color:#fff; font-weight:600; font-size:14px;">${h.requests_per_minute}/min</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; padding-top:8px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="color:#94a3b8; font-size:13px;">Error Rate</div>
            <div style="color:${h.error_rate > 0.05 ? '#ef4444' : '#10b981'}; font-weight:600; font-size:14px;">${(h.error_rate * 100).toFixed(1)}%</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px;">
            <div style="color:#94a3b8; font-size:13px;">Uptime SLA</div>
            <div style="color:#10b981; font-weight:600; font-size:14px;">${h.uptime}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindHealthEvents() {
  const h = window.LivePlatformHealth || { memory_usage: 50, api_latency: "12ms" };
  const baseMem = h.memory_usage;
  const baseLat = parseInt(h.api_latency.replace(/[^0-9]/g, '')) || 12;

  setTimeout(() => {
    const memData = window.AdminUI.generateTrendData(baseMem, 20, 0.05, 'up');
    window.AdminUI.renderLineChart('healthMemoryChart', Array(20).fill(''), memData, '#3b82f6');
    const latData = window.AdminUI.generateTrendData(baseLat, 20, 0.2, 'up');
    window.AdminUI.renderLineChart('healthLatencyChart', Array(20).fill(''), latData, '#10b981');
  }, 100);
}

// --- Reports ---

window.generateReport = async function() {
    const payloads = [
        { title: "Weekly Sync", category: "Audit", format: "PDF", insights: "No critical issues." },
        { title: "AI Health Check", category: "System Diagnostics", format: "JSON", insights: "AI Engine is stable." },
        { title: "Revenue Cohort", category: "Platform Revenue", format: "CSV", insights: "Strong retention." }
    ];
    const payload = payloads[Math.floor(Math.random() * payloads.length)];
    
    try {
        const response = await fetch("http://127.0.0.1:5000/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            console.log("Report Generated");
            loadReports();
        }
    } catch (e) {
        console.error("Failed to generate report", e);
    }
}

window.deleteReport = async function(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
        const response = await fetch("http://127.0.0.1:5000/api/reports/" + id, { method: "DELETE" });
        if (response.ok) {
            console.log("Report Deleted:", id);
            loadReports();
        }
    } catch (e) {
        console.error("Failed to delete report", e);
    }
}

window.downloadReport = function(id, title, format) {
    console.log("Report Downloaded:", id);
    const content = `Simulated Export for ${title}\nFormat: ${format}\nID: ${id}\nGenerated on VenturX Admin.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_export.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
}

function getReportsHTML() {
  const reports = window.LiveMongoReports || [];
  
  let pdfCount = 0;
  let csvCount = 0;
  let jsonCount = 0;
  let processingReports = [];
  
  let totalRevenue = 0;
  let totalAiScore = 0;
  let completedCount = 0;
  let totalDownloads = 0;
  
  reports.forEach(r => {
     if (r.format === 'PDF') pdfCount++;
     if (r.format === 'CSV') csvCount++;
     if (r.format === 'JSON') jsonCount++;
     if (r.status === 'Processing' || r.status === 'Queued') processingReports.push(r);
     if (r.status === 'Completed') completedCount++;
     
     totalRevenue += (r.revenue || 0);
     totalAiScore += (r.ai_score || 0);
     totalDownloads += (r.download_count || 0);
  });
  
  const avgAiScore = reports.length > 0 ? Math.round(totalAiScore / reports.length) : 0;
  const completionRate = reports.length > 0 ? Math.round((completedCount / reports.length) * 100) : 0;

  return `
    <div class="admin-section-header" style="display:flex; justify-content:space-between; align-items:center;">
      <h2>Data Reports Export</h2>
      <button class="admin-btn admin-btn-primary" onclick="window.generateReport()"><i data-lucide="plus" style="width:16px; margin-right:6px;"></i> Generate Report</button>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Total Reports</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${reports.length}</div>
        <div style="font-size:12px; color:#10b981; margin-top:8px;">${totalDownloads} total downloads</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Average AI Score</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${avgAiScore}</div>
        <div style="font-size:12px; color:#3b82f6; margin-top:8px;">Platform intelligence index</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Revenue Analyzed</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">₹${Number(totalRevenue || 0).toLocaleString('en-IN')}</div>
        <div style="font-size:12px; color:#f59e0b; margin-top:8px;">Cumulative MRR tracked</div>
      </div>
      <div class="admin-card">
        <div style="font-size:13px; color:#94a3b8;">Completion Rate</div>
        <div style="font-size:24px; font-weight:600; color:#f8fafc; margin-top:4px;">${completionRate}%</div>
        <div style="font-size:12px; color:#10b981; margin-top:8px;">${processingReports.length} in queue</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Export Generation Queue</h3>
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Report Source</th>
                <th>Generation Date</th>
                <th>Format</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reports.length > 0 ? reports.map(r => {
                let badgeClass = 'admin-badge-info';
                if (r.format === 'PDF') badgeClass = 'admin-badge-success';
                if (r.format === 'JSON') badgeClass = 'admin-badge-warning';
                
                return `
                  <tr class="admin-table-row-interactive">
                    <td onclick="window.AdminUI.openOverlay('modal', '${r.title} Preview', '<div class=\\'admin-empty-state\\'><i data-lucide=\\'file-text\\' class=\\'admin-empty-icon\\'></i><div class=\\'admin-empty-title\\'>Dynamic ${r.format} Preview...</div><p>${r.insights || 'Loading insights...'}</p></div>')">
                        <div style="font-weight:500;">${r.title}</div>
                        <div style="font-size:12px; color:#94a3b8; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.category || 'Custom'} - ${r.generated_by || 'Admin'}</div>
                    </td>
                    <td>
                        <div>${new Date(r.generated_at).toLocaleDateString()}</div>
                        <div style="font-size:11px; color:#64748b;">${new Date(r.generated_at).toLocaleTimeString()}</div>
                    </td>
                    <td><span class="admin-badge ${badgeClass}">${r.format}</span></td>
                    <td>
                       ${r.status === 'Completed' ? 
                         `<span class="admin-badge admin-badge-success">Completed</span>` : 
                         `<span style="color:#f59e0b; font-size:12px;"><i data-lucide="loader" style="width:12px; animation: spin 1s linear infinite;"></i> ${r.status}</span>`
                       }
                    </td>
                    <td>
                        <div style="display:flex; gap:8px;">
                            ${r.status === 'Completed' ? `<button class="admin-btn admin-btn-primary" style="padding:4px 8px; font-size:12px;" onclick="window.downloadReport('${r._id}', '${r.title}', '${r.format}')"><i data-lucide="download" style="width:12px;"></i></button>` : ''}
                            <button class="admin-btn admin-btn-danger" style="padding:4px 8px; font-size:12px; background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.2);" onclick="window.deleteReport('${r._id}')"><i data-lucide="trash-2" style="width:12px;"></i></button>
                        </div>
                    </td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="5" style="text-align:center;">No reports available</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Format Distribution</h3>
          <div class="admin-chart-wrapper" style="height:150px;">
            <canvas id="reportsVolumeChart"></canvas>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Queue Status</h3>
          <ul style="padding-left: 20px; font-size:13px;">
            ${processingReports.length > 0 ? processingReports.map(pr => `
              <li style="color:#94a3b8; margin-bottom:12px;">${pr.title} <span class="admin-badge admin-badge-${pr.status === 'Processing' ? 'info' : 'warning'}" style="float:right;">${pr.status}</span></li>
            `).join('') : '<li style="color:#10b981;">All queues empty. Cluster idle.</li>'}
            <li style="color:#94a3b8; margin-top:12px; border-top:1px solid rgba(255,255,255,0.05); padding-top:12px;">Weekly Sync <span class="admin-badge admin-badge-success" style="float:right;">Complete</span></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function bindReportsEvents() {
  const reports = window.LiveMongoReports || [];
  let pdfCount = 0; let csvCount = 0; let jsonCount = 0;
  
  reports.forEach(r => {
     if (r.format === 'PDF') pdfCount++;
     if (r.format === 'CSV') csvCount++;
     if (r.format === 'JSON') jsonCount++;
  });

  setTimeout(() => {
    const volData = window.AdminUI.generateTrendData(reports.length || 10, 14, 0.3, 'up');
    window.AdminUI.renderLineChart('reportsVolumeChart', Array(14).fill(''), volData, '#3b82f6');
    window.lucide.createIcons();
  }, 100);
}

function getSettingsHTML() {
  const s = window.LiveMongoSettings || {};
  
  const getToggleHTML = (id, label, desc, checked) => `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:500; color:#f8fafc;">${label}</div>
        <div style="font-size:13px; color:#94a3b8;">${desc}</div>
      </div>
      <button class="admin-btn" id="${id}" style="border: 1px solid ${checked ? '#10b981' : '#475569'}; color: ${checked ? '#10b981' : '#f8fafc'};">${checked ? 'Enabled' : 'Disabled'}</button>
    </div>
  `;

  const getInputHTML = (id, label, desc, val, type="text") => `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:500; color:#f8fafc;">${label}</div>
        <div style="font-size:13px; color:#94a3b8;">${desc}</div>
      </div>
      <input type="${type}" id="${id}" value="${val}" style="background:rgba(0,0,0,0.2); border:1px solid #334155; color:#fff; padding:6px 12px; border-radius:4px; width:120px; text-align:right;" />
    </div>
  `;

  return `
    <div class="admin-section-header">
      <h2>Platform Control Panel</h2>
      ${s.updated_at ? `<div style="font-size:12px; color:#94a3b8;">Last synced: ${new Date(s.updated_at).toLocaleString()}</div>` : ''}
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Global Configuration</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${getInputHTML('inp_platform_name', 'Platform Name', 'Display name for the SaaS application.', s.platform_name || '')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_maintenance_mode', 'Maintenance Mode', 'Restrict access to admin panel only.', s.maintenance_mode)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_ai_engine_enabled', 'AI Engine Global', 'Enable or disable all AI prediction models.', s.ai_engine_enabled)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_dark_mode', 'Forced Dark Mode', 'Enforce absolute contrast theme.', s.dark_mode)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Flush AI Engine Cache</div>
              <div style="font-size:13px; color:#94a3b8;">Forces all models to recompute next request.</div>
            </div>
            <button class="admin-btn admin-btn-primary" id="btnFlushCache">Flush Cache</button>
          </div>
        </div>
      </div>
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Security & Operations</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${getInputHTML('inp_session_timeout', 'Session Timeout (min)', 'Idle time before automatic logout.', s.session_timeout || 30, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_api_rate_limit', 'API Rate Limit', 'Requests allowed per hour per user.', s.api_rate_limit || 1000, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_ai_confidence_threshold', 'AI Confidence Threshold', 'Minimum score required to trigger autonomous actions.', s.ai_confidence_threshold || 85, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_backup_frequency', 'Backup Frequency', 'Cron schedule for database snapshots.', s.backup_frequency || 'Daily')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_email_alerts', 'System Email Alerts', 'Send critical alerts to admin emails.', s.email_alerts)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_audit_logging', 'Verbose Audit Logging', 'Record all user actions to activity logs.', s.audit_logging)}
        </div>
      </div>
    </div>
  `;
}

function bindSettingsEvents() {
  const s = window.LiveMongoSettings || {};

  // Toggles
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = () => {
        el.innerText = 'Saving...';
        saveSettings({ [key]: !s[key] });
      };
    }
  };

  bindToggle('btn_maintenance_mode', 'maintenance_mode');
  bindToggle('btn_ai_engine_enabled', 'ai_engine_enabled');
  bindToggle('btn_dark_mode', 'dark_mode');
  bindToggle('btn_email_alerts', 'email_alerts');
  bindToggle('btn_audit_logging', 'audit_logging');

  // Inputs
  const bindInput = (id, key, isNumber) => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = (e) => {
        let val = e.target.value;
        if (isNumber) val = parseInt(val) || 0;
        e.target.style.borderColor = '#10b981';
        saveSettings({ [key]: val });
      };
    }
  };

  bindInput('inp_platform_name', 'platform_name', false);
  bindInput('inp_session_timeout', 'session_timeout', true);
  bindInput('inp_api_rate_limit', 'api_rate_limit', true);
  bindInput('inp_ai_confidence_threshold', 'ai_confidence_threshold', true);
  bindInput('inp_backup_frequency', 'backup_frequency', false);

  const flushBtn = document.getElementById('btnFlushCache');
  if (flushBtn) {
    flushBtn.onclick = () => {
      window.dispatchEvent(new CustomEvent("platform:data-updated", { detail: { module: "admin-settings" } }));
      window.AdminUI.openOverlay('modal', 'Cache Flushed', '<div class="admin-empty-state"><i data-lucide="check-circle" style="color:#10b981; width:48px; height:48px; margin-bottom:16px;"></i><h3 style="color:#fff; margin:0;">AI and Analytics Caches Flushed Globally.</h3></div>');
    };
  }
}

window.closeAdminOverlay = function () { window.AdminUI.closeOverlay(); };

console.log("Admin JS Loaded Successfully");
// Ensure global availability if not already explicitly attached
if (typeof initAdminDashboard !== 'undefined') {
    window.initAdminDashboard = initAdminDashboard;
}
