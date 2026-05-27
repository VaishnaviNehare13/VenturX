import re
import os

files_to_check = [
    r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js",
    r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        # We look for simple DOM assignments like:
        # someElement.innerHTML = `...`
        # and wrap them if they aren't already safely accessed.
        # But wait, python ast is for python. Let's do simple regex for known failure points if any.
        
        # In JS, if the line starts with a variable name then .innerHTML, e.g. "container.innerHTML ="
        match = re.search(r'^\s*([a-zA-Z0-9_]+)\.innerHTML\s*=', line)
        if match:
            var_name = match.group(1)
            # Check if previous lines have if(var_name)
            safe = False
            for j in range(max(0, i-5), i):
                if f"if ({var_name})" in lines[j] or f"if({var_name})" in lines[j] or f"if ({var_name} " in lines[j]:
                    safe = True
                    break
            
            # If not safe, let's wrap just this line if it's a single line assignment,
            # but usually it's multi-line template literal. 
            # It's safer to just prepend `if (var_name) {` and let the formatter/parser figure it out? No, that breaks JS.
            # Alternatively, rewrite `var_name.innerHTML =` to `if (var_name) var_name.innerHTML =`
            # Wait, if it's `var_name.innerHTML = \``, the string spans multiple lines.
            # But the left side `var_name.innerHTML =` is all on one line.
            if not safe:
                # Replace "var_name.innerHTML" with "if (var_name) var_name.innerHTML"
                lines[i] = line.replace(f"{var_name}.innerHTML", f"if ({var_name}) {var_name}.innerHTML")

    with open(filepath, "w", encoding="utf-8") as f:
        f.writelines(lines)

print("Frontend innerHTML patched safely.")
