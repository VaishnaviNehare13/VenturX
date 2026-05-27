import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\admin.css"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Remove specific obsolete animations
obsolete_blocks = [
    r"@keyframes pulse-fast\s*\{[^}]*\}",
    r"@keyframes pulse-slow\s*\{[^}]*\}",
    r"\.admin-pulse-fast\s*\{[^}]*\}",
    r"\.admin-pulse-slow\s*\{[^}]*\}",
    r"\.sync-pulse\s*\{[^}]*\}",
    r"@keyframes syncFlash\s*\{[^}]*\}",
    r"@keyframes scrollUp\s*\{[^}]*\}"
]

for block_regex in obsolete_blocks:
    content = re.sub(block_regex, "", content)

# Remove any empty lines resulting from deletion
content = re.sub(r'\n\s*\n', '\n\n', content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Obsolete CSS removed.")
