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
  if (!window.PlatformData || typeof window.PlatformData !== 'object') {
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
      recommendationMetrics: { generated: 0, accepted: 0, dismissed: 0, highestConfidence: [], mostTriggered: [] }
    };
  }

  // Bound arrays to prevent localStorage quota exhaustion
  if (Array.isArray(window.PlatformData.activityFeed)) {
    window.PlatformData.activityFeed = window.PlatformData.activityFeed.slice(0, 50);
  }
  if (Array.isArray(window.PlatformData.notifications)) {
    window.PlatformData.notifications = window.PlatformData.notifications.slice(0, 50);
  }
  if (Array.isArray(window.PlatformData.segmentation)) {
    window.PlatformData.segmentation = window.PlatformData.segmentation.slice(-5);
  }
  if (Array.isArray(window.PlatformData.forecasts)) {
    window.PlatformData.forecasts = window.PlatformData.forecasts.slice(-5);
  }
  if (Array.isArray(window.PlatformData.financials)) {
    window.PlatformData.financials = window.PlatformData.financials.slice(-5);
  }

  try {
    localStorage.setItem(
      "venturx_platform_data",
      JSON.stringify(window.PlatformData)
    );
  } catch (err) {
    if (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014) {
      console.warn("Local storage quota exceeded; using reduced platform data.");
      try {
        const reducedData = {
          ...window.PlatformData,
          activityFeed: Array.isArray(window.PlatformData.activityFeed) ? window.PlatformData.activityFeed.slice(0, 20) : [],
          notifications: Array.isArray(window.PlatformData.notifications) ? window.PlatformData.notifications.slice(0, 20) : [],
          segmentation: [],
          forecasts: [],
          financials: [],
          reports: []
        };
        localStorage.setItem(
          "venturx_platform_data",
          JSON.stringify(reducedData)
        );
      } catch (innerErr) {
        console.warn("Could not save even reduced platform data to localStorage", innerErr);
      }
    } else {
      console.error("Platform storage failed", err);
    }
  }

  // Dispatch global event for live syncing
  window.dispatchEvent(
    new CustomEvent("platform:data-updated", {
      detail: { module: moduleName }
    })
  );
}

function loadPlatformData() {
  try {
    if (!window.PlatformData || typeof window.PlatformData !== 'object') {
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
        recommendationMetrics: { generated: 0, accepted: 0, dismissed: 0, highestConfidence: [], mostTriggered: [] }
      };
    }

    const saved = localStorage.getItem("venturx_platform_data");

    if (saved) {
      const parsed = JSON.parse(saved);
      window.PlatformData = { ...window.PlatformData, ...parsed };
      if(!window.PlatformData.recommendationMetrics) {
        window.PlatformData.recommendationMetrics = { generated: 0, accepted: 0, dismissed: 0, highestConfidence: [], mostTriggered: [] };
      }
      if (Array.isArray(window.PlatformData.activityFeed)) {
        window.PlatformData.activityFeed = window.PlatformData.activityFeed.slice(0, 50);
      }
      if (Array.isArray(window.PlatformData.notifications)) {
        window.PlatformData.notifications = window.PlatformData.notifications.slice(0, 50);
      }
    } else {
      // Initial load / Migration
      window.PlatformData.crm = JSON.parse(localStorage.getItem("saasCustomers") || "[]");
      window.PlatformData.campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
      savePlatformData();
    }
  } catch (err) {
    console.warn("Could not load platform data from localStorage", err);
  }
}

function calculateTotalRevenue() {
  const pd = window.PlatformData;
  if (!pd || typeof pd !== 'object') {
    console.warn("CRM data missing or window.PlatformData is null. Defaulting revenue to 0.");
    return 0;
  }
  const crmList = Array.isArray(pd.crm) ? pd.crm : [];
  if (!crmList.length) {
    return 0;
  }
  return crmList.reduce((sum, customer, idx) => {
    if (!customer || typeof customer !== 'object') {
      console.warn(`CRM data missing for account/user at index: ${idx}`);
      return sum;
    }
    let rev = customer.revenue;
    // Fallback for legacy customers without explicit revenue property
    if (rev === undefined || rev === null || isNaN(parseFloat(rev))) {
      if (customer.subscriptionPlan === 'enterprise' || customer.plan === 'Enterprise' || customer.activityLevel === 'Highly Active') rev = 299;
      else if (customer.subscriptionPlan === 'pro' || customer.plan === 'Pro' || customer.activityLevel === 'Moderate') rev = 49;
      else rev = 15;
    }
    return sum + (parseFloat(rev) || 0);
  }, 0);
}

function calculateTotalExpenses() {
  const pd = window.PlatformData;
  if (!pd || typeof pd !== 'object') return 0;
  const campList = Array.isArray(pd.campaigns) ? pd.campaigns : [];
  return campList.reduce(
    (sum, campaign) => sum + (parseFloat(campaign?.budget) || 0),
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
  if (!window.PlatformData || typeof window.PlatformData !== 'object') {
    window.PlatformData = {};
  }
  if (!Array.isArray(window.PlatformData.activityFeed)) {
    window.PlatformData.activityFeed = [];
  }
  window.PlatformData.activityFeed.unshift({
    type,
    message,
    timestamp: Date.now(),
    user
  });
  if (window.PlatformData.activityFeed.length > 50) {
    window.PlatformData.activityFeed = window.PlatformData.activityFeed.slice(0, 50);
  }
  savePlatformData("activity");
}

function addNotification(message) {
  if (!window.PlatformData || typeof window.PlatformData !== 'object') {
    window.PlatformData = {};
  }
  if (!Array.isArray(window.PlatformData.notifications)) {
    window.PlatformData.notifications = [];
  }
  window.PlatformData.notifications.unshift({
    message,
    timestamp: new Date().toISOString()
  });
  if (window.PlatformData.notifications.length > 50) {
    window.PlatformData.notifications = window.PlatformData.notifications.slice(0, 50);
  }
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
