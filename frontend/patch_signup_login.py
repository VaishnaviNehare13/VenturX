import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix signup email handling
content = content.replace('email = data.get("email")', 'email = data.get("email", "").strip().lower()')

# Replace the login route body
old_route_pattern = r"@app\.route\('/api/login', methods=\['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'\]\)\s*def login\(\):.*?(?=return jsonify\(\{.*?\})return jsonify\(\{.*?\}\)"
match = re.search(old_route_pattern, content, re.DOTALL)

if match:
    new_route = """@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password required"
            }), 400

        user = users_collection.find_one({
            "email": email
        })

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 401

        stored_password = user.get("password")

        if not stored_password:
            return jsonify({
                "success": False,
                "message": "Password missing"
            }), 401

        print("LOGIN EMAIL:", email)
        print("USER FOUND:", user is not None)

        password_match = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )
        print("PASSWORD MATCH:", password_match)

        if not password_match:
            return jsonify({
                "success": False,
                "message": "Invalid password"
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "user")
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500"""
    
    content = content.replace(match.group(0), new_route)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Signup and login routes patched.")
