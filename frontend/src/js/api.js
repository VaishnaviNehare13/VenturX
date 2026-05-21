/**
 * VenturX - API Service Layer
 * Handles all communication with the Express API / Python ML Microservice
 */

const API_BASE_URL = window.location.origin;

// Request timeout configuration
const TIMEOUT = 60000;

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
 
 try {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
   ...options,
   signal: controller.signal,
   headers: {
    'Content-Type': 'application/json',
    ...options.headers
   }
  });
  clearTimeout(timeoutId);
  
  if (!response.ok) {
   throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
 } catch (error) {
  clearTimeout(timeoutId);
  console.error(`API Error (${endpoint}):`, error);
  throw error;
 }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Health & Status
// ═══════════════════════════════════════════════════════════════════════════════

const HealthAPI = {
 async check() {
  return apiRequest('/api/health');
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 01 - Customer Segmentation
// ═══════════════════════════════════════════════════════════════════════════════

const SegmentationAPI = {
 async getSegments() {
  return apiRequest('/api/segmentation');
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 02 - Sales Forecasting
// ═══════════════════════════════════════════════════════════════════════════════

const ForecastingAPI = {
 async getSalesForecast(periods = 90) {
  return apiRequest(`/api/forecast/sales?periods=${periods}`);
 },
 async analyzeStartup(data) {
  return apiRequest('/api/startup/analyze', {
   method: 'POST',
   body: JSON.stringify(data)
  });
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 03 - Campaign Performance Prediction
// ═══════════════════════════════════════════════════════════════════════════════

const CampaignAPI = {
 async predictCampaign(data) {
  return apiRequest('/api/campaign/predict', {
   method: 'POST',
   body: JSON.stringify(data)
  });
 },
 
 async getBatchStats() {
  return apiRequest('/api/campaign/batch-predict');
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 04 - Financial Forecasting
// ═══════════════════════════════════════════════════════════════════════════════

const FinancialAPI = {
 async predictProfit(data) {
  return apiRequest('/api/forecast/profit', {
   method: 'POST',
   body: JSON.stringify(data)
  });
 },
 
 async getScenarios() {
  return apiRequest('/api/forecast/profit/scenarios');
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 05 - Recommendation Engine
// ═══════════════════════════════════════════════════════════════════════════════

const RecommendationAPI = {
 async getRecommendations(customerId, topN = 3) {
  return apiRequest(`/api/recommendations/${customerId}?top_n=${topN}`);
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MODEL 06 - Workflow Optimization
// ═══════════════════════════════════════════════════════════════════════════════

const WorkflowAPI = {
 async getOptimizedTasks(topN = 20) {
  return apiRequest(`/api/workflow/optimize?top_n=${topN}`);
 },
 
 async scoreTask(data) {
  return apiRequest('/api/workflow/score', {
   method: 'POST',
   body: JSON.stringify(data)
  });
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard & Evaluation
// ═══════════════════════════════════════════════════════════════════════════════

const DashboardAPI = {
 async getKPIs() {
  return apiRequest('/api/dashboard/kpis');
 }
};

const EvaluationAPI = {
 async getMetrics() {
  return apiRequest('/api/evaluation');
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════════

const Utils = {
 /**
  * Format currency values
  */
 formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
   style: 'currency',
   currency: currency,
   minimumFractionDigits: 0,
   maximumFractionDigits: 0
  }).format(value);
 },
 
 /**
  * Format percentage values
  */
 formatPercent(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
 },
 
 /**
  * Format large numbers (K, M, B)
  */
 formatCompact(value) {
  return new Intl.NumberFormat('en-US', {
   notation: 'compact',
   compactDisplay: 'short'
  }).format(value);
 },
 
 /**
  * Show loading state on element
  */
 setLoading(element, isLoading) {
  if (isLoading) {
   element.classList.add('loading');
   element.setAttribute('aria-busy', 'true');
  } else {
   element.classList.remove('loading');
   element.removeAttribute('aria-busy');
  }
 },
 
 /**
  * Debounce function calls
  */
 debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
   const later = () => {
    clearTimeout(timeout);
    func(...args);
   };
   clearTimeout(timeout);
   timeout = setTimeout(later, wait);
  };
 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Export API modules
// ═══════════════════════════════════════════════════════════════════════════════

window.API = {
 Health: HealthAPI,
 Segmentation: SegmentationAPI,
 Forecasting: ForecastingAPI,
 Campaign: CampaignAPI,
 Financial: FinancialAPI,
 Recommendation: RecommendationAPI,
 Workflow: WorkflowAPI,
 Dashboard: DashboardAPI,
 Evaluation: EvaluationAPI,
 Utils: Utils
};
