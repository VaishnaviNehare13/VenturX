import sys

file_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pred_start = content.find('<!-- AI Campaign Prediction Panel -->')
modal_start = content.find('<!-- New Campaign Modal -->')

if pred_start == -1 or modal_start == -1:
    print('Could not find markers')
    sys.exit(1)

prediction_panel = content[pred_start:modal_start]

# Remove it from old location
content = content.replace(prediction_panel, '')

# Split at AI Marketing KPIs
kpi_marker = '<!-- AI Marketing KPIs -->'
parts = content.split(kpi_marker)

if len(parts) < 2:
    print('Could not find KPI marker')
    sys.exit(1)

part2 = parts[1]
modal_idx = part2.find('<!-- New Campaign Modal -->')

wrapped_part2 = '\n<div id="marketingResultsSection" style="display: none; opacity: 0; transition: opacity 0.5s ease;">\n' + kpi_marker + part2[:modal_idx] + '\n</div>\n\n' + part2[modal_idx:]

new_content = parts[0] + '\n' + prediction_panel + wrapped_part2

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
