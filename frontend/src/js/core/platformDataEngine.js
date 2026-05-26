window.PlatformData = {
  users: [],
  crm: [],
  campaigns: [],
  forecasts: [],
  recommendations: [],
  subscriptions: [],
  notifications: [],
  aiUsage: [],
  segmentation: [],
  branding: [],
  content: [],
  analytics: [],
  financials: [],
  activityFeed: [],
  reports: [],
  settings: {},
  accounts: [],
  workspaces: [],
  recommendationMetrics: {
    generated: 0,
    accepted: 0,
    dismissed: 0,
    highestConfidence: [],
    mostTriggered: []
  }
};

function savePlatformData(moduleName = "core") {
  localStorage.setItem(
    "venturx_platform_data",
    JSON.stringify(window.PlatformData)
  );
  // Dispatch global event for live syncing
  window.dispatchEvent(
    new CustomEvent("platform:data-updated", {
      detail: { module: moduleName }
    })
  );
}

function loadPlatformData() {
  const saved = localStorage.getItem("venturx_platform_data");

  if (saved) {
    const parsed = JSON.parse(saved);
    window.PlatformData = { ...window.PlatformData, ...parsed };
    // Ensure nested objects like recommendationMetrics aren't overwritten completely if missing fields
    if(!window.PlatformData.recommendationMetrics) {
      window.PlatformData.recommendationMetrics = { generated: 0, accepted: 0, dismissed: 0, highestConfidence: [], mostTriggered: [] };
    }
  } else {
    // Initial load / Migration
    window.PlatformData.crm = JSON.parse(localStorage.getItem("saasCustomers") || "[]");
    window.PlatformData.campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
    savePlatformData();
  }
}

function calculateTotalRevenue() {
  return window.PlatformData.crm.reduce((sum, customer) => {
    let rev = customer.revenue;
    // Fallback for legacy customers without explicit revenue property
    if (rev === undefined) {
      if (customer.subscriptionPlan === 'enterprise' || customer.plan === 'Enterprise' || customer.activityLevel === 'Highly Active') rev = 299;
      else if (customer.subscriptionPlan === 'pro' || customer.plan === 'Pro' || customer.activityLevel === 'Moderate') rev = 49;
      else rev = 15;
    }
    return sum + (parseFloat(rev) || 0);
  }, 0);
}

function calculateTotalExpenses() {
  return window.PlatformData.campaigns.reduce(
    (sum, campaign) => sum + (campaign.budget || 0),
    0
  );
}

function calculateNetProfit() {
  return calculateTotalRevenue() - calculateTotalExpenses();
}

function calculateMRR() {
  return calculateTotalRevenue(); // Adjusted as calculateTotalRevenue is acting as MRR
}

function calculateBurnRate() {
  return calculateTotalExpenses() / 6;
}

function logActivity(type, message, user = "System") {
  window.PlatformData.activityFeed.unshift({
    type,
    message,
    timestamp: Date.now(),
    user
  });
  savePlatformData("activity");
}

function addNotification(message) {
  window.PlatformData.notifications.unshift({
    message,
    timestamp: new Date().toISOString()
  });

  savePlatformData("notifications");
}

loadPlatformData();

window.PlatformEngine = {
  savePlatformData,
  loadPlatformData,
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateNetProfit,
  calculateMRR,
  calculateBurnRate,
  logActivity,
  addNotification
};

console.log("Platform Data Engine Initialized");
