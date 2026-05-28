import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\financials.js'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. applyFinancialFilter
c = c.replace(
    "const val = parseInt(document.getElementById('finGlobalFilter').value) || 6;",
    "const filterEl = document.getElementById('finGlobalFilter');\n  const val = filterEl ? (parseInt(filterEl.value) || 6) : 6;"
)

# 2. runProfitPredictorUI
c = c.replace(
    "const rd = parseFloat(document.getElementById('profitRD').value) || 100000;",
    "const rdEl = document.getElementById('profitRD');\n    const rd = rdEl ? (parseFloat(rdEl.value) || 100000) : 100000;"
)
c = c.replace(
    "const admin = parseFloat(document.getElementById('profitAdmin').value) || 120000;",
    "const adminEl = document.getElementById('profitAdmin');\n    const admin = adminEl ? (parseFloat(adminEl.value) || 120000) : 120000;"
)
c = c.replace(
    "const mkt = parseFloat(document.getElementById('profitMarketing').value) || 300000;",
    "const mktEl = document.getElementById('profitMarketing');\n    const mkt = mktEl ? (parseFloat(mktEl.value) || 300000) : 300000;"
)

# 3. style updates
c = c.replace(
    "resultDiv.style.display = 'block';",
    "if (resultDiv) resultDiv.style.display = 'block';"
)

c = c.replace(
    "invEl.style.color = readiness.color;",
    "if (invEl) invEl.style.color = readiness.color;"
)

# 4. Safe init wrap
# The user wants window.initFinancialsPage to be wrapped in try/catch safely
# Currently it looks like: window.initFinancialsPage = async function() { ... }
# I will rename the core function and wrap it.

c = c.replace("window.initFinancialsPage = async function() {", "async function _coreInitFinancials() {")
wrapper = """window.initFinancialsPage = async function () {
   try {
      console.log("Financials Safe Init");
      await _coreInitFinancials();
   } catch(err) {
      console.error("Financials failed safely", err);
   }
};"""

# I need to insert the wrapper before _coreInitFinancials
c = c.replace("async function _coreInitFinancials() {", wrapper + "\n\nasync function _coreInitFinancials() {")


with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Safeguarded financials.js value and style access.")
