import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "valueDiv.textContent = '₹' + Math.round(res.predicted_profit).toLocaleString('en-IN');",
    "if (valueDiv) valueDiv.textContent = '₹' + Math.round(res.predicted_profit).toLocaleString('en-IN');"
)
c = c.replace(
    "textDiv.innerHTML = `Model: ${res.model}<br>R² Score: ${res.r2_score || 0.978}`;",
    "if (textDiv) textDiv.innerHTML = `Model: ${res.model}<br>R² Score: ${res.r2_score || 0.978}`;"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
