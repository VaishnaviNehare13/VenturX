console.log("Segmentation JS Loaded");
let segmentsData = {};

async function initializeSegmentation() {
 console.log("Segmentation initialized");
 
 // HTML already has skeleton loaders, so we don't overwrite them with text
 
 try {
  console.log("Fetching segmentation API");
  const response = await fetch('/api/segmentation');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log("FULL API DATA:", data);
  segmentsData = data;
  
  window.PlatformData.segmentation.push(data);
  window.PlatformEngine.logActivity('segmentation', `Segmentation analysis completed for ${data.metrics?.total_customers || 0} customers`);
  window.PlatformEngine.savePlatformData("segmentation");
  
  updateUI(data);
 } catch (error) {
  console.error("Segmentation API Error:", error);
  handleErrorState(error.message);
 }

 // Bind close modal handler
 const closeBtn = document.getElementById('closeModal');
 const modal = document.getElementById('modal');
 
 const closeModal = () => modal?.classList.add('hidden');
 
 if (closeBtn) closeBtn.onclick = closeModal;
 if (modal) modal.onclick = (e) => { if(e.target === modal) closeModal(); };
 
 window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
   closeModal();
  }
 });
}

function handleErrorState(errMsg) {
 const errorHTML = `<div style="padding: 24px; text-align: center; color: var(--color-accent);">
  <div style="font-size: 32px; margin-bottom: 12px;"><i data-lucide="alert-triangle" class="icon-sm text-amber-500"></i></div>
  <p>Failed to load data: ${errMsg}</p>
  <button class="btn mt-16" onclick="window.initializeSegmentation()">Try Again</button>
 </div>`;
 
 const segmentListEl = document.getElementById('segmentList');
 if (segmentListEl) segmentListEl.innerHTML = errorHTML;
 
 const kpiElements = ['segTotalCustomers', 'segSilhouette', 'segCount'];
 kpiElements.forEach(id => {
  const el = document.getElementById(id);
  if(el) el.innerHTML = '<span style="color: var(--color-accent); font-size: 1rem;">Error</span>';
 });
 
 const tableBody = document.getElementById('segmentTableBody');
 if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" style="color: var(--color-accent); text-align: center;">Error loading data</td></tr>`;
 
 const umap = document.getElementById('umapContainer');
 if (umap) umap.innerHTML = errorHTML;
 
 const recs = document.getElementById('targetingSuggestions');
 if (recs) recs.innerHTML = `<p style="color: var(--color-accent);">Error loading recommendations</p>`;
}

function updateUI(data) {
 if (!data || (!data.metrics && !data.segment_distribution && !data.segments)) {
  handleErrorState("Invalid data format received from API");
  return;
 }
 
 const metrics = data.metrics || {};
 const segments = data.segments || data.cluster_centers || [];
 const recommendations = data.recommendations || [];
 const distribution = data.segment_distribution || [];
 const umap = data.umap_coordinates || [];
 
 // Update KPIs with animation
 const totalCust = document.getElementById('segTotalCustomers');
 if (totalCust) {
  totalCust.style.opacity = 0;
  totalCust.textContent = metrics.total_customers?.toLocaleString('en-IN') || "0";
  setTimeout(() => { totalCust.style.transition = 'opacity 0.5s'; totalCust.style.opacity = 1; }, 50);
 }
 
 const silhouetteEl = document.getElementById('segSilhouette');
 if (silhouetteEl) {
  silhouetteEl.style.opacity = 0;
  silhouetteEl.textContent = metrics.silhouette_score || "0";
  setTimeout(() => { silhouetteEl.style.transition = 'opacity 0.5s'; silhouetteEl.style.opacity = 1; }, 100);
 }
 
 const segCount = document.getElementById('segCount');
 if (segCount) {
  segCount.style.opacity = 0;
  segCount.textContent = metrics.number_of_segments || segments.length || "0";
  setTimeout(() => { segCount.style.transition = 'opacity 0.5s'; segCount.style.opacity = 1; }, 150);
 }
 
 renderSegmentList(distribution, segments);
 renderSegmentTable(segments, distribution, recommendations);
 renderSegmentChart(distribution);
 renderUmapChart(umap);
 renderTargetingSuggestions(recommendations);
}

