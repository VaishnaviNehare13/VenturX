import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

injection = """
      window.PlatformEngine.savePlatformData("financials");

      // SAVE TO MONGODB
      const financialPayload = {
          user_email: window.activeSession?.email || "founder@startup.com",
          total_revenue: kpis.mrr * 12,
          mrr: kpis.mrr,
          total_expenses: kpis.expenses,
          net_profit: kpis.profit,
          burn_rate: kpis.burnRate,
          investor_readiness: readiness,
          rd_spend: rd,
          administration_cost: admin,
          marketing_spend: mkt,
          predicted_profit: res.predicted_profit
      };

      console.log("SAVING FINANCIALS:", financialPayload);

      try {
          const saveResponse = await window.apiRequest(
              '/api/financials/save',
              {
                  method: 'POST',
                  body: JSON.stringify(financialPayload)
              }
          );
          console.log("FINANCIAL SAVE RESPONSE:", saveResponse);
      } catch (err) {
          console.error("FINANCIAL API ERROR:", err);
      }
"""

c = c.replace('window.PlatformEngine.savePlatformData("financials");', injection)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched financials.js save logic")
