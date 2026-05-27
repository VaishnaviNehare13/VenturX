import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the import
c = c.replace('contenthub_collection\n)', 'contenthub_collection,\n    branding_collection\n)')

new_route = """
@app.route('/api/branding/save', methods=['POST', 'OPTIONS'])
def save_branding():

    print("BRANDING ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("BRANDING DATA:", data)

        branding_doc = {

            "startup_description": data.get("startup_description"),

            "industry": data.get("industry"),

            "target_audience": data.get("target_audience"),

            "brand_vibe": data.get("brand_vibe"),

            "primary_color": data.get("primary_color"),

            "generated_logo": data.get("generated_logo"),

            "brand_kit": data.get("brand_kit"),

            "saved_identity_name": data.get("saved_identity_name"),

            "created_at": datetime.utcnow().isoformat()
        }

        inserted = branding_collection.insert_one(branding_doc)

        print("BRANDING SAVED:", inserted.inserted_id)

        return jsonify({
            "success": True,
            "message": "Brand identity saved successfully",
            "inserted_id": str(inserted.inserted_id)
        })

    except Exception as e:

        print("BRANDING ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

c = re.sub(r"if __name__ == '__main__':", new_route, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py")