function renderSegmentList(distribution, centers) {
 const list = document.getElementById('segmentList');
 if (!list) return;
 if (!distribution || distribution.length === 0) {
   list.innerHTML = '<p class="muted" style="padding: 16px;">No segments found.</p>';
   return;
 }
 
 const total = distribution.reduce((sum, d) => sum + (d.count || 0), 0);
 
 list.innerHTML = distribution.map((dist, i) => {
  // Find the center/features for this segment
  const seg = centers?.find(s => s.name === dist.name) || dist;
  const features = seg.features || seg;
  const count = dist.count || 0;
  const color = dist.color || seg.color || '#ccc';
  
  return `
  <div class='card neon-card interactive-card' style='margin:8px 0;padding:16px;border-left:4px solid ${color};' onclick='window.showSegmentDetails("${dist.name}")'>
   <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
    <div>
     <div style='font-weight:600;font-size:16px;color:${color}'>${dist.name}</div>
     <div class='muted' style='font-size:13px'>${count.toLocaleString('en-IN')} customers (${total > 0 ? Math.round((count/total)*100) : 0}%)</div>
    </div>
    <div style="text-align:right;">
     <div style="font-size:18px; font-weight:600; color:var(--color-secondary);">₹${features.avg_order_value?.toFixed(1) || features.avg_order?.toFixed(1) || 0}</div>
     <div class="muted" style="font-size:11px; text-transform:uppercase;">Avg Order</div>
    </div>
   </div>
   <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size:13px;">
    <div style="background:var(--color-bg); padding:8px; border-radius:6px; text-align:center;">
     <div class="muted" style="font-size:11px; text-transform:uppercase;">Freq</div>
     <div style="font-weight:500;">${features.frequency?.toFixed(1) || 0}</div>
    </div>
    <div style="background:var(--color-bg); padding:8px; border-radius:6px; text-align:center;">
     <div class="muted" style="font-size:11px; text-transform:uppercase;">Recency</div>
     <div style="font-weight:500;">${features.recency?.toFixed(1) || 0}d</div>
    </div>
    <div style="background:var(--color-bg); padding:8px; border-radius:6px; text-align:center;">
     <div class="muted" style="font-size:11px; text-transform:uppercase;">Monetary</div>
     <div style="font-weight:500;">₹${features.monetary?.toFixed(1) || 0}</div>
    </div>
   </div>
  </div>
 `}).join('');
}

function renderSegmentTable(centers, distribution, recs) {
 const tbody = document.getElementById('segmentTableBody');
 if (!tbody) return;
 if (!centers || centers.length === 0) {
   tbody.innerHTML = '<tr><td colspan="7" class="muted" style="text-align: center;">No segments available</td></tr>';
   return;
 }
 
 tbody.style.opacity = 0;
 
 tbody.innerHTML = centers.map(seg => {
  const dist = distribution?.find(d => d.name === seg.name) || seg;
  const rec = recs?.find(r => r.segment === seg.name) || {};
  const count = dist.count || 0;
  const color = dist.color || seg.color || '#ccc';
  const features = seg.features || seg;
  
  return `
  <tr style="transition: all 0.2s ease;">
   <td><span class="badge" style="background: ${color}20; border-color: ${color}40; color: ${color};">${seg.name}</span></td>
   <td style="font-weight: 500;">${count.toLocaleString('en-IN')}</td>
   <td>₹${features.avg_order_value?.toFixed(1) || features.avg_order?.toFixed(1) || 0}</td>
   <td>${features.frequency?.toFixed(1) || 0}</td>
   <td>${features.recency?.toFixed(1) || 0}</td>
   <td>₹${(features.income || 0).toLocaleString('en-IN')}</td>
   <td><span style="font-size: 13px; font-weight: 500;">${rec.strategy || 'Custom targeting'}</span></td>
  </tr>
 `}).join('');
 
 setTimeout(() => {
  tbody.style.transition = 'opacity 0.6s ease';
  tbody.style.opacity = 1;
 }, 100);
}

