import os

frontend_dir = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig = content
    content = content.replace("'$' +", "'₹' +")
    content = content.replace("'-$' +", "'-₹' +")
    content = content.replace('": $"', '": ₹"')
    content = content.replace(": '$'", ": '₹'")
    content = content.replace(": '$' +", ": '₹' +")
    
    # Check for cases like `: $` inside template literals
    content = content.replace(": $${", ": ₹${")
    content = content.replace("Profit: $${", "Profit: ₹${")
    content = content.replace("R&D: $${", "R&D: ₹${")
    content = content.replace("Marketing: $${", "Marketing: ₹${")
    
    # Catch literal `$${` that was missed
    content = content.replace("$${", "₹${")

    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed remaining dollars in {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Final cleanup complete.")
