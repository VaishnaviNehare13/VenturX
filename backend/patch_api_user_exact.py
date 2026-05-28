import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the get_user function exactly as requested
pattern = r"@app\.route\('/api/users/<path:email>', methods=\['GET'\]\)\ndef get_user\(email\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"

new_route = """@app.route('/api/users/<path:email>', methods=['GET'])
def get_user(email):

    try:

        print("Fetching user:", email)

        from db import users_collection

        user = users_collection.find_one({
            "email": email
        })

        if user is None:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Convert Mongo ObjectId
        user["_id"] = str(user["_id"])

        # Remove password
        user.pop("password", None)

        return jsonify({
            "success": True,
            "user": user
        })

    except Exception as e:

        print("GET USER API ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

"""

c = re.sub(pattern, new_route, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py with EXACT code")
