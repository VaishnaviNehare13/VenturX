import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix CORS
old_cors = '''CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)'''
new_cors = '''CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True
)'''
content = content.replace(old_cors, new_cors)
if old_cors not in content and new_cors not in content:
    # Try generic replacement
    content = re.sub(r'CORS\(\s*app,\s*resources=\{r"/api/\*":\s*\{"origins":\s*"[^"]*"\}\},\s*supports_credentials=True\s*\)', new_cors, content)


# 2. Fix route methods
# The target routes:
# /api/signup, /api/login, /api/dashboard, /api/users, /api/recommendations, /api/reports, /api/platform-health, /api/settings
routes_to_fix = [
    "/api/signup",
    "/api/login",
    "/api/dashboard",
    "/api/users",
    "/api/users/<id>",
    "/api/recommendations",
    "/api/reports",
    "/api/platform-health",
    "/api/settings",
    "/api/settings/<setting_id>"
]

# Create a regex to match the route definitions
for route in routes_to_fix:
    escaped_route = re.escape(route)
    # Find @app.route('route', methods=[...]) or similar
    pattern = r"(@app\.route\((?:'|\")" + escaped_route + r"(?:'|\")(?:\s*,\s*methods=\[[^\]]*\])?\))"
    
    def replacer(match):
        return f"@app.route('{route}', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])"
        
    content = re.sub(pattern, replacer, content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend patched for CORS and route methods.")
