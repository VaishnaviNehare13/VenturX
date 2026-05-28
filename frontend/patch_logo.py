import os
import re

frontend_dir = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend'

sidebar_logo_pattern = r'<div style="width: 40px; height: 40px; background: linear-gradient\(135deg, #6366f1, #8b5cf6, #c084fc\); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px; box-shadow: 0 4px 12px rgba\(139,92,246,0\.4\); text-shadow: 0 0 8px rgba\(255,255,255,0\.5\);">V</div>'
sidebar_new = r'<img src="assets/img/venturx-logo.png" style="width: 36px; height: 36px; object-fit: contain;" alt="VenturX Logo" />'

nav_logo_pattern = r'<div style="width:32px;height:32px;background:linear-gradient\(135deg, #6366f1, #a855f7\);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">V</div>'
nav_new = r'<img src="assets/img/venturx-logo.png" style="width: 32px; height: 32px; object-fit: contain;" alt="VenturX Logo" />'

admin_logo_pattern = r'<div class="admin-brand-logo">V</div>'
admin_new = r'<img src="assets/img/venturx-logo.png" style="width: 36px; height: 36px; object-fit: contain;" alt="VenturX Logo" />'

for root, dirs, files in os.walk(frontend_dir):
    if 'node_modules' in root: continue
    for f in files:
        if f.endswith('.html') or f.endswith('.js'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            orig_content = content
            
            # Sidebar replacement
            content = re.sub(sidebar_logo_pattern, sidebar_new, content)
            
            # Navbar replacement
            content = re.sub(nav_logo_pattern, nav_new, content)
            
            # Admin replacement
            content = re.sub(admin_logo_pattern, admin_new, content)
            
            # Add giant logo to Login and Signup
            if f == 'login.html':
                if 'assets/img/venturx-logo.png" style="width: 120px' not in content:
                    content = content.replace('<h1>Welcome Back</h1>', '<div style="text-align: center; margin-bottom: 24px;"><img src="assets/img/venturx-logo.png" style="width: 120px; height: 120px; object-fit: contain;" alt="VenturX Logo" /></div>\n      <h1>Welcome Back</h1>')
            
            if f == 'signup.html':
                if 'assets/img/venturx-logo.png" style="width: 120px' not in content:
                    content = content.replace('<h1>Create Workspace</h1>', '<div style="text-align: center; margin-bottom: 24px;"><img src="assets/img/venturx-logo.png" style="width: 120px; height: 120px; object-fit: contain;" alt="VenturX Logo" /></div>\n      <h1>Create Workspace</h1>')
                    
            if f == 'index.html' and 'public' in root:
                if 'venturx-logo.png' not in content:
                    content = content.replace('<title>VenturX — AI Business Command Center</title>', '<title>VenturX — AI Business Command Center</title>\n  <link rel="icon" type="image/png" href="assets/img/venturx-logo.png" />')
                    
            if content != orig_content:
                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Patched {f}")
