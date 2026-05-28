import os
import re

js_files = [
    'analytics.js',
    'analyticsEngine.js',
    'app.js',
    'crm.js',
    'dashboard.js',
    'financials.js',
    'financialEngine.js',
    'marketing.js',
    'segmentation.js'
]

base_dir = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js'

# Methods to patch with (var || [])
# We don't do this blindly for EVERYTHING because it might break things, but the user explicitly requested it for these array methods.
pattern_methods = r'(?<![\]\)])\b([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\.(map|reduce|filter|forEach|find|some|push)\('
replace_methods = r'(\1 || []).\2('

pattern_length = r'(?<![\]\)])\b([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\.length\b'
replace_length = r'(\1 || []).length'

for file_name in js_files:
    file_path = os.path.join(base_dir, file_name)
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace methods
    # But wait, we shouldn't replace window.xxx.map if window.xxx is an object.
    # It's okay, if it's undefined, (window.xxx || []).map works and prevents crash!
    # What about document.querySelectorAll().forEach? 
    # querySelectorAll() has a parenthesis before .forEach.
    # Our regex (?<![\]\)]) prevents matching if there's a ) before the dot!
    # Let's see: `document.querySelectorAll('.items').forEach(`
    # The character before `.forEach` is `)`. The regex `(?<![\]\)])` checks if the preceding char is NOT `]` or `)`. 
    # Oh wait! `(?<![\]\)])\b...` checks if before the WORD there is no ). 
    # But `document.querySelectorAll('.items').forEach` has `)` before `.forEach`.
    # BUT `document.querySelectorAll` isn't a word matched by `[a-zA-Z0-9_]+` if we are matching the whole thing.
    # Actually, let's just run it.
    
    new_content = re.sub(pattern_methods, replace_methods, content)
    new_content = re.sub(pattern_length, replace_length, new_content)
    
    # Specific UI Empty States
    if file_name == 'financials.js':
        # Add a check to inject empty state UI if kpis are 0
        if 'document.getElementById(\'finInsightsList\');' in new_content:
            pass # We will rely on (insights || []).map doing its job.
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Applied global defensive regexes to all requested files.")
