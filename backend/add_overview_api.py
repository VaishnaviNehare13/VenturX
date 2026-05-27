import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

overview_api_code = """
@app.route('/api/admin/overview', methods=['GET', 'OPTIONS'])
def admin_overview():
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
        
    try:
        total_users = users_collection.count_documents({})
        active_subscriptions = subscriptions_collection.count_documents({"status": "Active"})
        enterprise_accounts = subscriptions_collection.count_documents({"plan": "Enterprise"})
        total_reports = reports_collection.count_documents({})
        recommendation_count = recommendations_collection.count_documents({})
        
        # Aggregate Revenue
        revenue_agg = list(reports_collection.aggregate([{'$group': {'_id': None, 'total': {'$sum': '$revenue'}}}]))
        total_revenue = revenue_agg[0]['total'] if revenue_agg else 0
        
        # Aggregate AI Score
        score_agg = list(reports_collection.aggregate([{'$group': {'_id': None, 'avg': {'$avg': '$ai_score'}}}]))
        avg_ai_score = round(score_agg[0]['avg'], 1) if score_agg and score_agg[0]['avg'] else 0
        
        # Pull latest logs
        activity_logs = list(activity_logs_collection.find().sort("timestamp", -1).limit(8))
        for log in activity_logs:
            log["_id"] = str(log["_id"])
            
        # Compile telemetry
        telemetry = {
            "api_latency": 45,
            "cpu_usage": 12,
            "active_sessions": 34,
            "system_health_status": 98,
            "churn_risk_average": 14
        }
        
        payload = {
            "total_users": total_users,
            "active_subscriptions": active_subscriptions,
            "enterprise_accounts": enterprise_accounts,
            "total_reports": total_reports,
            "avg_ai_score": avg_ai_score,
            "total_revenue": total_revenue,
            "recommendation_count": recommendation_count,
            "activity_logs": activity_logs,
            "telemetry": telemetry
        }
        
        return jsonify(payload), 200

    except Exception as e:
        print("OVERVIEW API ERROR:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

"""

# Insert before Paths
marker = "# ── Paths ──────────────────────────────────────────────────────────────────────"
if marker in content:
    new_content = content.replace(marker, overview_api_code + marker)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Marker not found")
