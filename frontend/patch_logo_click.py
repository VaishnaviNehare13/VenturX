import re

# 1. Update sidebar.html
sidebar_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\components\sidebar.html'
with open(sidebar_path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<div class="logo">', '<a href="#/dashboard" class="logo">')
c = c.replace('</span>\n</div>', '</span>\n</a>')
with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 2. Update admin.html
admin_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\pages\admin.html'
with open(admin_path, 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<div class="admin-brand">', '<a href="#/dashboard" class="admin-brand">')
# Look for the closing div of admin-brand. It is:
#     <div class="admin-brand">
#       <img src="assets/img/venturx-logo.png" style="width: 36px; height: 36px; object-fit: contain;" alt="VenturX Logo" />
#       VenturX Admin
#     </div>
c = re.sub(r'(<a href="#/dashboard" class="admin-brand">[\s\S]*?VenturX Admin\s*)</div\>', r'\1</a>', c)
with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 3. Update main.css
main_css_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\main.css'
with open(main_css_path, 'r', encoding='utf-8') as f:
    c = f.read()
if '.logo:hover' not in c:
    c = c.replace('.logo {\n  display: flex;', '.logo {\n  text-decoration: none;\n  cursor: pointer;\n  transition: transform 0.2s ease, opacity 0.2s ease;\n  display: flex;')
    c += '\n\n.logo:hover {\n  transform: scale(1.02);\n  opacity: 0.9;\n}\n'
with open(main_css_path, 'w', encoding='utf-8') as f:
    f.write(c)

# 4. Update admin.css
admin_css_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\admin.css'
with open(admin_css_path, 'r', encoding='utf-8') as f:
    c = f.read()
if '.admin-brand:hover' not in c:
    c = c.replace('.admin-brand {\n  height: 70px;', '.admin-brand {\n  text-decoration: none;\n  cursor: pointer;\n  transition: transform 0.2s ease, opacity 0.2s ease;\n  height: 70px;')
    c += '\n\n.admin-brand:hover {\n  transform: scale(1.02);\n  opacity: 0.9;\n}\n'
with open(admin_css_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Successfully applied global logo click handlers.")
