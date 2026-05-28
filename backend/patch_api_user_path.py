import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# We want to replace the `def get_user_by_email(email):` or `def get_user(email):` route block at the end.
# Specifically, replace the route for /api/users/<email> that I added earlier.
pattern = r"@app\.route\('/api/users/<email>', methods=\['GET', 'OPTIONS'\]\)\ndef get_user_by_email\(email\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"

replacement = """@app.route('/api/users/<path:email>', methods=['GET', 'OPTIONS'])
def get_user(email):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        print("Fetching user:", email)

        # Find user
        user = users_collection.find_one({"email": email})

        # User not found
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Convert Mongo ObjectId safely
        if "_id" in user:
            user["_id"] = str(user["_id"])

        # Remove sensitive fields safely
        user.pop("password", None)

        # Convert any remaining non-serializable values
        safe_user = {}

        for key, value in user.items():
            try:
                safe_user[key] = value
            except Exception:
                safe_user[key] = str(value)

        print("USER RESPONSE:", safe_user)

        return jsonify({
            "success": True,
            "user": safe_user
        }), 200

    except Exception as e:
        print("GET USER ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

"""

c = re.sub(pattern, replacement, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py with the user's provided code.")
