import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the login route body
old_route_pattern = r"@app\.route\('/api/login', methods=\['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\]\)\s*def login\(\):.*?(?=return jsonify\(\{.*?\})return jsonify\(\{.*?\}\)"
match = re.search(old_route_pattern, content, re.DOTALL)

if match:
    new_route = """@app.route('/api/login', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def login():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        user = users_collection.find_one({"email": email})

        if not user:
            return jsonify({"success": False, "message": "User not found"}), 401

        if not user.get('password'):
            return jsonify({"success": False, "message": "Invalid user account"}), 401

        if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            return jsonify({
                "success": True,
                "user": {
                    "name": user.get("name"),
                    "email": user.get("email"),
                    "role": user.get("role", "user")
                }
            }), 200
        else:
            return jsonify({"success": False, "message": "Invalid password"}), 401
            
    except Exception as e:
        print("Login Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500"""
    
    content = content.replace(match.group(0), new_route)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Login route patched.")
