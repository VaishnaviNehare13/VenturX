import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\router.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the block of if (hash === '#/xxx') with try/catch wrapped versions
replacements = {
    r"if \(hash === '#/segmentation' && window\.initializeSegmentation\) window\.initializeSegmentation\(\);": 
        "try { if (hash === '#/segmentation' && window.initializeSegmentation) window.initializeSegmentation(); } catch(err) { console.error('Segmentation failed safely:', err); }",
    r"if \(hash === '#/dashboard' && window\.initDashboardPage\) window\.initDashboardPage\(\);":
        "try { if (hash === '#/dashboard' && window.initDashboardPage) window.initDashboardPage(); } catch(err) { console.error('Dashboard failed safely:', err); }",
    r"if \(hash === '#/forecasting' && window\.initializeForecasting\) window\.initializeForecasting\(\);":
        "try { if (hash === '#/forecasting' && window.initializeForecasting) window.initializeForecasting(); } catch(err) { console.error('Forecasting failed safely:', err); }",
    r"if \(hash === '#/marketing' && window\.initMarketingPage\) window\.initMarketingPage\(\);":
        "try { if (hash === '#/marketing' && window.initMarketingPage) window.initMarketingPage(); } catch(err) { console.error('Marketing failed safely:', err); }",
    r"if \(hash === '#/crm' && window\.initCRMPage\) window\.initCRMPage\(\);":
        "try { if (hash === '#/crm' && window.initCRMPage) window.initCRMPage(); } catch(err) { console.error('CRM failed safely:', err); }",
    r"if \(hash === '#/analytics'\) \{\s*if \(window\.destroyAnalyticsCharts\) window\.destroyAnalyticsCharts\(\);\s*if \(window\.initAnalyticsPage\) window\.initAnalyticsPage\(\);\s*\}":
        "try { if (hash === '#/analytics') { if (window.destroyAnalyticsCharts) window.destroyAnalyticsCharts(); if (window.initAnalyticsPage) window.initAnalyticsPage(); } } catch(err) { console.error('Analytics failed safely:', err); }",
    r"if \(hash === '#/financials'\) \{\s*if \(window\.destroyFinancialCharts\) window\.destroyFinancialCharts\(\);\s*if \(window\.initFinancialsPage\) window\.initFinancialsPage\(\);\s*\}":
        "try { if (hash === '#/financials') { if (window.destroyFinancialCharts) window.destroyFinancialCharts(); if (window.initFinancialsPage) window.initFinancialsPage(); } } catch(err) { console.error('Financials failed safely:', err); }"
}

for pat, repl in replacements.items():
    c = re.sub(pat, repl, c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched router.js")
