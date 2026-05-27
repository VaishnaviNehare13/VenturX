import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\admin.css"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Clean up spacing artifacts (e.g., " / *   I n t e r a c t i v e")
# The spacing artifact seems to be alternating spaces and characters for large blocks.
# Let's fix the specific block starting at line 612.
def fix_spaced_text(match):
    text = match.group(0)
    # Remove all spaces except where there are multiple spaces indicating actual words
    cleaned = re.sub(r' (.)', r'\1', text)
    return cleaned.replace('  ', ' ')

# Since the spacing artifact can be complex, I'll just use a regex to fix anything that looks like " . a d m i n -"
content = re.sub(r'(?: [a-zA-Z\-\/\*\{\}\:\;\(\)\,\.\#0-9]){10,}', lambda m: m.group(0).replace(' ', ''), content)
content = content.replace("/*InteractiveAnalyticsDashboardAdditions*/", "/* Interactive Analytics Dashboard Additions */")

# 2. Fix 100vw -> 100%
content = content.replace("width: 100vw;", "width: 100%;")
content = content.replace("width:100vw;", "width: 100%;")

# 3. Categorization logic
# We'll prepend comments to known key selectors
comments_map = {
    "body {": "/* --- Layout --- */\nbody {",
    ".admin-sidebar {": "/* --- Sidebar --- */\n.admin-sidebar {",
    ".admin-topbar {": "/* --- Topbar --- */\n.admin-topbar {",
    ".admin-card {": "/* --- Cards --- */\n.admin-card {",
    ".admin-table-container {": "/* --- Tables --- */\n.admin-table-container {",
    ".admin-chart-wrapper {": "/* --- Charts --- */\n.admin-chart-wrapper {",
    "@keyframes pulse-glow {": "/* --- Animations --- */\n@keyframes pulse-glow {",
    "@media (max-width:": "/* --- Responsive Utilities --- */\n@media (max-width:"
}

for k, v in comments_map.items():
    if k in content and v not in content:
        # Only replace the first occurrence to avoid messing up nested media queries
        content = content.replace(k, v, 1)

# 4. Overflow fixes
# If body has overflow-x: hidden and overflow: hidden, let's clean it.
content = re.sub(r"body\s*\{[^}]*\}", lambda m: re.sub(r"overflow(-[xy])?\s*:\s*[^;]+;\s*", "", m.group(0)), content)
# Ensure body doesn't overflow horizontally
content = content.replace("/* --- Layout --- */\nbody {", "/* --- Layout --- */\nbody {\n  overflow-x: hidden;\n  width: 100%;\n")

# Same for .admin-layout
content = re.sub(r"\.admin-layout\s*\{[^}]*\}", lambda m: re.sub(r"overflow(-[xy])?\s*:\s*[^;]+;\s*", "", m.group(0)), content)
content = content.replace(".admin-layout {", ".admin-layout {\n  width: 100%;\n  overflow-x: hidden;\n")

# Remove duplicate properties inside selectors
def remove_duplicates(match):
    block = match.group(0)
    lines = block.split("\n")
    seen_props = set()
    new_lines = []
    # Reverse so last property takes precedence
    for line in reversed(lines):
        prop_match = re.match(r"^\s*([a-zA-Z-]+)\s*:", line)
        if prop_match:
            prop = prop_match.group(1)
            if prop in seen_props:
                continue
            seen_props.add(prop)
        new_lines.append(line)
    return "\n".join(reversed(new_lines))

# We will apply deduplication on all blocks
content = re.sub(r"\{([^}]+)\}", remove_duplicates, content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("CSS Refactored successfully.")
