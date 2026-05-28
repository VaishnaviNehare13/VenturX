import re

path1 = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\analyticsEngine.js'
with open(path1, 'r', encoding='utf-8') as f:
    c1 = f.read()

# Replace getForecastingData catch logic
pat_forecast = r'catch \(e\) \{\s*console\.warn\("Forecast API failed.*", e\);\s*\}\s*return null;'
rep_forecast = 'catch (e) {\n   console.warn("Forecast API failed safely", e);\n  }\n  return [];'
c1 = re.sub(pat_forecast, rep_forecast, c1)

with open(path1, 'w', encoding='utf-8') as f:
    f.write(c1)

path2 = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\analytics.js'
with open(path2, 'r', encoding='utf-8') as f:
    c2 = f.read()

# Replace fetch analytics overview
pat_fetch = r'(const response = await fetch\(\'http://127\.0\.0\.1:5000/api/analytics/overview\'\);)'
rep_fetch = r'\1\n        if (!response.ok) { throw new Error("API failed"); }'
if 'if (!response.ok)' not in c2:
    c2 = re.sub(pat_fetch, rep_fetch, c2)

# Make sure analytics safe state is called. The user says:
# "If forecast API unavailable: show empty analytics state. DO NOT crash app."
# We already added an empty state function `showAnalyticsEmptyState` earlier.
# Where is forecast loaded? `loadAndInitForecast()`
pat_load = r'(data = await AnalyticsEngine\.getForecastingData\(\);\s*if \(\!data\))'
rep_load = r'data = await AnalyticsEngine.getForecastingData();\n     if (!data || data.length === 0)'
c2 = re.sub(pat_load, rep_load, c2)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(c2)

print("Forecast and Analytics APIs safeguarded.")
