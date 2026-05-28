import re

base_dir = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js'
import os

# CRM.JS
crm_path = os.path.join(base_dir, 'crm.js')
if os.path.exists(crm_path):
    with open(crm_path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Inject default arrays
    if 'customers = customers || [];' not in c:
        # Find where function renderCRMTable or initCRMPage starts
        c = re.sub(r'window\.initCRMPage = async function\(\) \{', r'window.initCRMPage = async function() {\n  let customers = [];\n  let leads = [];\n  let activities = [];', c)
        
    # Inject empty state UI
    # If there's a tbody or list where CRM customers are rendered, we want to show 'No CRM leads yet' if empty.
    # Actually, the user says "If collections are empty: show friendly fallback text instead of crashing."
    # Let's search for the table body rendering in crm.js.
    table_pattern = r'(const tbody = document\.getElementById\([\'"]crmTableBody[\'"]\);?[\s\S]*?)((?:\(customers \|\| \[\]\))\.forEach)'
    table_replace = r'\1\n  if ((customers || []).length === 0) { if (tbody) tbody.innerHTML = "<tr><td colspan=\'5\' style=\'text-align:center;padding:20px;\'>No CRM leads yet</td></tr>"; } else \2'
    c = re.sub(table_pattern, table_replace, c)

    with open(crm_path, 'w', encoding='utf-8') as f:
        f.write(c)

# SEGMENTATION.JS
seg_path = os.path.join(base_dir, 'segmentation.js')
if os.path.exists(seg_path):
    with open(seg_path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Inject empty state UI
    # "No segmentation data yet"
    table_pattern = r'(const list = document\.getElementById\([\'"]segList[\'"]\);?[\s\S]*?)((?:\(segments \|\| \[\]\))\.forEach)'
    table_replace = r'\1\n  if ((segments || []).length === 0) { if (list) list.innerHTML = "<div style=\'text-align:center;padding:20px;\'>No segmentation data yet</div>"; } else \2'
    c = re.sub(table_pattern, table_replace, c)
    
    with open(seg_path, 'w', encoding='utf-8') as f:
        f.write(c)

# MARKETING.JS
mkt_path = os.path.join(base_dir, 'marketing.js')
if os.path.exists(mkt_path):
    with open(mkt_path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Inject empty state UI
    list_pattern = r'(const container = document\.getElementById\([\'"]campaignsList[\'"]\);?[\s\S]*?)((?:\(campaigns \|\| \[\]\))\.forEach)'
    list_replace = r'\1\n  if ((campaigns || []).length === 0) { if (container) container.innerHTML = "<div style=\'text-align:center;padding:20px;\'>No active campaigns</div>"; } else \2'
    c = re.sub(list_pattern, list_replace, c)
    
    with open(mkt_path, 'w', encoding='utf-8') as f:
        f.write(c)

# FINANCIALS.JS
fin_path = os.path.join(base_dir, 'financials.js')
if os.path.exists(fin_path):
    with open(fin_path, 'r', encoding='utf-8') as f:
        c = f.read()
    
    list_pattern = r'(const list = document\.getElementById\([\'"]finInsightsList[\'"]\);?[\s\S]*?)(list\.innerHTML = )'
    list_replace = r'\1\n  if ((insights || []).length === 0) { if (list) list.innerHTML = "<li style=\'text-align:center;padding:20px;list-style:none;\'>No financial data yet</li>"; } else \2'
    c = re.sub(list_pattern, list_replace, c)
    
    with open(fin_path, 'w', encoding='utf-8') as f:
        f.write(c)

print("Applied UI fallback logic.")
