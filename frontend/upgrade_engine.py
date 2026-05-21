import sys

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/core/platformDataEngine.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Make savePlatformData dispatch an event
save_orig = """function savePlatformData() {
    localStorage.setItem(
        "platformData",
        JSON.stringify(window.PlatformData)
    );
}"""

save_new = """function savePlatformData() {
    localStorage.setItem(
        "platformData",
        JSON.stringify(window.PlatformData)
    );
    // Dispatch global event for live syncing
    window.dispatchEvent(new Event("platform:data-updated"));
}"""
content = content.replace(save_orig, save_new)

# Improve calculateTotalRevenue to map legacy plans if revenue is missing
rev_orig = """function calculateTotalRevenue() {
    return window.PlatformData.crm.reduce(
        (sum, customer) => sum + (customer.revenue || 0),
        0
    );
}"""

rev_new = """function calculateTotalRevenue() {
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
}"""
content = content.replace(rev_orig, rev_new)

# Add load migration to absorb legacy localStorage arrays if platformData is missing
load_orig = """function loadPlatformData() {
    const saved = localStorage.getItem("platformData");

    if (saved) {
        window.PlatformData = JSON.parse(saved);
    }
}"""

load_new = """function loadPlatformData() {
    const saved = localStorage.getItem("platformData");

    if (saved) {
        window.PlatformData = JSON.parse(saved);
    } else {
        // Initial load / Migration
        window.PlatformData.crm = JSON.parse(localStorage.getItem("saasCustomers") || "[]");
        window.PlatformData.campaigns = JSON.parse(localStorage.getItem("campaigns") || "[]");
        savePlatformData();
    }
}"""
content = content.replace(load_orig, load_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Upgraded platformDataEngine.js")
