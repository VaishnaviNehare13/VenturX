import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# We want to replace the `saveUserAnalytics` body where it uses previousElementSibling
pattern = r"const revEl = document\.querySelector\('#kpi-detail-revenue'\)\.previousElementSibling\.querySelector\('\.anim-counter'\);.*?const roiEl = document\.querySelector\('#kpi-detail-roi'\)\.previousElementSibling\.querySelector\('\.anim-counter'\);"

replacement = """const revEl = document.querySelector('#kpi-detail-revenue')?.previousElementSibling?.querySelector('.anim-counter');
        const subsEl = document.querySelector('#kpi-detail-subs')?.previousElementSibling?.querySelector('.anim-counter');
        const aiEl = document.querySelector('#kpi-detail-ai')?.previousElementSibling?.querySelector('.anim-counter');
        const roiEl = document.querySelector('#kpi-detail-roi')?.previousElementSibling?.querySelector('.anim-counter');"""

c = re.sub(pattern, replacement, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched dashboard.js saveUserAnalytics")
