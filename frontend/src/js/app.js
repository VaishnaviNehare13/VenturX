// App bootstrap: loads chrome components and initializes router & UI behaviors

async function loadComponent(selector, path) {
 const el = document.querySelector(selector);
 if (!el) return;
 const res = await fetch(path);
 el.innerHTML = await res.text();
}

// Authentication state
const Auth = {
 isLoggedIn: () => {
  try {
   const sessionStr = localStorage.getItem('venturx_session');
   if (!sessionStr) return false;
   const session = JSON.parse(sessionStr);
   return Boolean(session && (session.isLoggedIn === true || session.isLoggedIn === 'true') && session.email);
  } catch (e) {
   return false;
  }
 },
 getUser: () => {
  try {
   const sessionStr = localStorage.getItem('venturx_session');
   if (!sessionStr) return null;
   return JSON.parse(sessionStr);
  } catch (e) {
   return null;
  }
 },
 login: (session) => {
  const sessionData = { ...session, isLoggedIn: true };
  localStorage.setItem('venturx_session', JSON.stringify(sessionData));
  console.log("[Auth] Login successful");
  console.log("[Auth] Session write:", sessionData);
  updateAuthUI();
 },
 logout: () => {
  console.log("[Auth] Logout started");
  
  // 1. Clear session storage & local storage
  localStorage.removeItem('venturx_session');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('startup_session');
  sessionStorage.clear();
  
  // 2. Clear state / caches / global datasets
  window.LiveMongoPayload = null;
  window.LiveMongoDashboard = {};
  window.LiveMongoUsers = [];
  window.LiveMongoCRM = [];
  window.LiveMongoSubscriptions = [];
  window.LiveMongoAnalytics = [];
  window.LiveMongoRecommendations = [];
  window.LivePlatformHealth = null;
  window.LiveOverviewData = null;
  window.PlatformData = {
    users: [],
    crm: [],
    campaigns: [],
    forecasts: [],
    recommendations: [],
    subscriptions: [],
    notifications: [],
    aiUsage: [],
    segmentation: [],
    branding: [],
    content: [],
    analytics: [],
    financials: [],
    activityFeed: [],
    reports: [],
    settings: {},
    accounts: [],
    workspaces: [],
    recommendationMetrics: { generated: 0, accepted: 0, dismissed: 0, highestConfidence: [], mostTriggered: [] }
  };

  // 3. Clear running intervals in AdminState if any
  if (window.AdminState) {
    if (window.AdminState.liveInterval) {
      clearInterval(window.AdminState.liveInterval);
      window.AdminState.liveInterval = null;
    }
    if (window.AdminState.healthInterval) {
      clearInterval(window.AdminState.healthInterval);
      window.AdminState.healthInterval = null;
    }
    if (window.AdminState.overviewInterval) {
      clearInterval(window.AdminState.overviewInterval);
      window.AdminState.overviewInterval = null;
    }
    localStorage.removeItem('admin_currentTab');
  }

  // 4. Destroy charts if any
  if (window.Chart) {
    for (let id in Chart.instances) {
      Chart.instances[id].destroy();
    }
  }
  if (window.AdminUI && window.AdminUI.destroyAllCharts) {
    window.AdminUI.destroyAllCharts();
  }

  console.log("[Auth] Session cleared");
  updateAuthUI();

  // 5. Navigate cleanly to #/login with replace to avoid reopening via Back button
  console.log("[Router] Navigating to #/login");
  window.currentRoute = '';
  if (window.location.hash === '#/login') {
    if (window.Router && window.Router.navigate) {
      window.Router.navigate('#/login');
    }
  } else {
    window.location.replace('#/login');
  }
 }
};

window.Auth = Auth;

// Helper to fetch live user payload on-demand when visiting authenticated modules
async function ensureLiveUserPayload() {
 if (!Auth.isLoggedIn()) return;
 const session = Auth.getUser();
 if (session && session.email && (!window.LiveMongoPayload || !window.LiveMongoPayload.user)) {
  try {
   console.log("[Data] Fetching live user payload for:", session.email);
   const endpoint = `/api/users/${encodeURIComponent(session.email)}`;
   console.log("[Data] Active user API:", endpoint);
   const response = await fetch(endpoint);
   const json = await response.json();
   if (json.success) {
    window.LiveMongoPayload = json;
    window.PlatformData = json;
   }
  } catch (e) {
   console.error("[Data] Failed to fetch live payload:", e);
  }
 }
}
window.ensureLiveUserPayload = ensureLiveUserPayload;

