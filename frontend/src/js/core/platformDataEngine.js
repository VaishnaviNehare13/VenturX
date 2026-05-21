window.PlatformData = {
  crm: [],
  campaigns: [],
  branding: [],
  segmentation: [],
  forecasts: [],
  transactions: [],
  analyticsEvents: [],
  aiUsage: [],
  notifications: []
};

function savePlatformData() {
  localStorage.setItem(
    "platformData",
    JSON.stringify(window.PlatformData)
  );
  // Dispatch global event for live syncing
  window.dispatchEvent(new Event("platform:data-updated"));
}

function loadPlatformData() {
  const saved = localStorage.getItem("platformData");

  if (saved) {
    window.PlatformData = JSON.parse(saved);
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
      if (customer.plan === 'Enterprise' || customer.activityLevel === 'High') rev = 299;
      else if (customer.plan === 'Pro' || customer.activityLevel === 'Medium') rev = 49;
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
  return calculateTotalRevenue() / 12;
}

function calculateBurnRate() {
  return calculateTotalExpenses() / 6;
}

function addNotification(message) {
  window.PlatformData.notifications.unshift({
    message,
    timestamp: new Date().toISOString()
  });

  savePlatformData();
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
  addNotification
};

console.log("Platform Data Engine Initialized");
