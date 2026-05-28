import re
import os

db_path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\dashboard.js'

with open(db_path, 'r', encoding='utf-8') as f:
    c = f.read()

# In dashboard.js, look for window.LiveMongoDashboard = data; or similar
# Let's see what it actually is:
pattern = r'(window\.LiveMongoDashboard\s*=\s*)([a-zA-Z0-9_\.]+|json);?'
replace = r"""\1{
      ...(\2 || {}),
      financials: (\2 && \2.financials) || [],
      crm: (\2 && \2.crm) || [],
      customers: (\2 && \2.customers) || [],
      leads: (\2 && \2.leads) || [],
      campaigns: (\2 && \2.campaigns) || [],
      analytics: (\2 && \2.analytics) || {},
      metrics: (\2 && \2.metrics) || {},
      recommendations: (\2 && \2.recommendations) || [],
      segments: (\2 && \2.segments) || [],
      reports: (\2 && \2.reports) || [],
      growth_chart: (\2 && \2.growth_chart) || [],
      ai_insights: (\2 && \2.ai_insights) || [],
      subscriptions: (\2 && \2.subscriptions) || []
    };"""

if 'window.LiveMongoDashboard' in c:
    c = re.sub(pattern, replace, c, count=1)
    
with open(db_path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Applied global default payload wrappers to LiveMongoDashboard.")