function updateAuthUI() {
 const signInBtn = document.getElementById('signInBtn');
 const loggedInState = document.getElementById('loggedInState');
 const profileIcon = document.getElementById('profileIcon');

 if (!signInBtn || !loggedInState) return;

 if (Auth.isLoggedIn()) {
  const user = Auth.getUser() || {};
  const userName = user.name || user.email || 'User';
  const initials = userName.split(' ').filter(w => w).map(w => w[0]).join('').substring(0,2).toUpperCase() || 'U';

  signInBtn.style.display = 'none';
  loggedInState.style.display = 'flex';
  
  if (profileIcon) {
   profileIcon.textContent = initials;
   profileIcon.title = userName || 'Profile';
   profileIcon.onclick = () => {
     window.location.hash = '#/settings';
   };
  }
 } else {
  signInBtn.style.display = 'inline-flex';
  loggedInState.style.display = 'none';
 }
}

function setupTopbarInteractions() {
 const menuBtn = document.querySelector('[data-action="toggle-sidebar"]');
 if (menuBtn) {
  menuBtn.addEventListener('click', () => {
   const isOpen = document.getElementById('sidebar')?.classList.toggle('open');
   document.getElementById('sidebar-overlay')?.classList.toggle('visible', isOpen);
  });
 }
 const themeBtn = document.getElementById('themeToggle');
 if (themeBtn) {
  themeBtn.addEventListener('click', () => {
   const current = document.documentElement.getAttribute('data-theme');
   const order = ['corporate','dark','light','brand','sunset'];
   const next = order[(order.indexOf(current) + 1) % (order || []).length];
   applyTheme(next);
  });
 }
 
 const logoutBtn = document.getElementById('logoutBtn');
 if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
   e.preventDefault();
   Auth.logout();
  });
 }

 // Initialize auth UI
 updateAuthUI();
}

function setupSidebarInteractions() {
 const sidebar = document.getElementById('sidebar');
 const overlay = document.getElementById('sidebar-overlay');

 sidebar?.addEventListener('click', (e) => {
  const target = e.target;
  if (target instanceof Element && target.matches('a[href^="#/"]')) {
   if (window.innerWidth <= 720) {
    sidebar.classList.remove('open');
    overlay?.classList.remove('visible');
   }
  }
 });

 overlay?.addEventListener('click', () => {
  sidebar?.classList.remove('open');
  overlay.classList.remove('visible');
 });
}

async function bootstrap() {
 // Load layout components
 await Promise.all([
  loadComponent('#topbar', 'src/components/topbar.html'),
  loadComponent('#sidebar', 'src/components/sidebar.html'),
  loadComponent('#footer', 'src/components/footer.html')
 ]);

 setupTopbarInteractions();
 setupSidebarInteractions();
 setupKeyboardShortcuts();

 // Mount chatbot widget
 mountChatbot();
 
 const isAuthenticated = Auth.isLoggedIn();
 const session = Auth.getUser();
 if (isAuthenticated && session) {
  console.log(`[Auth] Session restored for: ${session.email}`);
  console.log("[Auth] Session restored");
 } else {
  console.log("[Auth] No active session found");
 }
 console.log("[Router] Initial route:", location.hash || '#/login');

 // Initialize router to evaluate initial authentication and route
 Router.init();
}

document.addEventListener('DOMContentLoaded', bootstrap);

// Page specific logic

document.addEventListener('page:loaded', (e) => {
 const hash = (e && e.detail && e.detail.hash) || Router.currentHash();
 


 if (hash === '#/settings') {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const select = document.getElementById('settingsTheme');
  if (select) select.value = currentTheme;
 }
});

// Theme handling
function detectInitialTheme() {
 const saved = localStorage.getItem('theme');
 if (['corporate','light','dark','brand','sunset'].includes(saved)) return saved;
 return 'light';
}

function applyTheme(theme) {
 document.documentElement.setAttribute('data-theme', theme);
 localStorage.setItem('theme', theme);
 // Notify charts/pages to re-style if needed
 document.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme } }));
}

// Initialize theme asap
applyTheme(detectInitialTheme());

// Listen for theme changes to update charts dynamically
document.addEventListener('theme:changed', (e) => {
 const theme = e.detail.theme;
 const isDark = !['light'].includes(theme);
 const textColor = isDark ? '#94a3b8' : '#475569';
 const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

 [].forEach(chart => {
  if (chart) {
   if (chart.options.plugins.legend) {
    chart.options.plugins.legend.labels.color = textColor;
   }
   if (chart.options.scales) {
    Object.values(chart.options.scales).forEach(scale => {
     if (scale.grid) scale.grid.color = gridColor;
     if (scale.ticks) scale.ticks.color = textColor;
    });
   }
   chart.update();
  }
 });
});

