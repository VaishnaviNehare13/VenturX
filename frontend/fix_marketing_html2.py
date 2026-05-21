import sys
import re

file_path = 'c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/pages/marketing.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will extract the blocks manually since they are clearly marked.
header_start = content.find('<div class="page-header">')
header_end = content.find('<!-- AI Campaign Prediction Panel -->')
header_block = content[header_start:header_end].strip()

pred_start = content.find('<!-- AI Campaign Prediction Panel -->')
pred_end = content.find('<div id="marketingResultsSection"')
pred_block = content[pred_start:pred_end].strip()

# Find where marketingResultsSection actually starts and strip it out later
kpis_start = content.find('<!-- AI Marketing KPIs -->')
kpis_end = content.find('<div class="grid two">')
kpis_block = content[kpis_start:kpis_end].strip()

charts_start = content.find('<div class="grid two">')
charts_end = content.find('<!-- Active Campaigns Section -->')
charts_block = content[charts_start:charts_end].strip()

campaigns_start = content.find('<!-- Active Campaigns Section -->')
campaigns_end = content.find('<!-- New Campaign Modal -->')
campaigns_block = content[campaigns_start:campaigns_end].strip()

# Clean up trailing divs from the previous wrapper
campaigns_block = re.sub(r'</div>\s*</div>\s*$', '</div>', campaigns_block)
campaigns_block = re.sub(r'</div>\s*</div>\s*$', '</div>', campaigns_block)
campaigns_block = re.sub(r'</div>\s*</div>\s*$', '</div>', campaigns_block)

modals_start = content.find('<!-- New Campaign Modal -->')
modals_block = content[modals_start:].strip()

# Construct new HTML
new_html = f'''{header_block}

<div id="marketingDashboard">

    <!-- KPI CARDS -->
    <section id="marketingKPIs" style="display:block; visibility:visible; opacity:1;">
{kpis_block}
    </section>

    <!-- CHARTS -->
    <section id="marketingCharts" style="display:block; visibility:visible; opacity:1;">
{charts_block}
    </section>

    <!-- ACTIVE CAMPAIGNS -->
    <section id="activeCampaigns" style="display:block; visibility:visible; opacity:1;">
{campaigns_block}
    </section>

    <!-- AI PREDICTOR -->
    <section id="campaignPredictor">
{pred_block}
    </section>

</div>

{modals_block}
'''

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Rewrite complete')
