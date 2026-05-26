// App bootstrap: loads chrome components and initializes router & UI behaviors

async function loadComponent(selector, path) {
 const el = document.querySelector(selector);
 if (!el) return;
 const res = await fetch(path);
 el.innerHTML = await res.text();
}

// Authentication state
const Auth = {
 isLoggedIn: () => localStorage.getItem('venturx_session') !== null,
 getUser: () => JSON.parse(localStorage.getItem('venturx_session') || '{}'),
 login: (session) => {
  console.log("SESSION WRITE:", session);
  localStorage.setItem('venturx_session', JSON.stringify(session));
  updateAuthUI();
 },
 logout: () => {
  console.log("SESSION UPDATED: LOGGED OUT");
  localStorage.removeItem('venturx_session');
  updateAuthUI();
  Router.navigate('#/login');
 }
};

function updateAuthUI() {
 const signInBtn = document.getElementById('signInBtn');
 const loggedInState = document.getElementById('loggedInState');
 const profileIcon = document.getElementById('profileIcon');
 
 if (!signInBtn || !loggedInState) return;
 
 if (Auth.isLoggedIn()) {
  const user = Auth.getUser();
  signInBtn.style.display = 'none';
  loggedInState.style.display = 'flex';
  if (profileIcon && user.initials) {
   profileIcon.textContent = user.initials;
   profileIcon.title = user.name || 'Profile';
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
   const next = order[(order.indexOf(current) + 1) % order.length];
   applyTheme(next);
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
 
 const session = JSON.parse(localStorage.getItem("venturx_session"));
 console.log("Startup Session:", session);
 
 if (!session) {
   console.log("No active session");
   Router.init();
   return;
 }
 
 if (session.isLoggedIn) {
  const route = session.role === "admin" ? "#/admin" : "#/dashboard";
  console.log("Redirecting To:", route);
  if (!location.hash || location.hash === '#/' || location.hash === '#/login' || location.hash === '#/signup') {
    location.hash = route;
  }
 }

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
   if (item.k.some(w => question.includes(w))) return item.a;
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
