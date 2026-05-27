// content.js - AI Content Intelligence Studio

let contentDrafts = [];
let contentSchedule = [];
let contentComments = [];

// Initialize
window.initContentHub = function() {
 loadContentData();
 renderDrafts();
 renderSchedule();
 renderComments();
 
 // Reset KPI cards to empty state
 updateKPIs(0, 0, 0);

 // Attach Event Listeners
 const bindClick = (id, fn) => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', fn);
 };

 bindClick('btnClearEditor', clearEditor);
 bindClick('btnSaveDraft', saveDraft);
 bindClick('btnScheduleContent', scheduleContent);
 bindClick('btnGenerateContent', generateContent);
 bindClick('btnAddComment', addComment);
 
 const commentInput = document.getElementById('commentInput');
 if (commentInput) {
    commentInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') addComment();
    });
 }

 const mediaUpload = document.getElementById('mediaUpload');
 if (mediaUpload) {
    mediaUpload.addEventListener('change', handleMediaUpload);
 }

 // Toolbar commands
 const toolbarCmds = document.querySelectorAll('.editor-toolbar button[data-cmd]');
 toolbarCmds.forEach(btn => {
     btn.addEventListener('click', () => {
         const cmd = btn.getAttribute('data-cmd');
         const arg = btn.getAttribute('data-arg') || null;
         if (cmd === 'media') {
             document.getElementById('mediaUpload').click();
         } else {
             document.execCommand(cmd, false, arg);
         }
     });
 });

 // Event Delegation for dynamic lists
 const draftList = document.getElementById('draftList');
 if (draftList) {
    draftList.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.draft-del-btn');
        if (delBtn) {
            e.stopPropagation();
            deleteDraft(parseInt(delBtn.getAttribute('data-id')));
            return;
        }
        const draftItem = e.target.closest('.draft-item');
        if (draftItem) {
            loadDraft(parseInt(draftItem.getAttribute('data-id')));
        }
    });
 }

 const commentsList = document.getElementById('commentsList');
 if (commentsList) {
    commentsList.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.comment-del-btn');
        if (delBtn) {
            deleteComment(parseInt(delBtn.getAttribute('data-id')));
        }
    });
 }
};

// Data Persistence
function loadContentData() {
 if (!window.PlatformData.content || Array.isArray(window.PlatformData.content)) {
   window.PlatformData.content = { drafts: [], schedule: [], comments: [] };
 }
 
 contentDrafts = window.PlatformData.content.drafts || [];
 contentSchedule = window.PlatformData.content.schedule || [];
 contentComments = window.PlatformData.content.comments || [];
}

function saveData(key, data) {
 window.PlatformData.content.drafts = contentDrafts;
 window.PlatformData.content.schedule = contentSchedule;
 window.PlatformData.content.comments = contentComments;
 
 window.PlatformEngine.logActivity('content', `Content updated`);
 window.PlatformEngine.savePlatformData("content");
}

// AI Content Generation Engine
function generateContent() {
 const type = document.getElementById('aiType').value;
 const tone = document.getElementById('aiTone').value;
 const audience = document.getElementById('aiAudience').value;
 const prompt = document.getElementById('aiPrompt').value || "the future of our SaaS platform";
 const keywordsInput = document.getElementById('aiKeywords').value;
 
 const keywords = keywordsInput ? keywordsInput.split(',').map(k => k.trim()) : ['Startup', 'Growth'];
 
 const loader = document.getElementById('aiLoader');
 const loaderText = document.getElementById('aiLoaderText');
 loader.classList.add('active');
 
 // Fake Loader Sequence
 setTimeout(() => { loaderText.innerText = "Applying " + tone.toLowerCase() + " tonal parameters..."; }, 400);
 setTimeout(() => { loaderText.innerText = "Structuring for " + audience + "..."; }, 800);
 setTimeout(() => { loaderText.innerText = "Generating hashtags..."; }, 1200);
 
 setTimeout(() => {
  // Generate text based on inputs
  const resultHtml = executeAITemplate(type, tone, audience, prompt, keywords);
  document.getElementById('editor').innerHTML = resultHtml;
  
  // Generate fake but realistic KPIs based on settings
  const engScore = Math.floor(Math.random() * 15) + 75; // 75-90
  const readScore = tone === 'Casual' ? 95 : (tone === 'Professional' ? 70 : 85);
  const seoScore = keywords.length > 2 ? 92 : 72;
  
  updateKPIs(engScore, readScore, seoScore);
  
  // Insights update
  const insightEl = document.getElementById('contentInsightsText');
  if (seoScore < 80) insightEl.innerHTML = `<strong>SEO optimization recommended.</strong> Try adding more diverse keywords related to <em>${audience}</em> to improve reach.`;
  else if (engScore > 85) insightEl.innerHTML = `<i data-lucide="flame" class="icon-sm text-red-500"></i><strong>High engagement probability.</strong> The ${tone.toLowerCase()} tone resonates exceptionally well with ${audience} on ${type.includes('LinkedIn') ? 'professional networks' : 'social platforms'}.`;
  else insightEl.innerHTML = `Solid content structure. Consider ending with a stronger Call-To-Action (CTA) to maximize conversion.`;
  
  loader.classList.remove('active');
  setTimeout(() => { loaderText.innerText = "Analyzing audience algorithms..."; }, 300); // Reset
 }, 1800);
};

