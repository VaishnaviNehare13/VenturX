import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Match the login route definition and its body up to the next route or bottom of file
pattern = r'@app\.route\("/api/login"[\s\S]*?(?=@app\.route|if __name__ ==)'

replacement = """@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        user = users_collection.find_one({
            "email": email
        })

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        stored_password = user.get("password")
        if not stored_password:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        password_match = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

        if not password_match:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        return jsonify({
            "success": True,
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "user")
            }
        }), 200

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

"""

c = re.sub(pattern, replacement, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Login route completely rebuilt.")
