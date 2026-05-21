/**
 * Forecasting Module
 * Handles the logic, API calls, and chart rendering for the Sales Forecasting dashboard.
 */

window.initializeForecasting = async function() {
 console.log("Forecasting JS Loaded");

 const container = document.getElementById('forecastChartContainer');
 if (!container) return; // Not on the forecasting page

 // Initial State: Loading
 const ctx = document.getElementById('salesForecastChart');
 const skeleton = container.querySelector('.skeleton-chart');
 
 // Set up event listeners
 const periodSelect = document.getElementById('forecastPeriodSelect');
 if (periodSelect) {
  periodSelect.addEventListener('change', (e) => {
   loadForecastData(parseInt(e.target.value, 10));
  });
 }

 const btnCsv = document.getElementById('exportCsvBtn');
 if (btnCsv) btnCsv.addEventListener('click', exportToCSV);

 const btnPdf = document.getElementById('exportPdfBtn');
 if (btnPdf) btnPdf.addEventListener('click', exportToPDF);
 
 // Startup Modal interactions
 const btnAnalyze = document.getElementById('analyzeStartupBtn');
 console.log(btnAnalyze);
 
 const modal = document.getElementById('startupModal');
 const btnClose = document.getElementById('closeStartupModal');
 const btnCancel = document.getElementById('cancelStartupBtn');
 const form = document.getElementById('startupForm');
 
 if (btnAnalyze) {
  btnAnalyze.addEventListener('click', () => {
   console.log("BUTTON CLICKED");
   console.log(modal);
   if (modal) {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    // Small delay to allow display:flex to apply before animating opacity
    setTimeout(() => {
     modal.style.opacity = '1';
    }, 10);
   }
  });
 }
 
 const closeModal = () => {
  if (modal) {
   modal.style.opacity = '0';
   setTimeout(() => {
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
   }, 300); // match transition duration
  }
 };
 
 if (btnClose) btnClose.addEventListener('click', closeModal);
 if (btnCancel) btnCancel.addEventListener('click', closeModal);
 
 // Close on ESC
 document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
   closeModal();
  }
 });
 
 // Close on click outside
 if (modal) {
  modal.addEventListener('click', (e) => {
   if (e.target === modal) {
    closeModal();
   }
  });
 }
 
 // Form Submission
 if (form) {
  form.addEventListener('submit', async (e) => {
   e.preventDefault();
   closeModal();
   
   const payload = {
    startup_name: document.getElementById('suName').value,
    domain: document.getElementById('suDomain').value,
    target_audience: document.getElementById('suAudience').value,
    investment: parseFloat(document.getElementById('suInvestment').value) || 0,
    monthly_budget: parseFloat(document.getElementById('suBudget').value) || 0,
    pricing_model: document.getElementById('suPricing').value,
    expected_customers: parseFloat(document.getElementById('suCustomers').value) || 0,
    marketing_spend: parseFloat(document.getElementById('suMarketing').value) || 0,
    competitor_level: document.getElementById('suCompetitors').value,
    market_region: document.getElementById('marketRegion') ? document.getElementById('marketRegion').value : document.getElementById('suRegion').value,
    description: document.getElementById('suDescription').value
   };
   
   console.log("Analyze Startup Payload:", payload);
   
   await runStartupAnalysis(payload);
  });
 }
 
 // Initial Load - Removed automatic fetch of old Prophet API
 // Await user input for startup analysis instead
};

let currentForecastData = null;

