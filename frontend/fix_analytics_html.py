import sys

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/analytics.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace updateForecast() with updateForecastAnalytics()
content = content.replace('onchange="updateForecast()"', 'onchange="updateForecastAnalytics()"')

# Find the start of the script tag and remove it to the end
script_index = content.find("<script>")
if script_index != -1:
    content = content[:script_index]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated analytics.html")
