import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# We need to replace the two /api/users definitions.
# Currently they are:
# @app.route('/api/users', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
# def create_user(): ...
# @app.route('/api/users', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
# def get_users(): ...

# I will replace the first one with POST/OPTIONS and the second one with GET/OPTIONS.
# Wait, it's safer to just combine them to ensure they map perfectly and handle the logic safely.
pattern = r"@app\.route\('/api/users', methods=\['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\]\)\ndef create_user\(\):[\s\S]*?return jsonify\(\{\n\s*\"success\": False,\n\s*\"error\": str\(e\)\n\s*\}\), 500"

replacement = """@app.route('/api/users', methods=['GET', 'POST', 'OPTIONS'])
def handle_users():
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        data = request.get_json(silent=True) or {}
        
        if request.method == 'POST':
            user = {
                "name": data.get("name"),
                "email": data.get("email"),
                "company": data.get("company"),
                "plan": data.get("plan"),
                "revenue": data.get("revenue"),
                "ai_engagement": data.get("ai_engagement"),
                "churn_risk": data.get("churn_risk"),
                "status": data.get("status")
            }
            result = users_collection.insert_one(user)
            return jsonify({
                "success": True,
                "inserted_id": str(result.inserted_id)
            })

        if request.method == 'GET':
            print("Users API Hit Successfully")
            users = list(users_collection.find({}, {"password": 0}))
            for user in users:
                user["_id"] = str(user["_id"])
                
            return jsonify({
                "success": True,
                "users": users
            })
            
    except Exception as e:
        print("USERS API ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500"""

c = re.sub(pattern, replacement, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for GET /api/users")
