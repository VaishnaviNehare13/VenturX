import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace chartDatasets logic
old_charts = r"    if \(data\.revenue_growth\).*?chartDatasets\.aiMetrics\.data = data\.ai_metrics;"
new_charts = """    if (data.growth_chart || data.revenue_growth) chartDatasets.revenue.data = data.growth_chart || data.revenue_growth;
    if (data.client_growth) chartDatasets.growth.data = data.client_growth;
    if (data.ai_metrics || data.prediction_score) chartDatasets.aiMetrics.data = data.ai_metrics || [data.prediction_score];"""

content = re.sub(old_charts, new_charts, content, flags=re.DOTALL)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("chartDatasets logic in dashboard.js patched successfully.")
