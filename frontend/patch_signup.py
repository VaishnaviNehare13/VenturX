import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the entire signup route with the new one
old_route_pattern = r"@app\.route\('/api/signup', methods=\['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\]\)\s*def signup\(\):.*?return jsonify\(\{.*?\}\)"
match = re.search(old_route_pattern, content, re.DOTALL)

if match:
    new_route = """@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():

    if request.method == 'OPTIONS':
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200

    try:
        data = request.json
        
        email = data.get("email")
        existing_user = users_collection.find_one({"email": email})
        
        if existing_user:
            return jsonify({
                "success": False,
                "message": "Email already exists"
            })

        hashed_password = bcrypt.hashpw(
            data.get("password").encode('utf-8'),
            bcrypt.gensalt()
        )

        user = {
            "name": data.get("fullName") or data.get("name"),
            "email": email,
            "startup_name": data.get("startupName") or data.get("company"),
            "industry": data.get("industry"),
            "team_size": data.get("teamSize") or data.get("team_size"),
            "password": hashed_password.decode('utf-8'),
            "plan": "Starter",
            "status": "Active",
            "revenue": 0,
            "ai_engagement": 84,
            "churn_risk": "Low"
        }

        result = users_collection.insert_one(user)
        user["_id"] = str(result.inserted_id)
        del user["password"]

        return jsonify({
            "success": True,
            "message": "Signup successful",
            "user": user
        }), 200

    except Exception as e:
        print("Signup Error:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500"""
    
    content = content.replace(match.group(0), new_route)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Signup route patched.")
