import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\app.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

pattern = r"const response = await fetch\(`http://127\.0\.0\.1:5000/api/user-dashboard/\$\{session\.email\}`\);\s*const json = await response\.json\(\);\s*if \(json\.success\) \{\s*window\.LiveMongoPayload = json;\s*window\.LiveMongoDashboard = json\.dashboard;\s*window\.PlatformData = json; // Ensure legacy modules like crm\.js use live data\s*\}"

replacement = """const endpoint = `http://127.0.0.1:5000/api/users/${session.email}`;
          console.log("Active dashboard API:", endpoint);
          const response = await fetch(endpoint);
          const json = await response.json();
          if (json.success) {
              window.LiveMongoPayload = json;
              window.PlatformData = json; // Ensure legacy modules like crm.js use live data
          }"""

c = re.sub(pattern, replacement, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched app.js for /api/users")
