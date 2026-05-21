import sys

file_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/app.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove let financialsChartInstance
content = content.replace("let financialsChartInstance = null;\n", "")

# Remove cleanup block
cleanup_block = """  // Cleanup charts if leaving financials
  if (hash !== '#/financials') {
    if (financialsChartInstance) { financialsChartInstance.destroy(); financialsChartInstance = null; }
  }
"""
content = content.replace(cleanup_block, "")

# Remove init block
init_block = """  if (hash === '#/financials') {
    initFinancialsCharts();
    // Add download handler
    const btn = document.getElementById('downloadReport');
    if (btn) {
      btn.addEventListener('click', () => window.print());
    }
  }
"""
content = content.replace(init_block, "")

# Remove initFinancialsCharts function block
fn_start = content.find("function initFinancialsCharts() {")
fn_end = content.find("// Theme handling")
if fn_start != -1 and fn_end != -1:
    content = content[:fn_start] + content[fn_end:]

# Clean up theme handler that might have reference
theme_handler_orig = """  [financialsChartInstance].forEach(chart => {"""
theme_handler_new = """  [].forEach(chart => {"""
content = content.replace(theme_handler_orig, theme_handler_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated app.js")
