import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\branding.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

api_func = """
async function saveBranding(data) {

    const response = await fetch('http://127.0.0.1:5000/api/branding/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    return await response.json()
}

async function generateBrandIdentity() {
"""

c = c.replace("async function generateBrandIdentity() {", api_func)

injection = """
  window.PlatformData.branding.push(brandData);
  window.PlatformEngine.logActivity('branding', `Brand identity generated for ${startupName}`);
  window.PlatformEngine.savePlatformData("branding");

  const target_audience = document.getElementById("targetAudience")?.value || "General Market";

  const payload = {
      startup_description: idea,
      industry: industry,
      target_audience: target_audience,
      brand_vibe: vibe,
      primary_color: color,
      generated_logo: svgLogo,
      brand_kit: brandKit.innerHTML,
      saved_identity_name: startupName
  }

  console.log("BRANDING PAYLOAD:", payload)

  try {
      const result = await saveBranding(payload)
      console.log("BRANDING RESPONSE:", result)
  } catch (error) {
      console.error("BRANDING SAVE ERROR:", error)
  }
}
"""

c = c.replace("""
  window.PlatformData.branding.push(brandData);
  window.PlatformEngine.logActivity('branding', `Brand identity generated for ${startupName}`);
  window.PlatformEngine.savePlatformData("branding");
}
""", injection)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched branding.js")
