import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Specifically target the exact old route
pattern = r"@app\.route\('/api/users/<id>', methods=\['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\]\)\ndef delete_user\(id\):[\s\S]*?return jsonify\(\{[\s\S]*?\"success\": True[\s\S]*?\}\)"

c = re.sub(pattern, "", c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Removed old delete_user route.")
