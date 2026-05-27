import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# I will regex out everything from the first @app.route('/api/financials/save') to the if __name__ == '__main__':
# and replace it with the new route.
pattern = r"@app\.route\('/api/financials/save'.*?if __name__ == '__main__':"
replacement = """@app.route('/api/financials/save', methods=['POST', 'OPTIONS'])
def save_financials():

    print("FINANCIALS SAVE ROUTE HIT")

    if request.method == 'OPTIONS':
        return jsonify({
            "success": True
        }), 200

    try:

        data = request.get_json()

        print("FINANCIALS DATA:", data)

        financial_doc = {

            "user_email": data.get("user_email"),

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

            "created_at": datetime.utcnow().isoformat()
        }

        inserted = financials_collection.insert_one(financial_doc)

        print("FINANCIAL INSERTED:", inserted.inserted_id)

        return jsonify({
            "success": True,
            "inserted_id": str(inserted.inserted_id)
        })

    except Exception as e:

        print("FINANCIAL SAVE ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':"""

c = re.sub(pattern, replacement, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched models_api.py for financials")
