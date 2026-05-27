filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific else blocks
replacements = [
    """    } else {
      console.warn("Missing Overview Element: card-revenue");
    }""",
    """    }""",
    """    } else {
      console.warn("Missing Overview Element: card-users");
    }""",
    """    }""",
    """    } else {
      console.warn("Missing Overview Element: card-workspaces");
    }""",
    """    }""",
    """    } else {
      console.warn("Missing Overview Element: card-health");
    }""",
    """    }"""
]

# Manual replace
content = content.replace(replacements[0], replacements[1])
content = content.replace(replacements[2], replacements[3])
content = content.replace(replacements[4], replacements[5])
content = content.replace(replacements[6], replacements[7])

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Warnings removed.")
