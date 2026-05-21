import os
import re

frontend_dir = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend"

company_map = {
    "Acme Corp": "TechNova Solutions",
    "Acme AI": "TechNova AI",
    "Acme": "TechNova",
    "Wayne Enterprises": "BharatAI Systems",
    "Umbrella Corp": "Pune Digital Labs",
    "LexCorp": "FinEdge Analytics",
    "Stark Industries": "SmartKart India",
    "Cyberdyne Systems": "VisionX AI",
    "Oscorp Industries": "NeoMind Solutions",
    "Global Tech Solutions": "GrowVista Technologies",
    "Sarah Connor": "Kavya Iyer",
    "John Doe": "Aarav Sharma",
    "john@acme.com": "aarav@technova.in",
    "Jane Smith": "Priya Patil",
    "Alice Johnson": "Sneha Kulkarni",
    "Bob Williams": "Rohan Deshmukh"
}

region_map = {
    "California": "Bengaluru",
    "New York": "Mumbai",
    "Los Angeles": "Pune",
    "Texas": "Hyderabad",
    "London": "Delhi",
    "Berlin": "Chennai"
}

metrics_map = {
    "ARR": "Monthly Revenue",
    "CAC": "Operating Cost",
    "Burn Multiple": "Startup Expansion Rate"
}

# Regex to find $ values
def format_currency(content):
    # This is tricky because we don't want to replace jQuery $ or template literal ${
    # Replace literal '$' when followed by a number or space number
    content = re.sub(r'\$(\d)', r'₹\1', content)
    content = re.sub(r'\$\s+(\d)', r'₹ \1', content)
    
    # Replace in strings like '$' +
    content = content.replace("'$' +", "'₹' +")
    content = content.replace('"$"', '"₹"')
    content = content.replace("'-$'", "'-₹'")
    content = content.replace("'-$' +", "'-₹' +")
    content = content.replace("+$", "+₹")
    content = content.replace("-$", "-₹")
    
    # Update toLocaleString
    content = content.replace(".toLocaleString()", ".toLocaleString('en-IN')")
    
    # Revert template literals that might have broken if they were like ${
    # but ${ is not $ followed by digit, so it should be fine.
    # However we might have replaced $ { if it had a space, but we didn't.
    
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    orig = content
    
    for old, new in company_map.items():
        content = content.replace(old, new)
        
    for old, new in region_map.items():
        content = content.replace(old, new)
        
    if filepath.endswith('.html'):
        for old, new in metrics_map.items():
            content = content.replace(old, new)
            
    content = format_currency(content)
    
    if orig != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    if "node_modules" in root: continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Localization Complete.")
