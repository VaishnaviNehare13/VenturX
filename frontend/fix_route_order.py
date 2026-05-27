import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the get_dashboard block
route_pattern = r"(@app\.route\('/api/dashboard', methods=\['GET', 'OPTIONS'\]\).*?)(?=\n\n|\Z)"
match = re.search(route_pattern, content, re.DOTALL)

if match:
    route_code = match.group(1)
    # Remove the route from its current location
    content = content.replace(route_code, "")
    
    # Add OPTIONS handling
    if "if request.method == 'OPTIONS':" not in route_code:
        route_code = route_code.replace(
            "def get_dashboard():\n    try:",
            "def get_dashboard():\n    if request.method == 'OPTIONS':\n        return jsonify({'success': True}), 200\n    try:"
        )
    
    # Also we need to make sure we import `request` if not already, but it's likely already there for other endpoints.
    
    # Insert it right BEFORE if __name__ == "__main__":
    insert_target = 'if __name__ == "__main__":'
    if insert_target in content:
        content = content.replace(insert_target, f"{route_code}\n\n{insert_target}")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Fixed route order and added OPTIONS preflight.")
else:
    print("Could not find route code.")
