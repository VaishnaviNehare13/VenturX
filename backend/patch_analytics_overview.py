import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

new_route = """
@app.route('/api/analytics/overview', methods=['GET'])
def analytics_overview():
    try:
        # Aggregation logic
        # 1. users
        total_users = users_collection.count_documents({})
        
        # 2. startup_growth
        # Just return active subscriptions from user_analytics or calculate percentage
        # We will calculate average retention_rate from user_analytics
        user_an_docs = list(user_analytics_collection.find({}))
        
        if user_an_docs:
            customer_retention = sum(d.get("retention_rate", 0) for d in user_an_docs) / len(user_an_docs)
            ai_tool_usage = sum(d.get("ai_confidence", 0) for d in user_an_docs) # approximate usage proxy
            revenue_growth = sum(d.get("total_revenue", 0) for d in user_an_docs)
            startup_growth = sum(d.get("active_subscriptions", 0) for d in user_an_docs)
        else:
            customer_retention = 0
            ai_tool_usage = 0
            revenue_growth = 0
            startup_growth = 0

        # 3. campaigns_collection
        camp_docs = list(campaigns_collection.find({}))
        if camp_docs:
            campaign_reach = sum(float(c.get("impressions", c.get("reach", 0))) for c in camp_docs)
        else:
            campaign_reach = 0
            
        # 4. financials_collection
        fin_docs = list(financials_collection.find({}))
        if fin_docs:
            # Add financials revenue if available
            revenue_growth += sum(float(f.get("total_revenue", 0)) for f in fin_docs)

        # 5. crm_collection
        crm_docs = list(crm_collection.find({}))
        if crm_docs:
            # Overwrite total_users if CRM is heavily populated, or combine
            total_users += len(crm_docs)
            
        return jsonify({
            "success": True,
            "data": {
                "total_users": total_users,
                "startup_growth": startup_growth,
                "ai_tool_usage": ai_tool_usage,
                "customer_retention": round(customer_retention, 2),
                "campaign_reach": campaign_reach,
                "revenue_growth": revenue_growth
            }
        })
    except Exception as e:
        print("ANALYTICS OVERVIEW ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e),
            "data": {
                "total_users": 0,
                "startup_growth": 0,
                "ai_tool_usage": 0,
                "customer_retention": 0,
                "campaign_reach": 0,
                "revenue_growth": 0
            }
        }), 500

if __name__ == '__main__':
"""

c = re.sub(r"if __name__ == '__main__':", new_route, c, count=1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for analytics overview")
