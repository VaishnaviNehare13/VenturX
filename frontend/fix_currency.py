import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace formatCurrency
content = re.sub(
    r"function formatCurrency\(num\) \{\s*return '[\?\$]' \+ num\.toLocaleString\(['\"]en-[A-Z]+['\"]\);\s*\}",
    "function formatCurrency(num) {\n  return '₹' + Number(num || 0).toLocaleString('en-IN');\n}",
    content
)
content = re.sub(
    r"function formatCurrency\(num\) \{\s*return '[\?\$]' \+ num\.toLocaleString\(\);\s*\}",
    "function formatCurrency(num) {\n  return '₹' + Number(num || 0).toLocaleString('en-IN');\n}",
    content
)

# Replace specific template literals
content = content.replace(
    r"$${(data.total_revenue || 0).toLocaleString()}",
    r"₹${Number(data.total_revenue || 0).toLocaleString('en-IN')}"
)

content = content.replace(
    r"$${(q.impact || 0).toLocaleString()}",
    r"₹${Number(q.impact || 0).toLocaleString('en-IN')}"
)

content = content.replace(
    r"$${totalRevenue.toLocaleString()}",
    r"₹${Number(totalRevenue || 0).toLocaleString('en-IN')}"
)

# Also check for any general $${...toLocaleString()}
# Let's just do it dynamically in case they vary slightly
content = re.sub(
    r"\$\$\{\s*(.*?)\.toLocaleString\(\)\s*\}",
    r"₹${Number(\1 || 0).toLocaleString('en-IN')}",
    content
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Currency formatting fixed.")
