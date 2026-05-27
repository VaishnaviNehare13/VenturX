import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# First, remove EVERYTHING from the file starting from "# ══════════════════════════════════════════════════════════════════════════════\n# CRM – Add Startup" to the end
c = re.sub(r"# ══════════════════════════════════════════════════════════════════════════════\n# CRM – Add Startup.*$", "", c, flags=re.DOTALL)

# Also remove the `if __name__ == '__main__':` block so we can re-add it at the very bottom
c = re.sub(r"if __name__ == '__main__':\n.*?app\.run\(debug=True, port=5000\)", "", c, flags=re.DOTALL)

# This is the exact CRM route the user requested
new_route = """
# ══════════════════════════════════════════════════════════════════════════════
# CRM – Add Startup
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/api/crm/add-startup', methods=['POST', 'OPTIONS'])
def add_crm_startup():

    print("CRM ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("CRM DATA RECEIVED:", data)

        crm_doc = {
            "founder_name": data.get("founder_name"),
            "email": data.get("email"),
            "startup_name": data.get("startup_name"),
            "industry": data.get("industry"),
            "subscription_plan": data.get("subscription_plan"),
            "activity_level": data.get("activity_level"),
            "lifecycle_stage": data.get("lifecycle_stage"),
            "forecasts_created": data.get("forecasts_created"),
            "admin_notes": data.get("admin_notes"),
            "created_at": datetime.utcnow().isoformat()
        }

        inserted = crm_collection.insert_one(crm_doc)

        print("CRM INSERTED:", inserted.inserted_id)

        return jsonify({
            "success": True,
            "message": "Startup added successfully",
            "inserted_id": str(inserted.inserted_id)
        })

    except Exception as e:

        print("CRM BACKEND ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print(" Starting AI Models & Dashboard Aggregation API on port 5000...")
    app.run(debug=True, port=5000)
"""

c = c.strip() + "\n" + new_route

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Models API patched: Route moved above app.run()")
