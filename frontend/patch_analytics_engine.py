import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\analyticsEngine.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the broken line 48:
# const aiUsage = pde.getData().(aiUsage || []).filter(a => a.module === 'content');
c = c.replace(
    "const aiUsage = pde.getData().(aiUsage || []).filter",
    "const aiUsage = (pde.getData().aiUsage || []).filter"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed analyticsEngine.js syntax error.")
