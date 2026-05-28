import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

new_route = """
@app.route('/api/users/<email>', methods=['GET', 'OPTIONS'])
def get_user_by_email(email):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        user = users_collection.find_one({"email": email})
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
            
        # Serialize and remove password
        user["_id"] = str(user["_id"])
        if "password" in user:
            del user["password"]
            
        return jsonify({
            "success": True,
            "user": user
        }), 200
        
    except Exception as e:
        print("GET USER ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

c = re.sub(r"if __name__ == '__main__':", new_route, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for GET /api/users/<email>")