function updateForecastKPIs(data, payload = {}) {
 // Format total revenue (e.g., ₹1.2M)
 document.getElementById('fcstTotalRevenue').textContent = window.API.Utils.formatCompact(data.predicted_revenue);
 
 // Format Growth Rate
 const growthEl = document.getElementById('fcstGrowthRate');
 growthEl.textContent = '+' + data.growth_score + '%';
 growthEl.style.color = '#10b981';

 // Confidence / Scalability Score
 const confEl = document.getElementById('fcstConfidence');
 if (data.scalability_score) {
  confEl.textContent = data.scalability_score + '/100';
  // Color based on prob
  if (data.scalability_score > 75) confEl.style.color = '#10b981';
  else if (data.scalability_score > 45) confEl.style.color = '#f59e0b';
  else confEl.style.color = '#ef4444';
 } else {
  confEl.textContent = '80.0%';
  confEl.style.color = 'inherit';
 }
 
 const periodLabel = document.getElementById('fcstPeriodLabel');
 if (periodLabel) periodLabel.textContent = `1st Year Target`;
 
 // Generate Dynamic Business Summary
 const summary = `
 ${data.startup_name} shows strong potential in the ${data.domain} industry.
 The AI model predicts approximately ₹${(data.predicted_revenue || 0).toLocaleString('en-IN')}
 in future revenue with a ${data.growth_score}% expected growth trend.

 The startup currently has a ${data.market_fit} market fit and a ${data.risk_level}
 risk profile. Strategic focus should remain on customer acquisition,
 marketing optimization, and scalable growth execution.
 `;

 document.getElementById('businessSummary').innerHTML = `
   <p style="color: #cbd5e1; line-height: 1.6;">${summary}</p>
 `;

 // Generate Dynamic SWOT Analysis
 const investment = parseFloat(payload.investment) || 0;
 const compLevel = (payload.competitor_level || "").toLowerCase();
 
 let strengths = "High growth potential";
 if (data.growth_score > 75) strengths = "Exceptional scalability and high growth ceiling.";
 else if (data.market_fit === "Excellent") strengths = "Perfect product-market fit detected.";
 
 let weaknesses = "Initial customer acquisition cost.";
 if (investment < 20000) weaknesses = "Limited runway and low initial capital.";
 
 let opportunities = "Untapped regional markets.";
 if (data.domain.toLowerCase().includes("saas")) opportunities = "High margin recurring revenue models.";
 
 let threats = "Market volatility.";
 if (compLevel === "high") threats = "Saturated market with strong competitors.";

 document.getElementById('swotAnalysis').innerHTML = `
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
   <div style="background: rgba(16,185,129,0.1); padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong style="color: #10b981;">Strengths</strong><br>
    <span style="font-size: 13px; color: #cbd5e1;">${strengths}</span>
   </div>
   <div style="background: rgba(239,68,68,0.1); padding: 12px; border-radius: 8px; border-left: 4px solid #ef4444;">
    <strong style="color: #ef4444;">Weaknesses</strong><br>
    <span style="font-size: 13px; color: #cbd5e1;">${weaknesses}</span>
   </div>
   <div style="background: rgba(59,130,246,0.1); padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
    <strong style="color: #3b82f6;">Opportunities</strong><br>
    <span style="font-size: 13px; color: #cbd5e1;">${opportunities}</span>
   </div>
   <div style="background: rgba(245,158,11,0.1); padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
    <strong style="color: #f59e0b;">Threats</strong><br>
    <span style="font-size: 13px; color: #cbd5e1;">${threats}</span>
   </div>
  </div>
 `;
}

function renderForecastChart(data) {
 const predictedRevenue = data.predicted_revenue;

 const labels = [
   'Month 1',
   'Month 2',
   'Month 3',
   'Month 4',
   'Month 5',
   'Month 6'
 ];

 const revenueData = [
   predictedRevenue * 0.15,
   predictedRevenue * 0.30,
   predictedRevenue * 0.45,
   predictedRevenue * 0.65,
   predictedRevenue * 0.82,
   predictedRevenue
 ];

 const ctx = document.getElementById('forecastChart').getContext('2d');

 if (window.forecastChartInstance) {
   window.forecastChartInstance.destroy();
 }

 window.forecastChartInstance = new Chart(ctx, {
   type: 'line',
   data: {
     labels,
     datasets: [{
       label: 'Revenue Growth',
       data: revenueData,
       borderColor: '#7c5cff',
       backgroundColor: 'rgba(124,92,255,0.15)',
       fill: true,
       tension: 0.4,
       borderWidth: 3
     }]
   },
   options: {
     responsive: true,
     maintainAspectRatio: false,
     plugins: {
       legend: {
         labels: {
           color: '#ffffff'
         }
       }
     },
     scales: {
       x: {
         ticks: {
           color: '#aaaaaa'
         },
         grid: {
           color: 'rgba(255,255,255,0.05)'
         }
       },
       y: {
         ticks: {
           color: '#aaaaaa'
         },
         grid: {
           color: 'rgba(255,255,255,0.05)'
         }
       }
     }
   }
 });
 
 // Show the canvas and hide skeleton since loadForecastData is removed
 document.getElementById('forecastChart').style.display = 'block';
 const skeleton = document.querySelector('#forecastChartContainer .skeleton-chart');
 if (skeleton) skeleton.style.display = 'none';
}

