filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function formatCurrency(num)" in line:
        lines[i+1] = "  return '₹' + Number(num || 0).toLocaleString('en-IN');\n"
    if "data.total_revenue" in line and "$" in line:
        lines[i] = line.replace("$${(data.total_revenue || 0).toLocaleString()}", "₹${Number(data.total_revenue || 0).toLocaleString('en-IN')}")
    if "q.impact" in line and "$" in line:
        lines[i] = line.replace("$${(q.impact || 0).toLocaleString()}", "₹${Number(q.impact || 0).toLocaleString('en-IN')}")
    if "totalRevenue" in line and "$" in line:
        lines[i] = line.replace("$${totalRevenue.toLocaleString()}", "₹${Number(totalRevenue || 0).toLocaleString('en-IN')}")

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Forced fixed currency.")
