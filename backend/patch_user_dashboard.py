import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Add user_analytics_collection if not present
if "user_analytics_collection = db" not in content:
    # Find analytics_collection = db["analytics"] and insert after it
    content = re.sub(
        r'(analytics_collection = db\["analytics"\])',
        r'\1\nuser_analytics_collection = db["user_analytics"]',
        content
    )

# Check if route already exists
if "@app.route(\"/api/user-dashboard/<email>\"" not in content and "@app.route('/api/user-dashboard/<email>'" not in content:
    new_route = """
@app.route("/api/user-dashboard/<email>", methods=["GET", "OPTIONS"])
def get_user_dashboard(email):

    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:

        dashboard = user_analytics_collection.find_one({
            "user_email": email
        })

        if not dashboard:
            return jsonify({
                "success": False,
                "message": "Dashboard not found"
            }), 404

        dashboard["_id"] = str(dashboard["_id"])

        return jsonify({
            "success": True,
            "dashboard": dashboard
        }), 200

    except Exception as e:

        print("USER DASHBOARD ERROR:", str(e))

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
"""
    # Insert before if __name__ == "__main__":
    if 'if __name__ == "__main__":' in content:
        content = content.replace('if __name__ == "__main__":', new_route + '\nif __name__ == "__main__":')
    else:
        content += new_route

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend patched successfully.")
