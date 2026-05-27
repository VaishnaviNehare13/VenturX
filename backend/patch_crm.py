import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_route_pattern = r"@app\.route\('/api/crm/add-startup', methods=\['POST', 'OPTIONS'\]\).*?def add_crm_startup\(\):.*?return response, 500"

new_route = """@app.route('/api/crm/add-startup', methods=['POST', 'OPTIONS'])
def add_crm_startup():

    print("CRM ROUTE CALLED")

    if request.method == "OPTIONS":
        return '', 200

    try:
        data = request.get_json()

        print("CRM DATA:", data)

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

        from db import crm_collection
        result = crm_collection.insert_one(crm_doc)

        print("INSERTED:", result.inserted_id)
        
        # safely pop to make serializable
        crm_doc.pop("_id", None)

        return jsonify({
            "success": True,
            "message": "CRM startup added",
            "data": crm_doc
        }), 200

    except Exception as e:

        print("CRM ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500"""

# Wait, in the user's prompt, the old route had:
# `return jsonify({ ... }), 500`
# Let's just find the entire block starting from `@app.route('/api/crm/add-startup'` to the end of file since it's the last function.
c = re.sub(r"@app\.route\('/api/crm/add-startup'.*$", new_route, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched CRM route")
