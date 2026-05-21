import sys
import re

base_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/"

# 1. crm.js
crm_path = base_path + "crm.js"
with open(crm_path, "r", encoding="utf-8") as f:
    crm = f.read()

crm_orig = """    saasCustomers.push(newCustomer);
    saveCustomers();
    closeModal('customerModal');"""
crm_new = """    saasCustomers.push(newCustomer);
    saveCustomers();
    if (window.PlatformDataEngine) window.PlatformDataEngine.addCustomer(newCustomer);
    closeModal('customerModal');"""
crm = crm.replace(crm_orig, crm_new)

crm_orig2 = """    saasCustomers[idx] = updated;
    saveCustomers();
    closeModal('customerModal');"""
crm_new2 = """    saasCustomers[idx] = updated;
    saveCustomers();
    if (window.PlatformDataEngine) window.PlatformDataEngine.pushNotification('🔄', `Customer ${updated.companyName} updated.`, 'crm');
    closeModal('customerModal');"""
crm = crm.replace(crm_orig2, crm_new2)

with open(crm_path, "w", encoding="utf-8") as f:
    f.write(crm)

# 2. marketing.js
mkt_path = base_path + "marketing.js"
with open(mkt_path, "r", encoding="utf-8") as f:
    mkt = f.read()

mkt_orig = """    campaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));"""
mkt_new = """    campaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    if (window.PlatformDataEngine) window.PlatformDataEngine.addCampaign(newCampaign);"""
mkt = mkt.replace(mkt_orig, mkt_new)

with open(mkt_path, "w", encoding="utf-8") as f:
    f.write(mkt)

# 3. branding.js
brnd_path = base_path + "branding.js"
with open(brnd_path, "r", encoding="utf-8") as f:
    brnd = f.read()

brnd_orig = """    localStorage.setItem('latestBrand', JSON.stringify(brand));"""
brnd_new = """    localStorage.setItem('latestBrand', JSON.stringify(brand));
    if (window.PlatformDataEngine) window.PlatformDataEngine.addBrand(brand);"""
brnd = brnd.replace(brnd_orig, brnd_new)

with open(brnd_path, "w", encoding="utf-8") as f:
    f.write(brnd)

# 4. content.js
cnt_path = base_path + "content.js"
with open(cnt_path, "r", encoding="utf-8") as f:
    cnt = f.read()

cnt_orig = """      window.Router.navigate('#/content');"""
cnt_new = """      if (window.PlatformDataEngine) window.PlatformDataEngine.addAiUsage('content', 2000);
      window.Router.navigate('#/content');"""
cnt = cnt.replace(cnt_orig, cnt_new)

with open(cnt_path, "w", encoding="utf-8") as f:
    f.write(cnt)

# 5. forecasting.js
frc_path = base_path + "forecasting.js"
with open(frc_path, "r", encoding="utf-8") as f:
    frc = f.read()

frc_orig = """      renderForecastMetrics(data.forecast);
      initForecastingChart(data.forecast.monthly_forecast);"""
frc_new = """      renderForecastMetrics(data.forecast);
      initForecastingChart(data.forecast.monthly_forecast);
      if (window.PlatformDataEngine) window.PlatformDataEngine.addForecast(data.forecast);"""
frc = frc.replace(frc_orig, frc_new)

with open(frc_path, "w", encoding="utf-8") as f:
    f.write(frc)

# 6. segmentation.js
seg_path = base_path + "segmentation.js"
with open(seg_path, "r", encoding="utf-8") as f:
    seg = f.read()

seg_orig = """      updateKPIs(data);
      initSegmentsChart(data.cluster_sizes);"""
seg_new = """      updateKPIs(data);
      initSegmentsChart(data.cluster_sizes);
      if (window.PlatformDataEngine) window.PlatformDataEngine.addSegmentation(data);"""
seg = seg.replace(seg_orig, seg_new)

with open(seg_path, "w", encoding="utf-8") as f:
    f.write(seg)

print("Updated producers with PlatformDataEngine hooks.")
