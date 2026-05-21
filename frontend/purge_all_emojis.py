import os
import subprocess
import sys

# Install emoji library temporarily if not present
try:
    import emoji
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "emoji"])
    import emoji

frontend_dir = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend"

# We map a few left-over specific ones if we want, else we just remove
custom_map = {
    "📢": '<i data-lucide="megaphone" class="icon-sm text-blue-500"></i>',
    "✅": '<span class="status-dot healthy"></span>',
    "❌": '<span class="status-dot error"></span>',
    "⚠️": '<span class="status-dot warning"></span>',
    "⏳": '<span class="status-dot warning"></span>'
}

def remove_emojis(text):
    for k, v in custom_map.items():
        text = text.replace(k, v)
        
    # Replace the rest with empty string
    return emoji.replace_emoji(text, replace='')

for root, dirs, files in os.walk(frontend_dir):
    if "node_modules" in root: continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig = content
            content = remove_emojis(content)
            
            # Clean up double spaces caused by emoji removal
            content = content.replace("  ", " ")
            content = content.replace("> <", "><")
            
            if orig != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Stripped emojis from {filepath}")

print("All remaining emojis purged.")
