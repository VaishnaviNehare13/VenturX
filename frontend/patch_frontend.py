import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: revenueCard.onclick
content = re.sub(
    r"(\s*)(revenueCard\.onclick = \(\) => {)",
    r"\1if (revenueCard) {\2",
    content
)
# Close the if block. This is tricky because we need to find the end of the arrow function. 
# We'll just replace the whole block since it's short, or we can use regex to match the body.
# Wait, let's just use string replacement if possible.
