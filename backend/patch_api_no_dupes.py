import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Verify Imports
if 'from flask import Flask, request, jsonify' not in c:
    c = re.sub(r'from flask import.*', r'from flask import Flask, request, jsonify', c, count=1)
if 'from db import users_collection' not in c:
    c = re.sub(r'from flask import.*', r'\g<0>\nfrom db import users_collection', c, count=1)

# 2. Delete ALL existing routes for /api/users/<something>
# There could be def get_user_by_email or def get_user or anything. We'll use a regex that matches the route and the function definition.
pattern = r"@app\.route\('/api/users/<(?:path:)?email>'(?:, methods=\['GET'(?:, 'OPTIONS')?\])?\)\ndef [a-zA-Z0-9_]+\(email\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"
c = re.sub(pattern, "", c)

# Just in case there's another duplicate that didn't match the regex above:
# we can look for @app.route('/api/users/<email>') and wipe it.
pattern2 = r"@app\.route\('/api/users/<email>'\)[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"
c = re.sub(pattern2, "", c)

# 3. Add EXACT route at the VERY BOTTOM before if __name__ == '__main__':
new_route = """@app.route('/api/users/<path:email>', methods=['GET'])
def get_user(email):

    try:

        print("GET USER CALLED:", email)

        user = users_collection.find_one({
            "email": email
        })

        if not user:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        user["_id"] = str(user["_id"])

        if "password" in user:
            del user["password"]

        return jsonify({
            "success": True,
            "user": user
        }), 200

    except Exception as e:

        print("API ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

"""

c = re.sub(r"if __name__ == '__main__':", new_route + "\nif __name__ == '__main__':", c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py completely by removing duplicates and adding at bottom.")
