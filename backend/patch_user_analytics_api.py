import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

new_routes = """
@app.route('/api/user_analytics/<email>', methods=['GET'])
def get_user_analytics(email):
    try:
        from datetime import datetime
        doc = user_analytics_collection.find_one({"user_email": email})
        
        if not doc:
            doc = {
                "user_email": email,
                "workspace": "VenturX Workspace",
                "total_revenue": 1250000,
                "active_subscriptions": 150,
                "ai_confidence": 92,
                "marketing_roi": 12.5,
                "retention_rate": 95,
                "prediction_score": 88,
                "growth_chart": [10, 20, 35, 55, 80, 100],
                "client_growth": [5, 10, 25, 40, 60, 85],
                "ai_insights": ["Strong growth trajectory detected."],
                "updated_at": datetime.utcnow().isoformat()
            }
            user_analytics_collection.insert_one(doc.copy())
            
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
            
        return jsonify({
            "success": True,
            "data": doc
        })
    except Exception as e:
        print("GET USER ANALYTICS ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/user_analytics/save', methods=['POST', 'OPTIONS'])
def save_user_analytics():
    print("USER ANALYTICS SAVE ROUTE HIT")
    
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
        
    try:
        from datetime import datetime
        data = request.get_json()
        print("USER ANALYTICS PAYLOAD:", data)
        
        user_email = data.get("user_email")
        if not user_email:
            return jsonify({"success": False, "message": "user_email is required"}), 400
            
        payload = {
            "user_email": user_email,
            "workspace": data.get("workspace", "VenturX Workspace"),
            "total_revenue": data.get("total_revenue", 0),
            "active_subscriptions": data.get("active_subscriptions", 0),
            "ai_confidence": data.get("ai_confidence", 0),
            "marketing_roi": data.get("marketing_roi", 0),
            "retention_rate": data.get("retention_rate", 0),
            "prediction_score": data.get("prediction_score", 0),
            "growth_chart": data.get("growth_chart", []),
            "client_growth": data.get("client_growth", []),
            "ai_insights": data.get("ai_insights", []),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        user_analytics_collection.update_one(
            {"user_email": user_email},
            {"$set": payload},
            upsert=True
        )
        
        print("USER ANALYTICS SAVED")
        return jsonify({
            "success": True,
            "message": "User analytics saved successfully"
        })
        
    except Exception as e:
        print("USER ANALYTICS SAVE ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

c = re.sub(r"if __name__ == '__main__':", new_routes, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for user_analytics")
