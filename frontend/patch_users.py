import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: renderAdminTab logic
# The user wants debug logs before injecting usersHTML
debug_logs = """      case 'users': 
        const usersHTML = getUsersHTML();
        console.log("Users HTML Generated");
        console.log(usersHTML.substring(0, 50) + "...");
        console.log(container);
        container.innerHTML = usersHTML; 
        bindUserEvents(); 
        break;"""
content = re.sub(r"case 'users': container\.innerHTML = getUsersHTML\(\); bindUserEvents\(\); break;", debug_logs, content)

# Remove the block that blocks rendering if AdminEngine is missing
content = content.replace("""  if (!window.AdminEngine) {
    console.log("Rendering users safely...");
    container.innerHTML = `<div class="admin-empty-state"><div class="admin-empty-title">Loading Admin Engine...</div></div>`;
    return;
  }""", "")

# Fix 2: getUsersHTML AdminEngine dependencies
content = content.replace(
    "${window.AdminEngine.getActiveWorkspaces()}",
    "${window.LiveOverviewData ? window.LiveOverviewData.active_subscriptions : (window.LiveMongoUsers ? window.LiveMongoUsers.length : 0)}"
)

content = content.replace(
    "${window.AdminEngine.getSubscriptionBreakdown().Enterprise}",
    "${window.LiveOverviewData ? window.LiveOverviewData.enterprise_accounts : (window.LiveMongoUsers ? window.LiveMongoUsers.filter(a => a.plan === 'Enterprise').length : 0)}"
)

# Fix 3: bindUserEvents AdminEngine dependencies
content = content.replace(
    "const accounts = window.AdminEngine.getAccountsData();",
    "const accounts = window.LiveMongoUsers || (window.AdminEngine ? window.AdminEngine.getAccountsData() : []);"
)

content = content.replace(
    "const activeUsers = window.AdminEngine.getTotalUsers();",
    "const activeUsers = window.LiveOverviewData ? window.LiveOverviewData.total_users : (window.LiveMongoUsers ? window.LiveMongoUsers.length : 0);"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Users tab patched.")
