import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update imports
c = c.replace('crm_collection\n)', 'crm_collection,\n    segmentation_collection\n)')

# 2. Add route just above if __name__ == '__main__':
new_route = """
@app.route('/api/segmentation/save', methods=['POST', 'OPTIONS'])
def save_segmentation():

    print("SEGMENTATION ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("SEGMENTATION DATA:", data)

        segmentation_doc = {

            "user_email": data.get("user_email"),

            "summary": {
                "total_customers": data.get("total_customers"),
                "silhouette_score": data.get("silhouette_score"),
                "segments_count": data.get("segments_count"),
                "algorithm": data.get("algorithm")
            },

            "segments": data.get("segments"),

            "recommendations": data.get("recommendations"),

            "created_at": datetime.utcnow().isoformat()
        }

        inserted = segmentation_collection.insert_one(segmentation_doc)

        print("SEGMENTATION INSERTED:", inserted.inserted_id)

        return jsonify({
            "success": True,
            "message": "Segmentation saved successfully",
            "inserted_id": str(inserted.inserted_id)
        })

    except Exception as e:

        print("SEGMENTATION ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

c = re.sub(r"if __name__ == '__main__':", new_route, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Models API patched: Segmentation route added")
