import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "document.addEventListener(\"DOMContentLoaded\", () => {\n    loadFinancials();\n});",
    "document.addEventListener(\"DOMContentLoaded\", () => {\n    loadFinancials();\n    if (window.location.hash === '#/financials') initFinancialsPage();\n});"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Added DOMContentLoaded logic.")
