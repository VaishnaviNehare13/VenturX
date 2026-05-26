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
        activeView.classList.add('active');
        document.getElementById('adminTopTitle').textContent = item.textContent.trim();
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
      if (document.getElementById('adminPanel').classList.contains('active')) {
        window.dispatchEvent(new CustomEvent('admin:live-tick'));
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
      const msgs = [
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
};

const renderedTabs = new Set();

function renderAdminTab(tab, container, force = false) {
  if (renderedTabs.has(tab) && !force && tab !== 'recommendations' && tab !== 'users') return;
  renderedTabs.add(tab);
  
  if (!window.AdminEngine) {
    container.innerHTML = `<div class="admin-empty-state"><div class="admin-empty-title">Loading Admin Engine...</div></div>`;
    return;
  }
  
  // Safely destroy charts before replacing innerHTML
  window.AdminUI.destroyAllCharts();
  
  try {
    switch(tab) {
      case 'overview': container.innerHTML = getOverviewHTML(); bindOverviewEvents(); break;
      case 'users': container.innerHTML = getUsersHTML(); bindUserEvents(); break;
      case 'subscriptions': container.innerHTML = getSubscriptionsHTML(); bindSubscriptionEvents(); break;
      case 'ai-analytics': container.innerHTML = getAiAnalyticsHTML(); bindAiAnalyticsEvents(); break;
      case 'recommendations': container.innerHTML = getRecommendationsHTML(); bindRecommendationEvents(); break;
      case 'health': container.innerHTML = getHealthHTML(); bindHealthEvents(); break;
      case 'reports': container.innerHTML = getReportsHTML(); bindReportsEvents(); break;
      case 'settings': container.innerHTML = getSettingsHTML(); bindSettingsEvents(); break;
    }
  } catch (err) {
    console.error("Admin Render Error:", err);
    container.innerHTML = `<div style="padding: 20px; color: #ef4444;">Failed to load view: ${err.message}</div>`;
  }
  
  if (window.lucide) window.lucide.createIcons();
}

function formatCurrency(num) {
  return '₹' + num.toLocaleString('en-IN');
}

// --- Overview ---
function getOverviewHTML() {
  const engine = window.AdminEngine;
  const feed = engine.getActivityFeed() || [];
  
  const feedHTML = feed.length === 0 
    ? `<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No recent activity</td></tr>`
    : feed.map(item => `
      <tr class="admin-table-row-interactive" onclick="window.AdminUI.openOverlay('drawer', 'Activity Log Details', '<pre style=\'color:#94a3b8; font-size:13px; white-space:pre-wrap;\'>${JSON.stringify(item, null, 2)}</pre>')">
        <td style="display:flex; align-items:center; gap:8px; padding:8px 12px;">
          <div style="width:6px; height:6px; border-radius:50%; background:${item.message.includes('Error') ? '#ef4444' : (item.message.includes('Warning') ? '#f59e0b' : '#10b981')};"></div>
          <i data-lucide="${item.workspace ? 'briefcase' : 'server'}" style="width:12px; color:#94a3b8;"></i>
          ${item.workspace || 'System'}
        </td>
        <td style="padding:8px 12px;"><span class="admin-badge admin-badge-${item.workspace ? 'info' : 'warning'}">[${item.workspace ? 'CRM' : 'SYS'}]</span> ${item.message}</td>
        <td style="color:#64748b; font-family:monospace; font-size:11px; padding:8px 12px;">${new Date(item.timestamp).toLocaleTimeString()}</td>
      </tr>
    `).join('');

  return `
    <div class="admin-section-header">
      <h2>Platform Overview</h2>
    </div>
    
    <div class="admin-executive-strip" style="padding: 12px 20px;">
      <div class="admin-executive-text" style="font-size:14px;">
        <i data-lucide="zap" class="text-amber-500"></i>
        ${engine.getExecutiveSummary()}
      </div>
      <div class="admin-executive-metrics">
        <div class="admin-executive-metric">
          <span style="font-size:11px; color:#94a3b8;">Global Platform Health</span>
          <span style="font-size:18px; font-weight:600; color:#10b981;">${engine.getHealthScore()}/100</span>
        </div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-users">
        <div class="admin-kpi-title" style="font-size:12px;">Total Users</div>
        <div class="admin-kpi-value" style="font-size:24px;">${engine.getTotalUsers().toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="users" style="width:12px;"></i> Active Accounts</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-workspaces">
        <div class="admin-kpi-title" style="font-size:12px;">Active Workspaces</div>
        <div class="admin-kpi-value" style="font-size:24px;">${engine.getActiveWorkspaces().toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="briefcase" style="width:12px;"></i> View Directory</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-revenue">
        <div class="admin-kpi-title" style="font-size:12px;">Monthly Revenue (MRR)</div>
        <div class="admin-kpi-value" style="font-size:24px;">${formatCurrency(engine.getMonthlyRevenue())}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="dollar-sign" style="width:12px;"></i> Click for trends</div>
      </div>
      <div class="admin-card admin-card-interactive admin-card-compact" id="card-ai">
        <div class="admin-kpi-title" style="font-size:12px;">AI Requests Processed</div>
        <div class="admin-kpi-value" style="font-size:24px;">${engine.getAiUsageStats().totalRequests.toLocaleString()}</div>
        <div class="admin-kpi-trend positive" style="font-size:11px;"><i data-lucide="cpu" style="width:12px;"></i> View Compute Analytics</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Live Revenue & Workspace Growth</h3>
          <div class="admin-grid" style="grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom:0;">
            <div>
              <div class="admin-chart-wrapper" style="height: 220px; position:relative;">
                <div class="admin-chart-overlay">
                  <div class="overlay-title">Projected MRR</div>
                  <div class="overlay-value" style="color:#10b981;">+14.2% Trend</div>
                </div>
                <canvas id="overviewChartMain"></canvas>
              </div>
              <div style="margin-top:8px;">
                 <span class="admin-micro-pill"><i data-lucide="trending-up" style="width:12px;"></i> Peak: ₹2.8M</span>
                 <span class="admin-micro-pill"><i data-lucide="target" style="width:12px;"></i> 94% Confidence</span>
              </div>
            </div>
            <div>
              <div class="admin-chart-wrapper" style="height: 220px; position:relative;">
                <div class="admin-chart-overlay">
                  <div class="overlay-title">Workspaces</div>
                  <div class="overlay-value" style="color:#8b5cf6;">High Velocity</div>
                </div>
                <canvas id="overviewChartMini"></canvas>
              </div>
              <div style="margin-top:8px;">
                 <span class="admin-micro-pill"><i data-lucide="zap" style="width:12px;"></i> Velocity +12/wk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px; display:flex; justify-content:space-between;">AI Compute Load <span class="admin-pulse-indicator live"></span></h3>
          <div class="admin-chart-wrapper" style="height: 120px; padding:0; background:transparent; position:relative;">
            <div class="admin-chart-overlay left" style="background:transparent; border:none; backdrop-filter:none;">
              <div class="overlay-title">Live API Throughput</div>
            </div>
            <canvas id="overviewComputeChart"></canvas>
          </div>
          <div style="margin-top:8px;">
            <span class="admin-micro-pill"><i data-lucide="activity" style="width:12px;"></i> 4.2k req/s</span>
            <span class="admin-micro-pill"><i data-lucide="server" style="width:12px;"></i> Core 2 Active</span>
          </div>
          <div style="margin-top:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span style="color:#94a3b8; font-size:12px;">Churn Prediction Risk</span>
              <span style="color:#f43f5e; font-size:12px; font-weight:600;">14%</span>
            </div>
            <div class="admin-progress-bar"><div class="admin-progress-fill" style="width:14%; background:#f43f5e;"></div></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="admin-card admin-card-compact" style="margin-top: 16px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 8px;"><span class="admin-pulse-indicator live"></span> Real-Time Enterprise Activity Feed</h3>
      <div class="admin-table-container" style="max-height: 200px; overflow-y: auto; scroll-behavior: smooth;">
        <table class="admin-table" style="font-size:12px;">
          <tbody>${feedHTML}</tbody>
        </table>
      </div>
    </div>
  `;
}

function bindOverviewEvents() {
  document.getElementById('card-revenue').onclick = () => {
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
      const current = window.AdminEngine.getMonthlyRevenue();
      const ds1 = window.AdminUI.generateTrendData(current, 12, 0.1, 'up');
      const ds2 = window.AdminUI.generateTrendData(current * 1.2, 12, 0.05, 'up'); // Projection
      
      window.AdminUI.renderMultiLineChart('drawerRevChart', Array(12).fill(''), [
        { data: ds1, color: '#3b82f6', label: 'Current MRR', fill: true },
        { data: ds2, color: '#10b981', label: 'Projected', fill: false }
      ]);
    }, 50);
  };
  
  document.getElementById('card-users').onclick = () => {
      document.querySelector('.admin-nav-item[data-admin-tab="users"]').click();
  };
  document.getElementById('card-workspaces').onclick = () => {
      document.querySelector('.admin-nav-item[data-admin-tab="users"]').click();
  };
  document.getElementById('card-ai').onclick = () => {
      document.querySelector('.admin-nav-item[data-admin-tab="ai-analytics"]').click();
  };
  
  setTimeout(() => {
    const currentRev = window.AdminEngine.getMonthlyRevenue();
    const revData = window.AdminUI.generateTrendData(currentRev, 12, 0.15, 'up');
    const projectedRevData = window.AdminUI.generateTrendData(currentRev * 1.3, 12, 0.05, 'up');
    
    window.AdminUI.renderMultiLineChart('overviewChartMain', ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], [
      { data: revData, color: '#3b82f6', label: 'Actual MRR' },
      { data: projectedRevData, color: '#10b981', label: 'Projected MRR', fill: false }
    ]);
    
    const wsData = window.AdminUI.generateTrendData(window.AdminEngine.getActiveWorkspaces(), 12, 0.1, 'up');
    window.AdminUI.renderLineChart('overviewChartMini', ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], wsData, '#8b5cf6');
    
    const computeData = window.AdminUI.generateTrendData(window.AdminEngine.getAiUsageStats().totalRequests, 20, 0.3, 'up');
    window.AdminUI.renderLineChart('overviewComputeChart', Array(20).fill(''), computeData, '#f59e0b');
  }, 100);
}

