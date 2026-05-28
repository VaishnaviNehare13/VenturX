import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Lines 29-33 manual replace
replacements = [
    (r"document\.getElementById\('finTotalRevenue'\)\.textContent = formatCurrency\(kpis\.revenue \|\| kpis\.mrr \* 12\);",
     "const el1 = document.getElementById('finTotalRevenue'); if (el1) el1.textContent = formatCurrency(kpis.revenue || kpis.mrr * 12);"),
    (r"document\.getElementById\('finTotalExpenses'\)\.textContent = formatCurrency\(kpis\.expenses\);",
     "const el2 = document.getElementById('finTotalExpenses'); if (el2) el2.textContent = formatCurrency(kpis.expenses);"),
    (r"document\.getElementById\('finNetProfit'\)\.textContent = formatCurrency\(kpis\.profit\);",
     "const el3 = document.getElementById('finNetProfit'); if (el3) el3.textContent = formatCurrency(kpis.profit);"),
    (r"document\.getElementById\('finBurnRate'\)\.textContent = kpis\.burnRate > 0 \? formatCurrency\(kpis\.burnRate\) : '₹0';",
     "const el4 = document.getElementById('finBurnRate'); if (el4) el4.textContent = kpis.burnRate > 0 ? formatCurrency(kpis.burnRate) : '₹0';"),
    (r"document\.getElementById\('finMRR'\)\.textContent = formatCurrency\(kpis\.mrr\);",
     "const el5 = document.getElementById('finMRR'); if (el5) el5.textContent = formatCurrency(kpis.mrr);")
]

for pat, rep in replacements:
    c = re.sub(pat, rep, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Safeguarded financials.js DOM assignments.")
