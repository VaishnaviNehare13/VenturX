import re

path = 'models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CORS
content = re.sub(
    r'CORS\(\s*app,[\s\S]*?\)',
    'CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)',
    content
)
# Wait, user explicitly asked for: CORS(app, resources={r"/api/*": {"origins": "*"}})
content = re.sub(
    r'CORS\(\s*app,[\s\S]*?\)',
    'CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)',
    content
)
# Actually let's just make it exactly what they asked.
content = re.sub(
    r'CORS\(\s*app,[\s\S]*?\)',
    'CORS(app, resources={r"/api/*": {"origins": "*"}})',
    content
)

def update_methods(match):
    route = match.group(1)
    methods_str = match.group(2)
    methods = [m.strip(" '\"") for m in methods_str.split(',')]
    for m in ['POST', 'GET', 'OPTIONS']:
        if m not in methods:
            methods.append(m)
    new_methods_str = ", ".join([f"'{m}'" for m in methods])
    return f"@app.route({route}, methods=[{new_methods_str}])"

content = re.sub(r'@app\.route\((.*?),\s*methods=\[(.*?)\]\)', update_methods, content)

def add_methods(match):
    route = match.group(1)
    if 'methods=' not in match.group(0):
        return f"@app.route({route}, methods=['GET', 'POST', 'OPTIONS'])"
    return match.group(0)

content = re.sub(r'@app\.route\(([^,]+)\)', add_methods, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched models_api.py successfully")