function generateAIInsights(data) {
 const trendEl = document.getElementById('aiTrendAnalysis');
 const recEl = document.getElementById('aiRecommendations');
 
 if (!trendEl || !recEl) return;

 const forecast = data.forecast || [];
 if (forecast.length < 2) return;

 const start = forecast[0].predicted;
 const end = forecast[forecast.length - 1].predicted;
 const change = ((end - start) / start) * 100;
 
 let trendHtml = '';
 let recHtml = '';

 if (change > 5) {
  trendHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #10b981;"></span>
    <span><strong>Strong Upward Trend:</strong> The model projects a ${change.toFixed(1)}% increase in baseline revenue over the next ${data.periods} days.</span>
   </div>
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #3b82f6;"></span>
    <span><strong>Seasonality Detected:</strong> Weekly patterns suggest higher sales volumes towards the weekends.</span>
   </div>
  `;
  
  recHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #6366f1;">•</span>
    <span>Scale up inventory and server capacity to handle the projected ${change.toFixed(1)}% demand increase.</span>
   </div>
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #6366f1;">•</span>
    <span>Increase targeted ad spend during the mid-week to capitalize on the upcoming weekend surges.</span>
   </div>
  `;
 } else if (change < -5) {
  trendHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #ef4444;"></span>
    <span><strong>Downward Trend:</strong> The model projects a ${Math.abs(change).toFixed(1)}% decrease in revenue over the next ${data.periods} days.</span>
   </div>
  `;
  recHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #f59e0b;">•</span>
    <span>Initiate win-back campaigns and consider promotional discounts to stimulate demand.</span>
   </div>
  `;
 } else {
  trendHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #8b5cf6;">→</span>
    <span><strong>Stable Forecast:</strong> Revenue is expected to remain relatively flat, fluctuating within a ${Math.abs(change).toFixed(1)}% margin.</span>
   </div>
  `;
  recHtml = `
   <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: flex-start;">
    <span style="color: #6366f1;">•</span>
    <span>Focus on customer retention and optimizing profit margins rather than aggressive acquisition.</span>
   </div>
  `;
 }

 trendEl.innerHTML = trendHtml;
 recEl.innerHTML = recHtml;
}

function exportToCSV() {
 if (!currentForecastData || !currentForecastData.forecast) {
  alert("No data available to export.");
  return;
 }
 
 const headers = ["Date", "Predicted Revenue", "Lower Bound", "Upper Bound"];
 const rows = currentForecastData.forecast.map(row => 
  [row.date, row.predicted, row.lower, row.upper].join(",")
 );
 
 const csvContent = [headers.join(","), ...rows].join("\n");
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 
 const link = document.createElement("a");
 link.setAttribute("href", url);
 link.setAttribute("download", `sales_forecast_${currentForecastData.periods}_days.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
}

function exportToPDF() {
 if (!currentForecastData || !window.jspdf) {
  alert("PDF generator not ready or no data available.");
  return;
 }

 const { jsPDF } = window.jspdf;
 const doc = new jsPDF();
 
 doc.setFontSize(18);
 doc.text("AI Sales Forecasting Report", 14, 22);
 
 doc.setFontSize(11);
 doc.setTextColor(100);
 doc.text(`Forecast Period: ${currentForecastData.periods} Days`, 14, 30);
 doc.text(`Model Used: ${currentForecastData.model}`, 14, 36);
 doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 42);
 
 // Table
 const tableData = currentForecastData.forecast.map(row => [
  row.date, 
  `₹${row.predicted.toLocaleString('en-IN')}`, 
  `₹${row.lower.toLocaleString('en-IN')} - ₹${row.upper.toLocaleString('en-IN')}`
 ]);
 
 doc.autoTable({
  startY: 50,
  head: [['Date', 'Predicted Sales', 'Confidence Interval (95%)']],
  body: tableData,
  theme: 'striped',
  headStyles: { fillColor: [99, 102, 241] }
 });
 
 doc.save(`sales_forecast_${currentForecastData.periods}_days.pdf`);
}

