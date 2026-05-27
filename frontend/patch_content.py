import sys
import re

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\content.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

api_func = """
async function saveContentHub(data) {

    const response = await fetch('http://127.0.0.1:5000/api/contenthub/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    return await response.json()
}

// Drafts Management
async function saveDraft() {
 const html = document.getElementById('editor').innerHTML;
 if (!html.trim()) return alert("Editor is empty!");
 
 const type = document.getElementById('aiType').value;
 
 const draft = {
  id: Date.now(),
  type: type,
  snippet: html.replace(/<[^>]+>/g, '').substring(0, 50) + "...",
  content: html,
  date: new Date().toLocaleString('en-IN')
 };
 
 contentDrafts.unshift(draft);
 saveData("contentDrafts", contentDrafts);
 renderDrafts();

 const payload = {
    content_type: type,
    tone_of_voice: document.getElementById('aiTone')?.value || "",
    target_audience: document.getElementById('aiAudience')?.value || "",
    prompt_topic: document.getElementById('aiPrompt')?.value || "",
    keywords: document.getElementById('aiKeywords')?.value || "",
    generated_content: html,
    engagement_probability: parseFloat(document.getElementById('scoreEngagement')?.innerText) || 0,
    readability_score: parseFloat(document.getElementById('scoreReadability')?.innerText) || 0,
    seo_score: parseFloat(document.getElementById('scoreSEO')?.innerText) || 0,
    scheduled_platform: document.getElementById('schedulePlatform')?.value || "",
    scheduled_date: document.getElementById('scheduleDate')?.value || "",
    draft_status: "draft"
 }

 console.log("CONTENT HUB PAYLOAD:", payload)

 try {
    const result = await saveContentHub(payload)
    console.log("CONTENT HUB RESPONSE:", result)
 } catch (e) {
    console.error("CONTENT HUB API ERROR:", e)
 }

 // Show quick success state on button
 const btn = document.getElementById('btnSaveDraft');
 const orig = btn.innerHTML;
 btn.innerHTML = '<i data-lucide="check-circle-2" class="icon-sm text-green-500"></i> Saved!';
 setTimeout(() => { btn.innerHTML = orig; window.lucide.createIcons(); }, 2000);
};
"""

# Replace `function saveDraft() { ... };` with the new async function and API block
old_save_draft = r"// Drafts Management\nfunction saveDraft\(\) \{.*?\n\};"
c = re.sub(old_save_draft, api_func, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched content.js")
