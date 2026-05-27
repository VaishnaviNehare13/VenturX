import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Add import
content = content.replace("activity_logs_collection", "activity_logs_collection,\n    dashboard_collection")

# Fix 2: Add API Route at the end of the file
route_code = """

@api.route('/dashboard', methods=['GET'])
def get_dashboard():
    try:
        # Check if dashboard exists
        dashboard = dashboard_collection.find_one()
        
        if not dashboard:
            # Bootstrap default dashboard data
            import datetime
            default_dashboard = {
                "workspace": "VenturX HQ",
                "total_revenue": 1245600,
                "active_subscriptions": 124,
                "ai_confidence": 94,
                "marketing_roi": 3.2,
                "health_score": 88,
                "retention_rate": 94.5,
                "churn_rate": 1.2,
                "revenue_growth": [8.4, 9.2, 10.1, 10.8, 11.5, 12.4],
                "client_growth": [98, 105, 112, 115, 120, 124],
                "ai_metrics": [82, 85, 88, 91, 93, 96],
                "telemetry": {
                    "latency": "24ms",
                    "uptime": "99.9%",
                    "api_calls": 45890
                },
                "ai_insights": [
                    "Revenue increased by 14% this quarter.",
                    "Churn risk is low for Enterprise tier."
                ],
                "activity_feed": [
                    {"type": "user", "message": "New Enterprise user signed up.", "time": "2m ago"},
                    {"type": "system", "message": "AI Engine optimized parameters.", "time": "15m ago"},
                    {"type": "revenue", "message": "Payment of \u20b91,24,000 received.", "time": "1h ago"}
                ],
                "updated_at": datetime.datetime.utcnow().isoformat()
            }
            dashboard_collection.insert_one(default_dashboard)
            dashboard = dashboard_collection.find_one()

        dashboard['_id'] = str(dashboard['_id'])
        print("Dashboard Loaded")
        return jsonify({"success": True, "data": dashboard}), 200
    except Exception as e:
        print("Error in /dashboard:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500
"""

if "@api.route('/dashboard'" not in content:
    content += route_code

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend API Patched.")
