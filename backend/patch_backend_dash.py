import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# I will append the route to the bottom before if __name__ == '__main__':

new_route = """
@app.route('/api/dashboard/<email>', methods=['GET', 'OPTIONS'])
def new_user_dashboard(email):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        from db import users_collection, user_analytics_collection, financials_collection
        import random

        # Fetch user
        user = users_collection.find_one({"email": email})
        startup_name = user.get("company", "Unknown Workspace") if user else "Unknown Workspace"
        industry = user.get("industry", "Technology") if user else "Technology"

        # Fetch user analytics
        user_analytics = user_analytics_collection.find_one({"user_email": email})

        # Fetch financials
        financials = financials_collection.find_one({"user_email": email})

        # Merge metrics
        revenue = 0
        subscriptions = 0
        ai_confidence = 0
        marketing_roi = 0
        growth_chart = []
        ai_insights = []
        workspace_name = startup_name

        has_data = False
        if user_analytics:
            subscriptions = user_analytics.get("active_subscriptions", 0)
            ai_confidence = user_analytics.get("ai_confidence", 0)
            marketing_roi = user_analytics.get("marketing_roi", 0)
            growth_chart = user_analytics.get("growth_chart", [])
            ai_insights = user_analytics.get("ai_insights", [])
            revenue = user_analytics.get("total_revenue", 0)
            has_data = True
            
        if financials:
            revenue = financials.get("total_revenue", revenue)
            has_data = True

        if not has_data:
            # Generate randomized starter metrics based on industry and startup name
            industry_lower = industry.lower()
            startup_lower = startup_name.lower()
            
            if "ai" in industry_lower or "ai" in startup_lower:
                ai_confidence = random.randint(85, 98)
                marketing_roi = round(random.uniform(2.5, 4.5), 1)
            elif "edtech" in industry_lower or "edtech" in startup_lower or "education" in industry_lower:
                ai_confidence = random.randint(60, 80)
                marketing_roi = round(random.uniform(1.2, 2.8), 1)
            elif "marketing" in industry_lower or "marketing" in startup_lower:
                ai_confidence = random.randint(70, 90)
                marketing_roi = round(random.uniform(4.5, 8.5), 1)
            else:
                ai_confidence = random.randint(60, 90)
                marketing_roi = round(random.uniform(2.0, 5.0), 1)

            subscriptions = random.randint(10, 500)
            revenue = subscriptions * random.randint(500, 2500)
            
            growth_chart = [random.randint(10, 100) for _ in range(6)]
            ai_insights = [f"Welcome to VenturX, {startup_name}!", "Your workspace is ready."]

        return jsonify({
            "success": True,
            "data": {
                "revenue": revenue,
                "subscriptions": subscriptions,
                "ai_confidence": ai_confidence,
                "marketing_roi": marketing_roi,
                "growth_chart": growth_chart,
                "ai_insights": ai_insights,
                "workspace_name": workspace_name
            }
        }), 200

    except Exception as e:
        print("DASHBOARD API ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

# Replace old route /api/user-dashboard/<email> if it exists
c = re.sub(r"@app\.route\(\"/api/user-dashboard/<email>\", methods=\[\"GET\", \"OPTIONS\"\]\)[\s\S]*?(?=@app\.route|if __name__ == '__main__':)", "", c)

c = re.sub(r"if __name__ == '__main__':", new_route, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for user dashboard")