function executeAITemplate(type, tone, audience, prompt, keywords) {
 const hashtagsHtml = keywords.map(k => `<span class="hashtag-pill">#${k.replace(/\s+/g, '')}</span>`).join('');
 let body = "";
 let intro = "";
 let cta = "";
 
 if (tone === 'Energetic') {
  intro = `<i data-lucide="zap" class="icon-sm text-amber-500"></i> We are BEYOND excited to talk about ${prompt} today!`;
  cta = `Drop a in the comments if you agree, or sign up now to see it in action!`;
 } else if (tone === 'Professional') {
  intro = `I am pleased to announce our latest developments regarding ${prompt}.`;
  cta = `We invite you to read the full case study on our website to understand the complete impact.`;
 } else if (tone === 'Persuasive') {
  intro = `Are you tired of losing time? ${prompt} is exactly what you need to scale effortlessly.`;
  cta = `Don't wait. Click the link below to transform your workflow today.`;
 } else {
  intro = `Hey ${audience}! Let's chat about ${prompt}.`;
  cta = `What do you guys think? Let me know below.`;
 }
 
 if (type === 'LinkedIn Post') {
  body = `<p>${intro}</p>
      <p>For ${audience}, the landscape is shifting faster than ever. We've realized that leveraging the right tools isn't just an advantage—it's a necessity.</p>
      <ul>
       <li>Efficiency is up by 40%</li>
       <li>Costs are minimized</li>
       <li>Teams are happier</li>
      </ul>
      <p>When you build for the future, you have to prioritize scalable intelligence.</p>
      <p>${cta}</p>`;
 } else if (type === 'Twitter Thread') {
  body = `<p> 1/5: ${intro}</p>
      <p>2/5: Most ${audience} miss the bigger picture when scaling. It's not about working harder, it's about systems.</p>
      <p>3/5: We built a solution that solves this exact bottleneck. No fluff, just pure ROI.</p>
      <p>4/5: ${cta}</p>
      <p>5/5: RT if you found this helpful!</p>`;
 } else {
  // Generic fallback for Blog, Email, etc.
  body = `<h2>Mastering ${prompt} for ${audience}</h2>
      <p>${intro}</p>
      <p>Building a successful strategy requires understanding the core metrics. When we look at the data, it's clear that adapting a <strong>${tone.toLowerCase()}</strong> approach yields the highest retention.</p>
      <p>${cta}</p>`;
 }
 
 return body + `<div style="margin-top: 16px;">${hashtagsHtml}</div>`;
}

function updateKPIs(eng, read, seo) {
 document.getElementById('scoreEngagement').innerText = eng ? eng + '%' : '--%';
 document.getElementById('scoreEngagement').style.color = eng > 85 ? '#34d399' : (eng ? '#f8fafc' : '#94a3b8');
 
 document.getElementById('scoreReadability').innerText = read ? read + '/100' : '--/100';
 document.getElementById('scoreSEO').innerText = seo ? seo + '/100' : '--/100';
}

function clearEditor() {
 document.getElementById('editor').innerHTML = '';
 updateKPIs(0, 0, 0);
 document.getElementById('contentInsightsText').innerText = "Content cleared. Ready for new generation.";
};


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


function loadDraft(id) {
 const draft = contentDrafts.find(d => d.id === id);
 if (draft) {
  document.getElementById('editor').innerHTML = draft.content;
  document.getElementById('contentInsightsText').innerText = "Loaded draft from history. Click generate to overwrite or continue editing manually.";
 }
};

function deleteDraft(id) {
 contentDrafts = contentDrafts.filter(d => d.id !== id);
 saveData("contentDrafts", contentDrafts);
 renderDrafts();
};