function setupKeyboardShortcuts() {
 document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd+K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
   const search = document.querySelector('.search input[type="search"]');
   if (search) { e.preventDefault(); search.focus(); }
  }
  // Ctrl/Cmd+B to toggle sidebar
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
   const sidebar = document.getElementById('sidebar');
   const overlay = document.getElementById('sidebar-overlay');
   if (sidebar) { 
    e.preventDefault(); 
    const isOpen = sidebar.classList.toggle('open');
    overlay?.classList.toggle('visible', isOpen);
   }
  }
 });
}

// Chatbot widget implementation
function mountChatbot() {
 if (document.getElementById('chatbot')) return;
 const container = document.createElement('div');
 container.className = 'chatbot';
 container.id = 'chatbot';

 container.innerHTML = `
  <div class="chatbot-window" id="chatbotWindow" aria-live="polite" aria-label="Assistant chat window">
   <div class="chatbot-header">
    <div class="chatbot-title">Assistant</div>
    <button class="icon-btn" id="chatbotClose" title="Close">✕</button>
   </div>
   <div class="chatbot-body" id="chatbotBody">
    <div class="chatbot-msg bot">Hi! How can I help you today?</div>
   </div>
   <div class="chatbot-input">
    <input id="chatbotInput" type="text" placeholder="Ask a question..." aria-label="Type your message" />
    <button class="btn-premium" id="chatbotSend">Send</button>
   </div>
  </div>
  <button class="chatbot-toggle" id="chatbotToggle" aria-expanded="false" aria-controls="chatbotWindow" title="Chat with us"><i data-lucide="message-square" class="icon-sm text-blue-500"></i></button>
 `;

 document.body.appendChild(container);

 const toggle = document.getElementById('chatbotToggle');
 const win = document.getElementById('chatbotWindow');
 const closeBtn = document.getElementById('chatbotClose');
 const input = document.getElementById('chatbotInput');
 const send = document.getElementById('chatbotSend');
 const body = document.getElementById('chatbotBody');

 function open() {
  win.classList.add('open');
  toggle.setAttribute('aria-expanded', 'true');
  setTimeout(() => input.focus(), 0);
 }
 function close() {
  win.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
 }

 toggle.addEventListener('click', () => {
  if (win.classList.contains('open')) close();
  else open();
 });
 closeBtn.addEventListener('click', close);

 function appendMessage(text, who) {
  const div = document.createElement('div');
  div.className = `chatbot-msg ${who}`;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
 }

 function getPageContext() {
  const hash = Router && Router.currentHash ? Router.currentHash() : (location.hash || '#/');
  return hash.replace('#/', '') || 'landing';
 }

 function faqAnswer(q) {
  const question = q.toLowerCase();
  const page = getPageContext();
  const canned = [
   { k: ['price','pricing','cost','plan'], a: 'We are free for this demo. For enterprise pricing, contact support.' },
   { k: ['support','help','contact'], a: 'You can reach us via the Help Center page or here in chat.' },
   { k: ['analytics','chart','dashboard'], a: 'Analytics are on the Analytics page. Use filters to refine insights.' },
   { k: ['theme','dark','light','color'], a: 'Use the Toggle Theme button in the top bar to switch themes.' },
   { k: ['financial','revenue','expense','profit'], a: 'Open Financials to view revenue, expenses, and profit in real time.' }
  ];
  for (const item of canned) {
   if ((item.k || []).some(w => question.includes(w))) return item.a;
  }
  return `I noted you are on the "${page}" page. Could you share more details?`;
 }

 function handleSend() {
  const value = String(input.value || '').trim();
  if (!value) return;
  appendMessage(value, 'user');
  input.value = '';
  setTimeout(() => {
   appendMessage(faqAnswer(value), 'bot');
  }, 300);
 }

 input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
 send.addEventListener('click', handleSend);

 // open on first visit to hint availability
 if (!localStorage.getItem('chatbotHintShown')) {
  open();
  localStorage.setItem('chatbotHintShown', '1');
 }
}


// EMERGENCY LOADER CLEANUP
setTimeout(() => {
  document.querySelectorAll('.loader,.spinner,.loading-overlay,#globalLoader').forEach(el => el.remove());
}, 1000);
