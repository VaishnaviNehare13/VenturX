import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports
if 'from bson import ObjectId' not in c:
    c = re.sub(r'from flask import.*', r'\g<0>\nfrom bson import ObjectId', c, count=1)

# 2. Global CORS
if 'from flask_cors import CORS' not in c:
    c = re.sub(r'app = Flask\(__name__\)', r'app = Flask(__name__)\nfrom flask_cors import CORS\nCORS(app)', c)

# 3. Replace the /api/users/<path:email> route
pattern = r"@app\.route\('/api/users/<path:email>', methods=\['GET', 'OPTIONS'\]\)\ndef get_user\(email\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"

new_route = """@app.route('/api/users/<path:email>', methods=['GET'])
def get_user(email):

    try:

        print("Fetching user:", email)

        user = users_collection.find_one({
            "email": email
        })

        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        # Convert ObjectId
        user["_id"] = str(user["_id"])

        # Remove password
        if "password" in user:
            del user["password"]

        return jsonify({
            "success": True,
            "user": user
        })

    except Exception as e:

        print("GET USER ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

"""

c = re.sub(pattern, new_route, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py with the user's exactly requested code.")
