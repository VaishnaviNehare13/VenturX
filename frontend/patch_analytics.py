import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\analytics.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace LIVE MONGO CHART DATA with safe fallback
pattern = r'console\.log\("LIVE MONGO CHART DATA:", window\.LiveMongoPayload\);'
replace = """console.log("LIVE MONGO CHART DATA:", window.LiveMongoPayload);
  
  let chartData = window.LiveMongoPayload?.charts || window.LiveMongoPayload?.analytics || window.LiveMongoPayload?.metrics || [];
  if (!Array.isArray(chartData)) {
      chartData = [];
  }"""
c = re.sub(pattern, replace, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched analytics.js with safe chartData.")
