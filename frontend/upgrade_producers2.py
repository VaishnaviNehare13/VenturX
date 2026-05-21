import sys

base_path = "c:/Users/Vaishnavi/Downloads/Startup-Management_Major-Final/Startup-Management_Major-main/frontend/src/js/"

# 1. crm.js
crm_path = base_path + "crm.js"
with open(crm_path, "r", encoding="utf-8") as f:
    crm = f.read()

# Replace old injection with new injection that updates PlatformData
old_crm_push = """    saasCustomers.push(newCustomer);
    saveCustomers();
    if (window.PlatformDataEngine) window.PlatformDataEngine.addCustomer(newCustomer);
    closeModal('customerModal');"""

new_crm_push = """    saasCustomers.push(newCustomer);
    saveCustomers();
    if (window.PlatformData && window.PlatformEngine) {
        window.PlatformData.crm.push(newCustomer);
        window.PlatformEngine.addNotification(`New customer ${newCustomer.companyName} added.`);
        window.PlatformEngine.savePlatformData();
    }
    closeModal('customerModal');"""
crm = crm.replace(old_crm_push, new_crm_push)

old_crm_push2 = """    saasCustomers[idx] = updated;
    saveCustomers();
    if (window.PlatformDataEngine) window.PlatformDataEngine.pushNotification('🔄', `Customer ${updated.companyName} updated.`, 'crm');
    closeModal('customerModal');"""

new_crm_push2 = """    saasCustomers[idx] = updated;
    saveCustomers();
    if (window.PlatformData && window.PlatformEngine) {
        const pIdx = window.PlatformData.crm.findIndex(c => c.id === updated.id);
        if (pIdx !== -1) window.PlatformData.crm[pIdx] = updated;
        window.PlatformEngine.addNotification(`Customer ${updated.companyName} updated.`);
        window.PlatformEngine.savePlatformData();
    }
    closeModal('customerModal');"""
crm = crm.replace(old_crm_push2, new_crm_push2)

with open(crm_path, "w", encoding="utf-8") as f:
    f.write(crm)

# 2. marketing.js
mkt_path = base_path + "marketing.js"
with open(mkt_path, "r", encoding="utf-8") as f:
    mkt = f.read()

old_mkt_push = """    campaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    if (window.PlatformDataEngine) window.PlatformDataEngine.addCampaign(newCampaign);"""

new_mkt_push = """    campaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    if (window.PlatformData && window.PlatformEngine) {
        window.PlatformData.campaigns.push(newCampaign);
        window.PlatformEngine.addNotification(`Campaign ${newCampaign.name} launched.`);
        window.PlatformEngine.savePlatformData();
    }"""
mkt = mkt.replace(old_mkt_push, new_mkt_push)

with open(mkt_path, "w", encoding="utf-8") as f:
    f.write(mkt)

# 3. branding.js
brnd_path = base_path + "branding.js"
with open(brnd_path, "r", encoding="utf-8") as f:
    brnd = f.read()

old_brnd_push = """    localStorage.setItem('latestBrand', JSON.stringify(brand));
    if (window.PlatformDataEngine) window.PlatformDataEngine.addBrand(brand);"""

new_brnd_push = """    localStorage.setItem('latestBrand', JSON.stringify(brand));
    if (window.PlatformData && window.PlatformEngine) {
        window.PlatformData.branding.push(brand);
        window.PlatformEngine.addNotification(`Brand identity generated for ${brand.startupName}`);
        window.PlatformEngine.savePlatformData();
    }"""
brnd = brnd.replace(old_brnd_push, new_brnd_push)

with open(brnd_path, "w", encoding="utf-8") as f:
    f.write(brnd)

# 4. content.js
cnt_path = base_path + "content.js"
with open(cnt_path, "r", encoding="utf-8") as f:
    cnt = f.read()

old_cnt_push = """      if (window.PlatformDataEngine) window.PlatformDataEngine.addAiUsage('content', 2000);
      window.Router.navigate('#/content');"""

new_cnt_push = """      if (window.PlatformData && window.PlatformEngine) {
          window.PlatformData.aiUsage.push({ module: 'content', tokens: 2000 });
          window.PlatformEngine.savePlatformData();
      }
      window.Router.navigate('#/content');"""
cnt = cnt.replace(old_cnt_push, new_cnt_push)

with open(cnt_path, "w", encoding="utf-8") as f:
    f.write(cnt)

# 5. forecasting.js
frc_path = base_path + "forecasting.js"
with open(frc_path, "r", encoding="utf-8") as f:
    frc = f.read()

old_frc_push = """      renderForecastMetrics(data.forecast);
      initForecastingChart(data.forecast.monthly_forecast);
      if (window.PlatformDataEngine) window.PlatformDataEngine.addForecast(data.forecast);"""

new_frc_push = """      renderForecastMetrics(data.forecast);
      initForecastingChart(data.forecast.monthly_forecast);
      if (window.PlatformData && window.PlatformEngine) {
          window.PlatformData.forecasts.push(data.forecast);
          window.PlatformEngine.addNotification(`Sales forecast generated.`);
          window.PlatformEngine.savePlatformData();
      }"""
frc = frc.replace(old_frc_push, new_frc_push)

with open(frc_path, "w", encoding="utf-8") as f:
    f.write(frc)

# 6. segmentation.js
seg_path = base_path + "segmentation.js"
with open(seg_path, "r", encoding="utf-8") as f:
    seg = f.read()

old_seg_push = """      updateKPIs(data);
      initSegmentsChart(data.cluster_sizes);
      if (window.PlatformDataEngine) window.PlatformDataEngine.addSegmentation(data);"""

new_seg_push = """      updateKPIs(data);
      initSegmentsChart(data.cluster_sizes);
      if (window.PlatformData && window.PlatformEngine) {
          window.PlatformData.segmentation.push(data);
          window.PlatformEngine.addNotification(`Customer segmentation completed.`);
          window.PlatformEngine.savePlatformData();
      }"""
seg = seg.replace(old_seg_push, new_seg_push)

with open(seg_path, "w", encoding="utf-8") as f:
    f.write(seg)

print("Upgraded producers.")
