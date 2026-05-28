import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

pattern = r"// Update Header\s*const welcomeTitle = document\.querySelector\('\.dash-header h1'\);\s*if \(welcomeTitle && data\.workspace_name\) \{\s*welcomeTitle\.innerHTML = `Welcome back to \$\{data\.workspace_name\}`;\s*\}"

replacement = """// Update Header
            let workspaceName = data.workspace || data.startup_name || data.workspace_name || user.startup_name || user.company || (user.name ? user.name.split(' ')[0] + "'s HQ" : null);
            
            if (workspaceName === "Unknown Workspace") {
                workspaceName = user.startup_name || user.company || (user.name ? user.name.split(' ')[0] + "'s HQ" : null);
            }
            
            console.log("Workspace Loaded:", workspaceName);
            
            if (workspaceName && workspaceName !== "Unknown Workspace") {
                const welcomeTitle = document.querySelector('.dash-header h1');
                if (welcomeTitle) welcomeTitle.innerHTML = `Welcome back to ${workspaceName}`;
                
                const workspaceBadge = document.querySelector('.dash-header .status-pill:first-child');
                if (workspaceBadge) workspaceBadge.innerHTML = `<i data-lucide="folder" style="width:12px; margin-right:4px;"></i> Workspace: ${workspaceName}`;
                
                if (window.lucide) window.lucide.createIcons();
            }"""

c = re.sub(pattern, replacement, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched dashboard.js for workspace title")
