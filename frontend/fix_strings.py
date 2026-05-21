import sys

file_path = 'src/js/segmentation.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\`', '`')
content = content.replace(r'\${', '${')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Successfully replaced escaped template literals.')
