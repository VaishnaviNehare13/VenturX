import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\login.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add email validation
pat = r"(const email = emailInput\.value\.trim\(\);\s*const password = passwordInput\.value;[\s\S]*?if\(\!email \|\| \!password\))"
rep = r"const email = emailInput.value.trim();\n        const password = passwordInput.value;\n        \n        if (!email.includes('@')) {\n            loginInProgress = false;\n            return alert('Please enter a valid email address');\n        }\n\n        if(!email || !password)"

c = re.sub(pat, rep, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Added frontend email validation to login.js")
