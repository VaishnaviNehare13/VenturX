import sys

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('"origins": "http://localhost:3000"', '"origins": "*"')

old_route = """@app.route('/api/crm/add-startup', methods=['POST'])
def add_crm_startup():
    try:
        data = request.json"""

new_route = """@app.route('/api/crm/add-startup', methods=['POST', 'OPTIONS'])
def add_crm_startup():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
        
    try:
        data = request.json"""

c = c.replace(old_route, new_route)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Models API Patched Successfully")
