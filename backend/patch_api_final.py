import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports (from db import users_collection)
if 'from db import users_collection' not in c:
    c = re.sub(r'from flask import.*', r'\g<0>\nfrom db import users_collection', c, count=1)

# 2. CORS
if 'CORS(app)' not in c:
    # Find app = Flask(__name__)
    c = re.sub(r'app = Flask\(__name__\)', r'app = Flask(__name__)\nfrom flask_cors import CORS\nCORS(app)', c)

# 3. Replace the entire route
pattern = r"@app\.route\('/api/users/<path:email>', methods=\['GET'(?:, 'OPTIONS')?\]\)\ndef get_user\(email\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"

new_route = """@app.route('/api/users/<path:email>', methods=['GET'])
def get_user(email):

    try:

        print("Fetching user:", email)

        user = users_collection.find_one({
            "email": email
        })

        if user is None:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Convert Mongo ObjectId safely
        user["_id"] = str(user["_id"])

        # Remove password field
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

print("Patched models_api.py completely.")
