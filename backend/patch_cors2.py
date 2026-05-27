import sys

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace CORS initialization
old_cors = """app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)"""

new_cors = """app = Flask(__name__)

CORS(app)
print("CRM API SERVER RUNNING")"""

c = c.replace(old_cors, new_cors)

# Replace CRM Route
import re
old_route_pattern = r"@app\.route\('/api/crm/add-startup', methods=\['POST', 'OPTIONS'\]\).*?def add_crm_startup\(\):.*?return jsonify\({[^}]*success[^}]*error[^}]*}\), 500"

new_route = """@app.route('/api/crm/add-startup', methods=['POST', 'OPTIONS'])
def add_crm_startup():

    print("CRM ROUTE HIT")

    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

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

        crm_collection.insert_one(crm_doc)

        print("CRM INSERT SUCCESS")

        response = jsonify({
            "success": True,
            "message": "CRM startup added successfully",
            "data": crm_doc
        })

        response.headers.add("Access-Control-Allow-Origin", "*")

        return response

    except Exception as e:
        print("CRM ERROR:", str(e))

        response = jsonify({
            "success": False,
            "error": str(e)
        })

        response.headers.add("Access-Control-Allow-Origin", "*")

        return response, 500"""

c = re.sub(old_route_pattern, new_route, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Models API Patched Successfully")
