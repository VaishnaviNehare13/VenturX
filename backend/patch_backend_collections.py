import re

# Patch db.py
db_filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\db.py"
with open(db_filepath, "r", encoding="utf-8") as f:
    db_content = f.read()

if "user_analytics_collection =" not in db_content:
    db_content = db_content.replace('dashboard_collection = db["dashboard"]', 'dashboard_collection = db["dashboard"]\nuser_analytics_collection = db["user_analytics"]')
    with open(db_filepath, "w", encoding="utf-8") as f:
        f.write(db_content)

# Patch models_api.py
models_filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\backend\models_api.py"
with open(models_filepath, "r", encoding="utf-8") as f:
    models_content = f.read()

if "user_analytics_collection" not in models_content.split("from db import")[1].split(")")[0]:
    models_content = models_content.replace(
        'analytics_collection,', 
        'analytics_collection,\n    user_analytics_collection,'
    )
    with open(models_filepath, "w", encoding="utf-8") as f:
        f.write(models_content)

print("Collections patched successfully.")
