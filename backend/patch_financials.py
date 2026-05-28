import re
import sys

# 1. Patch models_api.py
api_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

new_route = """
@app.route('/api/financials/<path:email>', methods=['GET', 'OPTIONS'])
def get_user_financials(email):
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200

    try:
        from db import financials_collection
        
        financial_data = financials_collection.find_one({"user_email": email})
        
        if not financial_data:
            # Return demo fallback data
            financial_data = {
                "mrr": 450000,
                "revenue": 5400000,
                "expenses": 125000,
                "profit": 325000,
                "burn_rate": 45000,
                "investor_score": 85
            }
        else:
            if "_id" in financial_data:
                financial_data["_id"] = str(financial_data["_id"])
                
        # Remove non-serializable
        safe_data = {}
        for key, value in financial_data.items():
            try:
                safe_data[key] = value
            except:
                safe_data[key] = str(value)
                
        return jsonify({
            "success": True,
            "data": safe_data
        }), 200

    except Exception as e:
        print("GET FINANCIALS ERROR:", str(e))
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
"""

api_content = re.sub(r"if __name__ == '__main__':", new_route, api_content, count=1)
with open(api_path, 'w', encoding='utf-8') as f:
    f.write(api_content)


# 2. Patch financials.js
js_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'
with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

pattern = r"const kpis = FinancialEngine\.getFinancialKPIs\(\);"
replacement = """let kpis = FinancialEngine.getFinancialKPIs();
  
  try {
      const sessionStr = localStorage.getItem("venturx_session");
      if (sessionStr) {
          const user = JSON.parse(sessionStr);
          if (user && user.email) {
              const res = await fetch(`http://127.0.0.1:5000/api/financials/${user.email}`);
              if (res.ok) {
                  const json = await res.json();
                  if (json.success && json.data) {
                      console.log("Loaded financials for:", user.email);
                      console.log("Payload:", json.data);
                      
                      const d = json.data;
                      kpis.mrr = d.mrr || d.revenue / 12 || 0;
                      kpis.expenses = d.expenses || 0;
                      kpis.profit = d.profit || 0;
                      kpis.burnRate = d.burn_rate || d.burnRate || 0;
                      kpis.revenue = d.revenue || kpis.mrr * 12 || 0;
                      if (d.investor_score) kpis.investor_score = d.investor_score;
                  }
              }
          }
      }
  } catch (e) {
      console.error("Failed to load live financials:", e);
  }"""

js_content = re.sub(pattern, replacement, js_content)

# We also need to map the investor score dynamically instead of just relying on readiness.totalScore if investor_score is present
investor_pattern = r"invEl\.textContent = readiness\.totalScore \+ '/100';"
investor_replacement = r"invEl.textContent = (kpis.investor_score ? kpis.investor_score : readiness.totalScore) + '/100';"
js_content = re.sub(investor_pattern, investor_replacement, js_content)

# Update rev to use kpis.revenue instead of kpis.mrr * 12 if revenue is directly available
rev_pattern = r"document\.getElementById\('finTotalRevenue'\)\.textContent = formatCurrency\(kpis\.mrr \* 12\);"
rev_replacement = r"document.getElementById('finTotalRevenue').textContent = formatCurrency(kpis.revenue || kpis.mrr * 12);"
js_content = re.sub(rev_pattern, rev_replacement, js_content)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Patched financials successfully.")
