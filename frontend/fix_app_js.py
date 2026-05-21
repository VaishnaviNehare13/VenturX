import sys

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/app.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace block from `let analyticsChartInstance = null;` to `let financialsChartInstance = null;`
content = content.replace("let analyticsChartInstance = null;\nlet sourcesChartInstance = null;\nlet financialsChartInstance = null;", "let financialsChartInstance = null;")

# Remove the cleanup logic for analytics
content = content.replace("""  // Cleanup charts if leaving analytics
  if (hash !== '#/analytics') {
    if (analyticsChartInstance) { analyticsChartInstance.destroy(); analyticsChartInstance = null; }
    if (sourcesChartInstance) { sourcesChartInstance.destroy(); sourcesChartInstance = null; }
  }
""", "")

# Remove the initialization call
content = content.replace("""  if (hash === '#/analytics') {
    initAnalyticsCharts();
  }
""", "")

# Remove the initAnalyticsCharts function completely
init_fn_start = content.find("function initAnalyticsCharts() {")
init_fn_end = content.find("function initFinancialsCharts() {")
if init_fn_start != -1 and init_fn_end != -1:
    content = content[:init_fn_start] + content[init_fn_end:]

# Update theme handler
theme_handler_orig = """  [analyticsChartInstance, sourcesChartInstance, financialsChartInstance].forEach(chart => {"""
theme_handler_new = """  [financialsChartInstance].forEach(chart => {"""
content = content.replace(theme_handler_orig, theme_handler_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated app.js")
