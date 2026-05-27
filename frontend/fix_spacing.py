import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\admin.css"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(600, len(lines)):
    # If the line has ' a d m i n ' or similar, we apply the regex
    # Actually, it's safe to just apply it to any line that has spaces between characters like this
    # We can detect it if the line has many single spaces between word characters
    if re.search(r"[a-z] [a-z] [a-z]", lines[i]):
        lines[i] = re.sub(r"(?<=[^\s]) (?=[^\s])", "", lines[i])

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Spacing fixed!")
