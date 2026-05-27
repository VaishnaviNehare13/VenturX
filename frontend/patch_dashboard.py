import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace loadDashboard function
old_load_dashboard = r"async function loadDashboard\(\) \{.*?(?=function renderDashboard\(\))"
new_load_dashboard = """async function loadDashboard() {
    try {
        const sessionStr = localStorage.getItem("venturx_session");
        if (!sessionStr) return;
        
        const user = JSON.parse(sessionStr);
        const email = user.email;
        if (!email) return;

        const response = await fetch(`http://127.0.0.1:5000/api/user-dashboard/${email}`);
        if (!response.ok) throw new Error("Dashboard API error");
        const json = await response.json();
        
        if (json.success && json.dashboard) {
            console.log("User Dashboard Loaded:", json.dashboard);
            window.LiveMongoDashboard = json.dashboard;
            renderDashboard();
            console.log("Live Mongo Dashboard Synced");
        }
    } catch (e) {
        console.error("Failed to load live dashboard, using fallback:", e);
    }
}

"""

content = re.sub(old_load_dashboard, new_load_dashboard, content, flags=re.DOTALL)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("dashboard.js patched successfully.")
