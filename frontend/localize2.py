import os

frontend_dir = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig = content
    content = content.replace("$$", "₹$")
    content = content.replace("-$${", "-₹${")
    content = content.replace("+$${", "+₹${")
    
    # Also catch ` : '$' + ` -> ` : '₹' + ` if missed
    content = content.replace("'-$' : '$'", "'-₹' : '₹'")
    content = content.replace("? '-$' : '$'", "? '-₹' : '₹'")
    content = content.replace("? '-₹' : '$'", "? '-₹' : '₹'")

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated template literals in {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    if "node_modules" in root: continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Template literals fixed.")