let chartInstance = null;
function renderSegmentChart(distribution) {
 const container = document.getElementById('segmentChartContainer');
 const ctx = document.getElementById('segmentChart');
 if (!ctx || !window.Chart) return;
 
 if (!distribution || distribution.length === 0) {
  if(chartInstance) chartInstance.destroy();
  return;
 }
 
 // Hide skeleton, show canvas
 if (container) {
  const skeleton = container.querySelector('.skeleton');
  if (skeleton) skeleton.style.display = 'none';
  ctx.style.display = 'block';
 }
 
 if(chartInstance) chartInstance.destroy();
 
 const total = distribution.reduce((sum, d) => sum + d.count, 0);
 
 chartInstance = new Chart(ctx, {
  type: 'doughnut',
  data: {
   labels: distribution.map(s => s.name),
   datasets: [{
    data: distribution.map(s => s.count),
    backgroundColor: distribution.map(s => s.color),
    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim() || '#fff',
    borderWidth: 2,
    hoverOffset: 12
   }]
  },
  options: {
   responsive: true,
   maintainAspectRatio: false,
   cutout: '65%',
   animation: { animateScale: true, animateRotate: true },
   plugins: {
    legend: {
     position: 'right',
     labels: { 
      color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#e5e7eb',
      font: { size: 12, family: 'Google Sans, sans-serif' },
      padding: 20,
      usePointStyle: true,
      pointStyle: 'circle'
     }
    },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)',
     titleColor: '#fff',
     bodyColor: '#cbd5e1',
     bodyFont: { size: 14 },
     borderColor: 'rgba(255,255,255,0.1)',
     borderWidth: 1,
     padding: 12,
     callbacks: {
      label: function(context) {
       const value = context.raw;
       const pct = total > 0 ? Math.round((value / total) * 100) : 0;
       return `${value.toLocaleString('en-IN')} customers (${pct}%)`;
      }
     }
    }
   }
  }
 });
}

let umapInstance = null;
function renderUmapChart(coordinates) {
 const container = document.getElementById('umapContainer');
 if (!container) return;
 
 if (!coordinates || coordinates.length === 0) {
  container.innerHTML = '<p class="muted">No coordinate data available for scatter plot.</p>';
  return;
 }

 container.innerHTML = '<canvas id="umapChartCanvas"></canvas>';
 const ctx = document.getElementById('umapChartCanvas');
 if (!ctx || !window.Chart) return;
 
 if(umapInstance) umapInstance.destroy();

 const segments = [...new Set(coordinates.map(c => c.segment))];
 const datasets = segments.map(segName => {
  const points = coordinates.filter(c => c.segment === segName);
  const color = points[0]?.color || '#8ab4f8';
  return {
   label: segName,
   data: points.map(p => ({ x: p.x, y: p.y, raw: p })),
   backgroundColor: color + '99', // 60% opacity
   borderColor: color,
   borderWidth: 1,
   pointRadius: 5,
   pointHoverRadius: 8,
   hoverBackgroundColor: color
  };
 });

 umapInstance = new Chart(ctx, {
  type: 'scatter',
  data: { datasets },
  options: {
   onClick: (e, elements) => {
    if (elements && elements.length > 0) {
     const el = elements[0];
     const point = umapInstance.data.datasets[el.datasetIndex].data[el.index];
     window.showSegmentDetails(point.raw.segment);
    }
   },
   onHover: (e, elements) => {
    e.native.target.style.cursor = elements && elements.length > 0 ? 'pointer' : 'default';
   },
   responsive: true,
   maintainAspectRatio: false,
   animation: {
    duration: 1000,
    easing: 'easeOutQuart'
   },
   plugins: {
    legend: {
     position: 'bottom',
     labels: { 
      color: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim() || '#e5e7eb', 
      font: { size: 12, family: 'Google Sans, sans-serif' },
      usePointStyle: true,
      padding: 20
     }
    },
    tooltip: {
     backgroundColor: 'rgba(15, 23, 42, 0.95)',
     titleColor: '#fff',
     bodyColor: '#e2e8f0',
     borderColor: 'rgba(99,102,241,0.3)',
     borderWidth: 1,
     padding: 12,
     cornerRadius: 8,
     displayColors: false,
     callbacks: {
      title: function(context) {
       return context[0].raw.raw.segment + ' Customer';
      },
      label: function(context) {
       const p = context.raw.raw;
       return [
        `Monetary: ₹${p.details?.monetary?.toFixed(1) || 0}`,
        `Frequency: ${p.details?.frequency?.toFixed(1) || 0} purchases`,
        `Recency: ${p.details?.recency?.toFixed(1) || 0} days`
       ];
      }
     }
    }
   },
   scales: {
    x: { 
     grid: { color: 'rgba(148,163,184,0.05)', drawBorder: false },
     ticks: { display: false }
    },
    y: { 
     grid: { color: 'rgba(148,163,184,0.05)', drawBorder: false },
     ticks: { display: false }
    }
   }
  }
 });
}