function renderDrafts() {
 const list = document.getElementById('draftList');
 document.getElementById('draftCount').innerText = contentDrafts.length;
 
 if (contentDrafts.length === 0) {
  list.innerHTML = '<p class="muted" style="font-size: 13px;">No drafts saved yet.</p>';
  return;
 }
 
 list.innerHTML = contentDrafts.map(d => `
  <div class="draft-item" data-id="${d.id}">
   <div style="display: flex; justify-content: space-between; align-items: center;">
    <strong style="font-size: 13px; color: #e2e8f0;">${d.type}</strong>
    <button class="icon-btn draft-del-btn" data-id="${d.id}" style="font-size: 12px; color: #ef4444;">✕</button>
   </div>
   <div class="muted" style="font-size: 11px; margin-top: 4px;">${d.date}</div>
   <div class="muted" style="font-size: 12px; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.snippet}</div>
  </div>
 `).join('');
}

// Scheduling
function scheduleContent() {
 const html = document.getElementById('editor').innerHTML;
 if (!html.trim()) return alert("Editor is empty!");
 
 const dateVal = document.getElementById('scheduleDate').value;
 if (!dateVal) return alert("Please select a date and time!");
 
 const platform = document.getElementById('schedulePlatform').value;
 
 contentSchedule.push({
  id: Date.now(),
  platform: platform,
  date: new Date(dateVal).toLocaleString('en-IN'),
  snippet: html.replace(/<[^>]+>/g, '').substring(0, 30) + "..."
 });
 
 saveData("contentSchedule", contentSchedule);
 renderSchedule();
 
 const btn = document.getElementById('btnScheduleContent');
 const orig = btn.innerHTML;
 btn.innerHTML = '<i data-lucide="check-circle-2" class="icon-sm text-green-500"></i> Scheduled!';
 setTimeout(() => { btn.innerHTML = orig; window.lucide.createIcons(); }, 2000);
};

function renderSchedule() {
 const list = document.getElementById('upcomingSchedules');
 if (contentSchedule.length === 0) {
  list.innerHTML = '<div class="muted">No upcoming posts.</div>';
  return;
 }
 
 list.innerHTML = contentSchedule.map(s => `
  <div style="padding: 8px; border-left: 2px solid #6366f1; background: rgba(99,102,241,0.05); margin-bottom: 8px; border-radius: 0 4px 4px 0;">
   <div style="font-weight: 600; color: #e2e8f0;">${s.platform}</div>
   <div class="muted" style="font-size: 11px;">${s.date}</div>
  </div>
 `).join('');
}

// Collaboration
function addComment() {
 const input = document.getElementById('commentInput');
 const text = input.value.trim();
 if (!text) return;
 
 contentComments.push({
  id: Date.now(),
  text: text,
  author: "You",
  date: new Date().toLocaleString('en-IN')
 });
 
 input.value = '';
 saveData("contentComments", contentComments);
 renderComments();
};

function deleteComment(id) {
 contentComments = contentComments.filter(c => c.id !== id);
 saveData("contentComments", contentComments);
 renderComments();
};

function renderComments() {
 const list = document.getElementById('commentsList');
 if (contentComments.length === 0) {
  list.innerHTML = '<p class="muted" style="font-size: 13px;">No comments.</p>';
  return;
 }
 
 list.innerHTML = contentComments.map(c => `
  <div style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
   <div style="display: flex; justify-content: space-between;">
    <strong style="font-size: 12px; color: #e2e8f0;">${c.author}</strong>
    <span class="muted comment-del-btn" data-id="${c.id}" style="font-size: 10px; cursor: pointer;">Delete</span>
   </div>
   <div style="font-size: 13px; margin-top: 4px; color: #cbd5e1;">${c.text}</div>
   <div class="muted" style="font-size: 10px; margin-top: 6px;">${c.date}</div>
  </div>
 `).join('');
 
 list.scrollTop = list.scrollHeight;
}

// Media Handling
function handleMediaUpload(event) {
 const file = event.target.files?.[0];
 if (!file) return;
 const url = URL.createObjectURL(file);
 const editor = document.getElementById('editor');
 
 if (file.type.startsWith('image/')) {
  editor.insertAdjacentHTML('beforeend', `<br><img src='${url}' style='max-width:100%; border-radius:8px; margin-top:8px; border: 1px solid rgba(255,255,255,0.1);' /><br>`);
 }
 if (file.type.startsWith('video/')) {
  editor.insertAdjacentHTML('beforeend', `<br><video src='${url}' controls style='max-width:100%; border-radius:8px; margin-top:8px;'></video><br>`);
 }
};
