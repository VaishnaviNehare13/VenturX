import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the import
c = c.replace('branding_collection\n)', 'branding_collection,\n    financials_collection\n)')

new_route = """
@app.route('/api/financials/save', methods=['POST', 'OPTIONS'])
def save_financials():

    print("FINANCIAL SAVE ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("FINANCIAL PAYLOAD:", data)

        user_email = data.get("user_email")

        financial_doc = {

            "user_email": user_email,

            "workspace": data.get("workspace"),

            "total_revenue": data.get("total_revenue"),

            "mrr": data.get("mrr"),

            "total_expenses": data.get("total_expenses"),

            "net_profit": data.get("net_profit"),

            "burn_rate": data.get("burn_rate"),

            "investor_readiness": data.get("investor_readiness"),

            "rd_spend": data.get("rd_spend"),

            "administration_cost": data.get("administration_cost"),

            "marketing_spend": data.get("marketing_spend"),

            "predicted_profit": data.get("predicted_profit"),

            "revenue_trajectory": data.get("revenue_trajectory"),

            "expense_breakdown": data.get("expense_breakdown"),

            "profit_scenarios": data.get("profit_scenarios"),

            "transactions": data.get("transactions"),

            "ai_insights": data.get("ai_insights"),

            "updated_at": datetime.utcnow().isoformat()
        }

        financials_collection.update_one(
            {
                "user_email": user_email
            },
            {
                "$set": financial_doc
            },
            upsert=True
        )

        print("FINANCIAL DATA SAVED")

        return jsonify({
            "success": True,
            "message": "Financial data saved successfully"
        })

    except Exception as e:

        print("FINANCIAL SAVE ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/financials/<email>', methods=['GET'])
def load_financials(email):

    try:

        data = financials_collection.find_one({
            "user_email": email
        })

        if not data:

            return jsonify({
                "success": False,
                "message": "No financial data found"
            })

        data["_id"] = str(data["_id"])

        return jsonify({
            "success": True,
            "data": data
        })

    except Exception as e:

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