function renderTargetingSuggestions(recommendations) {
 const container = document.getElementById('targetingSuggestions');
 if (!container) return;
 
 if (!recommendations || recommendations.length === 0) {
   container.innerHTML = '<p class="muted">No targeting recommendations available.</p>';
   return;
 }
 
 const channelMap = {
  'High Value': 'SMS + Email',
  'Average': 'In-app + Email',
  'At Risk': 'Phone + Email',
  'Low Engagement': 'Email + Retargeting'
 };
 
 container.style.opacity = 0;
 
 container.innerHTML = `
  <div style="display: grid; gap: 16px;">
   ${recommendations.map((s, i) => `
    <div class="card neon-card" style="display: flex; align-items: center; gap: 16px; padding: 20px; background: linear-gradient(to right, rgba(99,102,241,0.03), transparent); border: 1px solid rgba(99,102,241,0.15);">
     <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); display: flex; align-items: center; justify-content: center; font-size: 22px; border: 1px solid rgba(99,102,241,0.3);"><i data-lucide="sparkles" class="icon-sm text-amber-500"></i></div>
     <div style="flex: 1;">
      <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px; color: var(--color-primary);">${s.segment}</div>
      <div style="font-size: 14px; line-height: 1.5;">${s.strategy}</div>
     </div>
     <span class="badge" style="background: rgba(99,102,241,0.1); color: var(--color-primary); border-color: rgba(99,102,241,0.2); font-size: 11px; padding: 6px 14px;">${channelMap[s.segment] || 'Omnichannel'}</span>
    </div>
   `).join('')}
  </div>
 `;
 
 setTimeout(() => {
  container.style.transition = 'opacity 0.4s ease';
  container.style.opacity = 1;
 }, 100);
}

