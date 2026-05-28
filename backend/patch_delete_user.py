import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the old delete_user route which might look like:
# @app.route('/api/users/<id>', methods=['DELETE'])
# def delete_user(id):
# ...
pattern = r"@app\.route\('/api/users/<(?:id|email|path:email)>', methods=\['(?:GET, )?POST, PUT, DELETE(?:, OPTIONS)?'\]\)\ndef delete_user\((?:id|email)\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"
c = re.sub(pattern, "", c)

# Or maybe it was @app.route('/api/users/<id>', methods=['DELETE'])
pattern2 = r"@app\.route\('/api/users/<(?:id|path:email|email)>', methods=\['DELETE'\]\)\ndef delete_user\((?:id|email)\):[\s\S]*?(?=@app\.route|if __name__ == '__main__':)"
c = re.sub(pattern2, "", c)

# Add the EXACT route requested at the bottom of the file
new_route = """@app.route('/api/users/<path:email>', methods=['DELETE'])
def delete_user(email):

    try:

        result = users_collection.delete_one({
            "email": email
        })

        if result.deleted_count == 0:

            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        }), 200

    except Exception as e:

        print("DELETE USER ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

"""

c = re.sub(r"if __name__ == '__main__':", new_route + "\nif __name__ == '__main__':", c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched delete_user in models_api.py")
