filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "return '?' + num.toLocaleString('en-IN');",
    "return '₹' + Number(num || 0).toLocaleString('en-IN');"
)
content = content.replace(
    "return '$' + num.toLocaleString();",
    "return '₹' + Number(num || 0).toLocaleString('en-IN');"
)

# And check for the other occurrences just in case the first script missed them.
# The user specifically mentioned:
# ₹${Number(revenue || 0).toLocaleString("en-IN")}
content = content.replace(
    r"₹${Number(data.total_revenue || 0).toLocaleString('en-IN')}",
    r"₹${Number(data.total_revenue || 0).toLocaleString('en-IN')}"
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Currency fixed again.")