async function runStartupAnalysis(payload) {
 const overlay = document.getElementById('startupLoadingOverlay');
 if (overlay) {
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  setTimeout(() => overlay.style.opacity = '1', 10);
 }
 
 // Provide a minimum 1.5s delay to make the AI analysis feel "heavy" and real
 const minWait = new Promise(resolve => setTimeout(resolve, 1500));
 
 try {
  const [response] = await Promise.all([
   window.API.Forecasting.analyzeStartup(payload),
   minWait
  ]);
  
  // Convert backend fields to match frontend expectations if necessary
  const formattedData = {
   ...response,
   periods: 90, // the forecast is hardcoded to 90 days in the python backend
   forecast: response.forecast // already there
  };
  
  currentForecastData = formattedData;
  
  // Update headers and titles dynamically
  const headerTitle = document.querySelector('.page-header h2');
  if (headerTitle) headerTitle.textContent = `${payload.startup_name} Analysis`;
  
  const confidenceTitle = document.querySelector('.kpi-grid > div:nth-child(3) .kpi-title');
  if (confidenceTitle) confidenceTitle.textContent = 'Success Probability';
  
  updateForecastKPIs(formattedData, payload);
  renderForecastChart(formattedData);
  
  // Update AI Insights
  generateStartupInsights(formattedData);
  
  // Fade in results and scroll to them
  const resultsContainer = document.getElementById('startupAnalysisResults');
  if (resultsContainer) {
   resultsContainer.classList.add('fade-in');
   setTimeout(() => {
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
   }, 100);
  }
  
 } catch (err) {
  console.error("Startup Analysis failed:", err);
  alert("Failed to analyze startup. Please check the console for details.");
 } finally {
  if (overlay) {
   overlay.style.opacity = '0';
   setTimeout(() => {
    overlay.style.display = 'none';
    overlay.style.visibility = 'hidden';
   }, 300);
  }
 }
}

function generateStartupInsights(data) {
 const trendEl = document.getElementById('aiTrendAnalysis');
 const recEl = document.getElementById('aiRecommendations');
 
 if (!trendEl || !recEl) return;
 
 // Update section titles
 const trendParent = trendEl.parentElement;
 if (trendParent.querySelector('h3')) trendParent.querySelector('h3').textContent = 'Startup Viability';
 if (trendParent.querySelector('p')) trendParent.querySelector('p').textContent = 'Key metrics from the AI simulation';
 
 // Left Panel: Viability Metrics
 trendEl.innerHTML = `
  <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center; padding: 12px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.1); border-radius: 8px;">
   <div style="font-size: 24px;"><i data-lucide="bar-chart" class="icon-sm text-blue-500"></i></div>
   <div>
    <div style="font-size: 13px; color: var(--color-muted);">Market Fit</div>
    <div style="font-weight: 600; color: ${data.market_fit === 'High' ? '#10b981' : data.market_fit === 'Medium' ? '#f59e0b' : '#ef4444'};">${data.market_fit}</div>
   </div>
  </div>
  <div style="margin-bottom: 16px; display: flex; gap: 12px; align-items: center; padding: 12px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.1); border-radius: 8px;">
   <div style="font-size: 24px;"><i data-lucide="alert-triangle" class="icon-sm text-amber-500"></i></div>
   <div>
    <div style="font-size: 13px; color: var(--color-muted);">Risk Level</div>
    <div style="font-weight: 600; color: ${data.risk_level === 'Low' ? '#10b981' : data.risk_level === 'Medium' ? '#f59e0b' : '#ef4444'};">${data.risk_level}</div>
   </div>
  </div>
  <div style="display: flex; gap: 12px; align-items: center; padding: 12px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.1); border-radius: 8px;">
   <div style="font-size: 24px;"><i data-lucide="zap" class="icon-sm text-amber-500"></i></div>
   <div>
    <div style="font-size: 13px; color: var(--color-muted);">Scalability Score</div>
    <div style="font-weight: 600; color: #6366f1;">${data.scalability_score} / 100</div>
   </div>
  </div>
 `;
 
 // Right Panel: Recommendations
 const recs = data.recommendations || [];
 recEl.innerHTML = `
  <div style="display: grid; gap: 12px;">
   ${recs.map(r => `
    <div class="interactive-card hover-glow" style="display: flex; gap: 12px; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05)); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px;">
     <div style="color: #6366f1; font-size: 18px; line-height: 1;"><i data-lucide="lightbulb" class="icon-sm text-amber-500"></i></div>
     <div style="font-size: 14px; line-height: 1.5; color: var(--color-text);">${r}</div>
    </div>
   `).join('')}
  </div>
 `;
}