// --- Users ---
function getUsersHTML() {
  const accounts = window.AdminEngine.getAccountsData() || [];
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
        <div style="font-size:18px; font-weight:600; color:#fff;">${window.AdminEngine.getActiveWorkspaces()}</div>
      </div>
      <div style="flex:1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px;">
        <div style="font-size:12px; color:#94a3b8;">Enterprise Users</div>
        <div style="font-size:18px; font-weight:600; color:#fff;">${window.AdminEngine.getSubscriptionBreakdown().Enterprise}</div>
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
      const accounts = window.AdminEngine.getAccountsData();
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
    const activeUsers = window.AdminEngine.getTotalUsers();
    const uGrowthData = window.AdminUI.generateTrendData(activeUsers, 12, 0.1, 'up');
    window.AdminUI.renderLineChart('usersGrowthChart', ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], uGrowthData, '#10b981');
  }, 100);
}

// --- Subscriptions ---
function getSubscriptionsHTML() {
  const subs = window.AdminEngine.getSubscriptionBreakdown();
  
  return `
    <div class="admin-section-header">
      <h2>Subscription Analytics</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #3b82f6;">
        <div class="admin-kpi-title" style="font-size:12px;">Monthly Recurring Revenue (MRR)</div>
        <div class="admin-kpi-value" style="font-size:24px;">${formatCurrency(subs.mrr)}</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">+4.2% from last month</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #f43f5e;">
        <div class="admin-kpi-title" style="font-size:12px;">Churn Rate</div>
        <div class="admin-kpi-value" style="font-size:24px;">${subs.churnRate}%</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">-0.8% decrease</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #10b981;">
        <div class="admin-kpi-title" style="font-size:12px;">Enterprise Accounts</div>
        <div class="admin-kpi-value" style="font-size:24px;">${subs.Enterprise}</div>
        <div style="color:#10b981; font-size:11px; margin-top:8px;">+2 net new</div>
      </div>
      <div class="admin-card admin-kpi-card admin-card-interactive admin-card-compact" style="border-bottom: 3px solid #8b5cf6;">
        <div class="admin-kpi-title" style="font-size:12px;">Subscription Velocity</div>
        <div class="admin-kpi-value" style="font-size:24px;">High</div>
        <div style="color:#94a3b8; font-size:11px; margin-top:8px;">Avg 14 days to upgrade</div>
      </div>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 2fr;">
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Plan Distribution</h3>
        <div class="admin-chart-wrapper" style="height:180px; position:relative;">
          <div class="admin-chart-overlay left" style="background:transparent; border:none; backdrop-filter:none;">
             <div class="overlay-value" style="color:#fff; font-size:24px;">${subs.Enterprise + subs.Growth + subs.Starter}</div>
             <div class="overlay-title">Total Active</div>
          </div>
          <canvas id="subDoughnutChart"></canvas>
        </div>
        <h3 style="margin: 24px 0 12px 0; font-size: 15px;">Revenue Contribution</h3>
        <div class="admin-chart-wrapper" style="height:140px; position:relative;">
          <canvas id="subRevenueDistChart"></canvas>
        </div>
        <div style="margin-top:8px;">
          <span class="admin-micro-pill"><i data-lucide="award" style="width:12px;"></i> Enterprise 60%</span>
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
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Recent Renewals & Upgrades</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <tbody>
              <tr><td>Acme Corp</td><td><span class="admin-badge admin-badge-success">Upgraded to Enterprise</span></td><td>$4,200</td><td>Just now</td></tr>
              <tr><td>Globex</td><td><span class="admin-badge admin-badge-info">Auto-renewed (Growth)</span></td><td>$850</td><td>2h ago</td></tr>
              <tr><td>Soylent</td><td><span class="admin-badge admin-badge-success">Upgraded to Growth</span></td><td>$850</td><td>5h ago</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="admin-card admin-card-compact">
        <h3 style="margin: 0 0 12px 0; font-size: 15px;">Expiring & Failed Payments</h3>
        <div class="admin-table-container">
          <table class="admin-table" style="font-size:12px;">
            <tbody>
              <tr><td>Hooli</td><td><span class="admin-badge admin-badge-danger">Failed Payment</span></td><td><button class="admin-btn" style="padding:4px 8px;">Email</button></td></tr>
              <tr><td>Stark Ind.</td><td><span class="admin-badge admin-badge-warning">Expires in 2 days</span></td><td><button class="admin-btn" style="padding:4px 8px;">Alert</button></td></tr>
              <tr><td>Wayne Ent.</td><td><span class="admin-badge admin-badge-warning">Expires in 4 days</span></td><td><button class="admin-btn" style="padding:4px 8px;">Alert</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
function bindSubscriptionEvents() {
  const subs = window.AdminEngine.getSubscriptionBreakdown();
  setTimeout(() => {
    window.AdminUI.renderDoughnut('subDoughnutChart', ['Starter', 'Growth', 'Enterprise'], [subs.Starter || 10, subs.Growth || 5, subs.Enterprise || 2], ['#3b82f6', '#8b5cf6', '#f43f5e']);
    
    // Multi-line Upgrade vs Downgrade vs Churn
    const upData = window.AdminUI.generateTrendData(120, 6, 0.2, 'up');
    const downData = window.AdminUI.generateTrendData(30, 6, 0.1, 'up');
    const churnData = window.AdminUI.generateTrendData(15, 6, 0.05, 'up');
    
    window.AdminUI.renderMultiLineChart('subGrowthChart', ['Jan','Feb','Mar','Apr','May','Jun'], [
      { data: upData, color: '#10b981', label: 'Upgrades', fill: true },
      { data: downData, color: '#f43f5e', label: 'Downgrades', fill: false },
      { data: churnData, color: '#f59e0b', label: 'Churn', fill: false }
    ]);
    
    window.AdminUI.renderDoughnut('subRevenueDistChart', ['Starter Rev', 'Growth Rev', 'Enterprise Rev'], [15, 25, 60], ['#60a5fa', '#a78bfa', '#fb7185']);
    
    const activityData = Array.from({length:12}, () => Math.floor(Math.random() * 40) + 10);
    window.AdminUI.renderLineChart('subMonthlyActivityChart', Array(12).fill(''), activityData, '#3b82f6');
  }, 100);
}

// --- AI Analytics ---
function getAiAnalyticsHTML() {
  return `
    <div class="admin-section-header">
      <h2>AI Engine & Telemetry</h2>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Token Usage & Forecast Accuracy</h3>
          <div class="admin-grid" style="grid-template-columns: 2fr 1fr; gap:16px; margin-bottom:0;">
            <div>
              <div class="admin-chart-wrapper" style="height:180px; position:relative;">
                <div class="admin-chart-overlay">
                  <div class="overlay-title">Current tokens/sec</div>
                  <div class="overlay-value" style="color:#8b5cf6;">12.4M Peak</div>
                </div>
                <canvas id="aiTokensChart"></canvas>
              </div>
              <div style="margin-top:8px;">
                <span class="admin-micro-pill"><i data-lucide="layers" style="width:12px;"></i> Tokens In</span>
                <span class="admin-micro-pill"><i data-lucide="cpu" style="width:12px;"></i> Tokens Out</span>
              </div>
            </div>
            <div>
              <div class="admin-chart-wrapper" style="height:180px; position:relative;">
                <canvas id="aiForecastAccuracyChart"></canvas>
              </div>
              <div style="margin-top:8px;">
                <span class="admin-micro-pill"><i data-lucide="target" style="width:12px;"></i> 94% Avg Acc</span>
              </div>
            </div>
          </div>
          <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-top:16px; margin-bottom:0;">
             <div style="background: rgba(16,185,129,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">Avg Execution Time</div>
               <div style="color: #10b981; font-weight: 600; font-size: 16px;">142ms</div>
             </div>
             <div style="background: rgba(59,130,246,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">Peak Concurrency</div>
               <div style="color: #3b82f6; font-weight: 600; font-size: 16px;">4,210 req/s</div>
             </div>
             <div style="background: rgba(245,158,11,0.05); padding: 12px; border-radius: 8px;">
               <div style="color: #94a3b8; font-size: 12px;">Context Window Cache</div>
               <div style="color: #f59e0b; font-weight: 600; font-size: 16px;">98.4% Hit</div>
             </div>
          </div>
        </div>
        
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Compute Allocation & Latency</h3>
          <div class="admin-grid" style="grid-template-columns: 1fr 2fr; gap:16px; margin-bottom:0;">
             <div class="admin-chart-wrapper" style="height:140px; position:relative;">
                <div class="admin-chart-overlay left" style="background:transparent; border:none; backdrop-filter:none;">
                   <div class="overlay-value" style="color:#fff; font-size:24px;">3 Node</div>
                   <div class="overlay-title">Cluster Active</div>
                </div>
                <canvas id="aiComputeAllocationChart"></canvas>
             </div>
             <div>
                 <div class="admin-chart-wrapper" style="height:140px; position:relative;">
                    <div class="admin-chart-overlay">
                      <div class="overlay-title">Avg Latency</div>
                      <div class="overlay-value" style="color:#f43f5e;">145ms</div>
                    </div>
                    <canvas id="aiLatencyHeatmap"></canvas>
                 </div>
             </div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="admin-card admin-card-compact">
          <h3 style="margin: 0 0 12px 0; font-size: 15px;">Model Distribution</h3>
          <div class="admin-chart-wrapper" style="height:180px; margin-bottom:12px; position:relative;">
            <div class="admin-chart-overlay left" style="background:transparent; border:none; backdrop-filter:none;">
               <div class="overlay-value" style="color:#fff; font-size:24px;">3</div>
               <div class="overlay-title">Active Models</div>
            </div>
            <canvas id="aiModelDistChart"></canvas>
          </div>
          <div style="margin-top:8px; margin-bottom:16px;">
            <span class="admin-micro-pill" style="color:#3b82f6;"><span style="width:8px; height:8px; background:#3b82f6; border-radius:50%; display:inline-block;"></span> Generative 65%</span>
            <span class="admin-micro-pill" style="color:#f59e0b;"><span style="width:8px; height:8px; background:#f59e0b; border-radius:50%; display:inline-block;"></span> Embedding 20%</span>
            <span class="admin-micro-pill" style="color:#10b981;"><span style="width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block;"></span> Predict 15%</span>
          </div>
          
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span style="color:#94a3b8; font-size:12px;">GPT-4 Usage Rate</span>
            <span style="color:#fff; font-weight:600; font-size:12px;">64%</span>
          </div>
          <div class="admin-progress-bar" style="height:4px;"><div class="admin-progress-fill" style="width:64%; background:#3b82f6"></div></div>
          
          <div style="display:flex; justify-content:space-between; margin-top:16px; margin-bottom:8px;">
            <span style="color:#94a3b8; font-size:12px;">Optimization Engine Health</span>
            <span style="color:#10b981; font-weight:600; font-size:12px;">Stable</span>
          </div>
          <div class="admin-progress-bar" style="height:4px;"><div class="admin-progress-fill" style="width:100%; background:#10b981"></div></div>
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
  `;
}

function bindAiAnalyticsEvents() {
  setTimeout(() => {
    const stats = window.AdminEngine.getAiUsageStats();
    
    // Tokens Trend (Multi)
    const tokIn = window.AdminUI.generateTrendData(stats.totalTokensProcessed, 14, 0.4, 'up');
    const tokOut = window.AdminUI.generateTrendData(stats.totalTokensProcessed * 0.4, 14, 0.3, 'up');
    
    window.AdminUI.renderMultiLineChart('aiTokensChart', Array(14).fill(''), [
      { data: tokIn, color: '#8b5cf6', label: 'Tokens In', fill: true },
      { data: tokOut, color: '#3b82f6', label: 'Tokens Out', fill: true }
    ]);
    
    const accData = window.AdminUI.generateTrendData(94.2, 14, 0.05, 'up');
    window.AdminUI.renderLineChart('aiForecastAccuracyChart', Array(14).fill(''), accData, '#10b981');
    
    window.AdminUI.renderDoughnut('aiModelDistChart', ['Generative', 'Embeddings', 'Predictive'], [65, 20, 15], ['#3b82f6', '#f59e0b', '#10b981']);
    
    window.AdminUI.renderDoughnut('aiComputeAllocationChart', ['CRM', 'Marketing', 'Forecast'], [40, 35, 25], ['#8b5cf6', '#ec4899', '#3b82f6']);
    
    // Multi Latency vs Request Volume
    const latencyData = Array.from({length: 20}, () => Math.floor(Math.random() * 150) + 50);
    const volumeData = Array.from({length: 20}, () => Math.floor(Math.random() * 300) + 100);
    
    window.AdminUI.renderMultiLineChart('aiLatencyHeatmap', Array(20).fill(''), [
      { data: latencyData, color: '#f43f5e', label: 'Latency (ms)', fill: false },
      { data: volumeData, color: '#64748b', label: 'Requests', fill: true }
    ]);
  }, 100);
}

// --- Recommendations ---
function getRecommendationsHTML() {
  const rm = window.AdminEngine.getRecommendationMetrics();
  const queue = rm.recentQueue || [
    { type: 'Engagement', user: 'Acme Corp', text: 'Suggested email campaign generated.', status: 'Accepted' },
    { type: 'Financial', user: 'Globex', text: 'Detected subscription anomaly.', status: 'Ignored' },
    { type: 'CRM', user: 'Soylent', text: 'Lead score threshold reached.', status: 'Accepted' },
    { type: 'Marketing', user: 'Initech', text: 'A/B Test optimization.', status: 'Pending' }
  ];

  return `
    <div class="admin-section-header">
      <h2>Global Recommendation Triggers</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr 1fr; margin-bottom:24px;">
      <div class="admin-card admin-kpi-card">
        <div class="admin-kpi-title">Total Active Triggers</div>
        <div class="admin-kpi-value">${rm.activeTriggers}</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #10b981;">
        <div class="admin-kpi-title">Acceptance Rate</div>
        <div class="admin-kpi-value">${rm.accepted || 40}%</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #f43f5e;">
        <div class="admin-kpi-title">Ignored Rate</div>
        <div class="admin-kpi-value">${100 - (rm.accepted || 40)}%</div>
      </div>
      <div class="admin-card admin-kpi-card" style="border-bottom: 2px solid #8b5cf6;">
        <div class="admin-kpi-title">Avg Confidence</div>
        <div class="admin-kpi-value">92.4%</div>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${queue.map(q => `
                  <tr>
                    <td><span class="admin-badge admin-badge-${q.type === 'CRM' ? 'info' : (q.type === 'Financial' ? 'warning' : 'success')}">${q.type}</span></td>
                    <td>${q.user}</td>
                    <td>${q.text}</td>
                    <td><span style="color:${q.status === 'Accepted' ? '#10b981' : (q.status === 'Ignored' ? '#ef4444' : '#f59e0b')}">${q.status}</span></td>
                  </tr>
                `).join('')}
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
  setTimeout(() => {
    const rm = window.AdminEngine.getRecommendationMetrics();
    
    // Acceptance Trend
    const trendData = window.AdminUI.generateTrendData(rm.accepted || 40, 10, 0.1, 'up');
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
  const h = window.AdminEngine.getSystemHealth();
  
  return `
    <div class="admin-section-header">
      <h2>Platform Operational Health</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 2fr 1fr;">
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr; margin-bottom:0;">
          <div class="admin-card admin-card-interactive" onclick="window.AdminUI.openOverlay('drawer', 'API Services Log', '<pre style=\'color:#10b981; font-family:monospace; background:#000; padding:16px; border-radius:8px;\'>[SYS] Gateway Active\n[SYS] Authentication Pool 100%\n[SYS] Latency optimal</pre>')">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live"></span>
              <h3 style="margin:0; font-size:16px;">API Services</h3>
            </div>
            <div style="color:#10b981; font-size:24px; font-weight:600; margin-bottom:8px;">${h.apiStatus}</div>
            <div style="font-size:13px; color:#94a3b8;">Latency: ${h.latency}</div>
          </div>
          <div class="admin-card admin-card-interactive" onclick="window.AdminUI.openOverlay('drawer', 'Database Telemetry', '<div class=\'admin-chart-wrapper\'><canvas id=\'dbLoadChart\'></canvas></div>')">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live"></span>
              <h3 style="margin:0; font-size:16px;">Database Cluster</h3>
            </div>
            <div style="color:#10b981; font-size:24px; font-weight:600; margin-bottom:8px;">Operational</div>
            <div style="font-size:13px; color:#94a3b8;">Load: ${h.dbLoad} | Sessions: ${h.activeSessions}</div>
          </div>
          <div class="admin-card admin-card-interactive">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
              <span class="admin-pulse-indicator live"></span>
              <h3 style="margin:0; font-size:16px;">AI Compute Cluster</h3>
            </div>
            <div style="color:#10b981; font-size:24px; font-weight:600; margin-bottom:8px;">Normal</div>
            <div style="font-size:13px; color:#94a3b8;">Memory: ${h.memoryUsage} | Uptime: ${h.aiUptime}</div>
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
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">Storage Consumption</div>
            <div style="color:#3b82f6; font-size:20px; font-weight:700;">4.2 TB</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:42%; background:#3b82f6"></div></div>
          </div>
          <div class="admin-card" style="padding:16px; background: rgba(0,0,0,0.2);">
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">CPU Allocation</div>
            <div style="color:#f43f5e; font-size:20px; font-weight:700;">68%</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:68%; background:#f43f5e"></div></div>
          </div>
          <div class="admin-card" style="padding:16px; background: rgba(0,0,0,0.2);">
            <div style="color:#94a3b8; font-size:12px; margin-bottom:4px;">WebSocket Active</div>
            <div style="color:#10b981; font-size:20px; font-weight:700;">12,042</div>
            <div class="admin-progress-bar" style="margin-top:8px;"><div class="admin-progress-fill" style="width:85%; background:#10b981"></div></div>
          </div>
        </div>
      </div>
      
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card" style="padding:0; overflow:hidden;">
          <div style="padding:16px; background:rgba(0,0,0,0.5); border-bottom:1px solid #334155;">
            <h3 style="margin:0; font-size:14px; font-family:monospace; color:#94a3b8; display:flex; align-items:center;"><i data-lucide="terminal" style="width:14px; margin-right:8px;"></i>System Terminal (Live) <span class="admin-pulse-indicator live" style="margin-left:auto;"></span></h3>
          </div>
          <div class="admin-terminal-window" style="height:350px;">
            <div class="admin-terminal-content" style="font-size:11px;">
              <div>[SYS] Checking container registry... OK</div>
              <div>[AI] Loaded generic embedding model... OK</div>
              <div>[DB] Executing vacuum on accounts table... OK</div>
              <div>[SEC] Token rotation successful.</div>
              <div>[ROUTE] /api/v1/workspaces - 200 OK (24ms)</div>
              <div>[AI] Queue flushed. 0 pending jobs.</div>
              <div>[SYS] Memory footprint stable at ${h.memoryUsage}.</div>
              <div style="color:#f59e0b;">[WARN] High load detected on redis cluster 2.</div>
              <div>[SYS] Autoscaling initiated...</div>
              <div>[SYS] Load balanced successfully.</div>
              <div>[ROUTE] /api/v1/auth - 200 OK (18ms)</div>
              <div>[AI] Received batch processing request...</div>
              <div>[CRON] Weekly backup initiated...</div>
              <div>[CRON] Compressing volumes...</div>
            </div>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Event Bus Activity</h3>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="color:#94a3b8; font-size:13px;">Platform Sync Events</div>
            <div style="color:#fff; font-weight:600; font-size:14px;">420/s</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:8px; padding-top:8px; border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="color:#94a3b8; font-size:13px;">AI Trigger Executions</div>
            <div style="color:#fff; font-weight:600; font-size:14px;">12/s</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px;">
            <div style="color:#94a3b8; font-size:13px;">Webhook Deliveries</div>
            <div style="color:#10b981; font-weight:600; font-size:14px;">100% Success</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindHealthEvents() {
  setTimeout(() => {
    const memData = window.AdminUI.generateTrendData(102, 20, 0.05, 'up');
    window.AdminUI.renderLineChart('healthMemoryChart', Array(20).fill(''), memData, '#3b82f6');
    const latData = window.AdminUI.generateTrendData(42, 20, 0.2, 'up');
    window.AdminUI.renderLineChart('healthLatencyChart', Array(20).fill(''), latData, '#10b981');
  }, 100);
}

// --- Reports ---
function getReportsHTML() {
  return `
    <div class="admin-section-header">
      <h2>Data Reports Export</h2>
    </div>
    
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr 1fr;">
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">PDF Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsPdfChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#10b981;">1,204</span></div>
       </div>
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">CSV Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsCsvChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#3b82f6;">8,432</span></div>
       </div>
       <div class="admin-card">
         <h3 style="margin: 0 0 8px 0; font-size: 14px;">JSON Exports</h3>
         <div class="admin-chart-wrapper" style="height:100px; margin-bottom:8px;">
           <canvas id="reportsJsonChart"></canvas>
         </div>
         <div style="display:flex; justify-content:space-between; font-size:12px; color:#94a3b8;"><span>Volume</span><span style="color:#f59e0b;">420</span></div>
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
                <th>Description</th>
                <th>Generation Date</th>
                <th>Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr class="admin-table-row-interactive" onclick="window.AdminUI.openOverlay('modal', 'Revenue Report Preview', '<div class=\'admin-empty-state\'><i data-lucide=\'file-text\' class=\'admin-empty-icon\'></i><div class=\'admin-empty-title\'>Generating Dynamic PDF Preview...</div><p>Querying active subscriptions.</p></div>')">
                <td>Platform Revenue</td>
                <td>Complete MRR and subscription breakdown.</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-success">CSV / PDF</span></td>
                <td><button class="admin-btn admin-btn-primary"><i data-lucide="download" style="width:14px; margin-right:4px;"></i> Export</button></td>
              </tr>
              <tr class="admin-table-row-interactive" onclick="window.AdminUI.openOverlay('modal', 'AI Telemetry Preview', '<div class=\'admin-empty-state\'><i data-lucide=\'cpu\' class=\'admin-empty-icon\'></i><div class=\'admin-empty-title\'>Compiling JSON Dump...</div></div>')">
                <td>AI Usage Telemetry</td>
                <td>Raw metrics of all AI prediction models.</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-warning">JSON</span></td>
                <td><button class="admin-btn admin-btn-primary"><i data-lucide="download" style="width:14px; margin-right:4px;"></i> Export</button></td>
              </tr>
              <tr class="admin-table-row-interactive">
                <td>Global User Audit</td>
                <td>Full activity log for all enterprise workspaces.</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td><span class="admin-badge admin-badge-info">CSV</span></td>
                <td><button class="admin-btn admin-btn-primary"><i data-lucide="download" style="width:14px; margin-right:4px;"></i> Export</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Export Frequency Trend</h3>
          <div class="admin-chart-wrapper" style="height:150px;">
            <canvas id="reportsVolumeChart"></canvas>
          </div>
        </div>
        <div class="admin-card">
          <h3 style="margin: 0 0 16px 0; font-size: 16px;">Queue Status</h3>
          <ul style="padding-left: 20px; font-size:13px;">
            <li style="color:#94a3b8; margin-bottom:12px;">Global User Audit <span class="admin-badge admin-badge-info" style="float:right;">Processing (42%)</span></li>
            <li style="color:#94a3b8; margin-bottom:12px;">Revenue Cohort Analysis <span class="admin-badge admin-badge-warning" style="float:right;">Queued</span></li>
            <li style="color:#94a3b8; margin-bottom:12px;">Backup Snapshot <span class="admin-badge admin-badge-success" style="float:right;">Complete</span></li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function bindReportsEvents() {
  setTimeout(() => {
    const volData = window.AdminUI.generateTrendData(420, 14, 0.3, 'up');
    window.AdminUI.renderLineChart('reportsVolumeChart', Array(14).fill(''), volData, '#3b82f6');
    
    const pdfData = window.AdminUI.generateTrendData(120, 10, 0.2, 'up');
    window.AdminUI.renderLineChart('reportsPdfChart', Array(10).fill(''), pdfData, '#10b981');
    
    const csvData = window.AdminUI.generateTrendData(840, 10, 0.4, 'up');
    window.AdminUI.renderLineChart('reportsCsvChart', Array(10).fill(''), csvData, '#3b82f6');
    
    const jsonData = window.AdminUI.generateTrendData(42, 10, 0.1, 'up');
    window.AdminUI.renderLineChart('reportsJsonChart', Array(10).fill(''), jsonData, '#f59e0b');
  }, 100);
}

function getSettingsHTML() {
  return `
    <div class="admin-section-header">
      <h2>Platform Control Panel</h2>
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Global Triggers</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Maintenance Mode</div>
              <div style="font-size:13px; color:#94a3b8;">Restrict access to admin panel only.</div>
            </div>
            <button class="admin-btn" id="btnToggleMaintenance" style="border: 1px solid #475569;">Enable</button>
          </div>
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Flush AI Engine Cache</div>
              <div style="font-size:13px; color:#94a3b8;">Forces all models to recompute next request.</div>
            </div>
            <button class="admin-btn admin-btn-primary" id="btnFlushCache">Flush Cache</button>
          </div>
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Dark Theme Overload</div>
              <div style="font-size:13px; color:#94a3b8;">Enforce absolute contrast for presentation mode.</div>
            </div>
            <button class="admin-btn" style="border: 1px solid #475569;">Toggle</button>
          </div>
        </div>
      </div>
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">System Diagnostics</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Local Storage Payload</div>
              <div style="font-size:13px; color:#94a3b8;" id="localStorageSizeText">Calculating...</div>
            </div>
            <button class="admin-btn admin-btn-danger" onclick="localStorage.clear(); location.reload();">Hard Reset</button>
          </div>
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Notification Bus</div>
              <div style="font-size:13px; color:#94a3b8;">Module syncing is currently active.</div>
            </div>
            <span class="admin-badge admin-badge-success">Operational</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindSettingsEvents() {
  const flushBtn = document.getElementById('btnFlushCache');
  if (flushBtn) {
    flushBtn.onclick = () => {
      window.dispatchEvent(new CustomEvent("platform:data-updated", { detail: { module: "admin-settings" } }));
      window.AdminUI.openOverlay('modal', 'Cache Flushed', '<div class="admin-empty-state"><i data-lucide="check-circle" style="color:#10b981; width:48px; height:48px; margin-bottom:16px;"></i><h3 style="color:#fff; margin:0;">AI and Analytics Caches Flushed Globally.</h3></div>');
    };
  }
  
  const lsText = document.getElementById('localStorageSizeText');
  if (lsText) {
    const size = Math.round(JSON.stringify(localStorage).length / 1024);
    lsText.innerText = `Currently using ${size} KB / 5000 KB`;
  }
}
window.closeAdminOverlay = function () { window.AdminUI.closeOverlay(); };

console.log("Admin JS Loaded Successfully");
// Ensure global availability if not already explicitly attached
if (typeof initAdminDashboard !== 'undefined') {
    window.initAdminDashboard = initAdminDashboard;
}
