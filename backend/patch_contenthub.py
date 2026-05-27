import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the import
c = c.replace('segmentation_collection\n)', 'segmentation_collection,\n    contenthub_collection\n)')

new_route = """
@app.route('/api/contenthub/save', methods=['POST', 'OPTIONS'])
def save_contenthub():

    print("CONTENT HUB ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("CONTENT HUB DATA:", data)

        content_doc = {

            "content_type": data.get("content_type"),

            "tone_of_voice": data.get("tone_of_voice"),

            "target_audience": data.get("target_audience"),

            "prompt_topic": data.get("prompt_topic"),

            "keywords": data.get("keywords"),

            "generated_content": data.get("generated_content"),

            "engagement_probability": data.get("engagement_probability"),

            "readability_score": data.get("readability_score"),

            "seo_score": data.get("seo_score"),

            "scheduled_platform": data.get("scheduled_platform"),

            "scheduled_date": data.get("scheduled_date"),

            "draft_status": data.get("draft_status", "draft"),

            "created_at": datetime.utcnow().isoformat()
        }

        inserted = contenthub_collection.insert_one(content_doc)

        print("CONTENT SAVED:", inserted.inserted_id)

        return jsonify({
            "success": True,
            "message": "Content saved successfully",
            "inserted_id": str(inserted.inserted_id)
        })

    except Exception as e:

        print("CONTENT HUB ERROR:", str(e))

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