window.showSegmentDetails = function(segmentName) {
 const seg = (segmentsData.cluster_centers || segmentsData.segments)?.find(s => s.name === segmentName);
 const dist = (segmentsData.segment_distribution || segmentsData.segments)?.find(s => s.name === segmentName);
 const rec = segmentsData.recommendations?.find(s => s.segment === segmentName);
 if (!seg || !dist) return;
 
 const modal = document.getElementById('modal');
 const title = document.getElementById('modalTitle');
 const body = document.getElementById('modalBody');
 if(!modal || !title || !body) return;
 
 const color = dist.color || seg.color || '#6366f1';
 title.innerHTML = `<span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${color}; margin-right:8px; box-shadow: 0 0 8px ${color}80;"></span>${seg.name} Analysis`;
 const total = segmentsData.metrics?.total_customers || segmentsData.total_customers || 1;
 const pct = Math.round((dist.count / total) * 100);
 const features = seg.features || seg;
 
 body.innerHTML = `
  <div style="margin-bottom: 20px; display: grid; gap: 12px; grid-template-columns: repeat(2, 1fr);">
   <div class="card" style="padding: 16px; background: var(--color-bg); border: 1px solid rgba(255,255,255,0.05);">
    <div class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Segment Size</div>
    <div style="font-size: 20px; font-weight: 500; margin-top: 4px; color: #fff;">${dist.count.toLocaleString('en-IN')} <span class="muted" style="font-size: 14px; font-weight: normal;">(${pct}%)</span></div>
   </div>
   <div class="card" style="padding: 16px; background: var(--color-bg); border: 1px solid rgba(255,255,255,0.05);">
    <div class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Avg Order Value</div>
    <div style="font-size: 20px; font-weight: 500; margin-top: 4px; color: var(--color-secondary);">₹${features.avg_order_value?.toFixed(1) || features.avg_order || 0}</div>
   </div>
   <div class="card" style="padding: 16px; background: var(--color-bg); border: 1px solid rgba(255,255,255,0.05);">
    <div class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Purchase Freq</div>
    <div style="font-size: 20px; font-weight: 500; margin-top: 4px; color: #fff;">${features.frequency?.toFixed(1) || 0} <span class="muted" style="font-size: 14px; font-weight: normal;">orders</span></div>
   </div>
   <div class="card" style="padding: 16px; background: var(--color-bg); border: 1px solid rgba(255,255,255,0.05);">
    <div class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Recency</div>
    <div style="font-size: 20px; font-weight: 500; margin-top: 4px; color: #fff;">${features.recency?.toFixed(1) || 0} <span class="muted" style="font-size: 14px; font-weight: normal;">days</span></div>
   </div>
   <div class="card" style="padding: 16px; background: var(--color-bg); border: 1px solid rgba(255,255,255,0.05); grid-column: span 2;">
    <div class="muted" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Est. Avg Income</div>
    <div style="font-size: 20px; font-weight: 500; margin-top: 4px; color: #fff;">₹${(features.income || 0).toLocaleString('en-IN')}</div>
   </div>
  </div>
  <div style="padding: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1)); border-radius: 12px; border: 1px solid rgba(99,102,241,0.2);">
   <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
    <span style="font-size: 18px;"><i data-lucide="lightbulb" class="icon-sm text-amber-500"></i></span>
    <strong style="color: var(--color-primary);">AI Insight & Strategy</strong>
   </div>
   <div style="line-height: 1.5; font-size: 14px; color: var(--color-text);">
    ${rec?.strategy || 'Custom targeting strategy recommended.'}
   </div>
  </div>
 `;
 modal.classList.remove('hidden');
};

window.showKPIDetails = function(kpiType) {
 const modal = document.getElementById('modal');
 const title = document.getElementById('modalTitle');
 const body = document.getElementById('modalBody');
 if(!modal || !title || !body) return;
 
 let details = {};
 if (kpiType === 'total') {
  details = { icon: '<i data-lucide="users" class="icon-sm text-blue-500"></i>', title: 'Total Customers', desc: 'The total number of unique customers analyzed across the entire dataset. This forms the baseline population for K-Means clustering.' };
 } else if (kpiType === 'silhouette') {
  details = { icon: '<i data-lucide="target" class="icon-sm text-purple-500"></i>', title: 'Silhouette Score', desc: 'A measure of how similar an object is to its own cluster compared to other clusters. Scores near +1 indicate dense, well-separated clusters, while negative scores indicate overlapping groups.' };
 } else if (kpiType === 'segments') {
  details = { icon: '<i data-lucide="bar-chart" class="icon-sm text-blue-500"></i>', title: 'Total Segments', desc: 'The optimal number of distinct customer cohorts identified by the machine learning model. Each group shares distinct RFM (Recency, Frequency, Monetary) behaviors.' };
 } else if (kpiType === 'algorithm') {
  details = { icon: '<i data-lucide="bot" class="icon-sm text-purple-500"></i>', title: 'AI Algorithm', desc: 'K-Means clustering is used to group customers based on distance in a multi-dimensional space. UMAP is then applied to reduce this high-dimensional space down to 2D for visual scatter plotting.' };
 } else { return; }
 
 title.innerHTML = `<span style="margin-right: 8px;">${details.icon}</span>${details.title} Metrics`;
 body.innerHTML = `
  <div style="padding: 24px; background: var(--color-bg); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); line-height: 1.6; color: var(--color-text); font-size: 15px;">
   ${details.desc}
  </div>
 `;
 modal.classList.remove('hidden');
};

window.initializeSegmentation = initializeSegmentation;
