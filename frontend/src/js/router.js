// Basic hash router and dynamic HTML loader

const Router = (() => {
 const routes = {
  '#/': 'src/pages/landing.html',
  '#/features': 'src/pages/features.html',
  '#/pricing': 'src/pages/pricing.html',
  '#/about': 'src/pages/about.html',
  '#/contact': 'src/pages/contact.html',
  '#/dashboard': 'src/pages/dashboard.html',
  '#/analytics': 'src/pages/analytics.html',
  '#/marketing': 'src/pages/marketing.html',
  '#/crm': 'src/pages/crm.html',
  '#/financials': 'src/pages/financials.html',
  '#/segmentation': 'src/pages/segmentation.html',
  '#/forecasting': 'src/pages/forecasting.html',
  '#/design': 'src/pages/design.html',
  '#/content': 'src/pages/content.html',
  '#/branding': 'src/pages/branding.html',
  '#/settings': 'src/pages/settings.html',
  '#/plans': 'src/pages/Plans.html',
  '#/login': 'src/pages/login.html',
  '#/signup': 'src/pages/signup.html',
  '#/notifications': 'src/pages/notifications.html',
  '#/support': 'src/pages/support.html',
  '#/admin': 'src/pages/admin.html'
 };

 const publicRoutes = ['#/', '#/features', '#/pricing', '#/about', '#/contact', '#/login', '#/signup'];

 const pageMeta = {
  '#/': { title: 'VenturX | AI Operating System for Startups', desc: 'Premium AI SaaS platform for modern startups.' },
  '#/features': { title: 'Features | VenturX', desc: 'Explore AI forecasting, CRM analytics, and more.' },
  '#/pricing': { title: 'Pricing | VenturX', desc: 'Transparent pricing for startups of all sizes.' },
  '#/about': { title: 'About Us | VenturX', desc: 'Our mission to bring AI intelligence to startups.' },
  '#/contact': { title: 'Contact | VenturX', desc: 'Get in touch with the VenturX team.' },
  '#/login': { title: 'Login | VenturX', desc: 'Sign in to your VenturX workspace.' },
  '#/signup': { title: 'Sign Up | VenturX', desc: 'Create your VenturX workspace.' }
 };

 async function fetchHTML(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load: ${path}`);
  return response.text();
 }

 async function load(targetSelector, path) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  el.innerHTML = await fetchHTML(path);
  
  // page transition
  el.classList.add('page-enter');
  requestAnimationFrame(() => {
   el.classList.add('page-enter-active');
   setTimeout(() => {
    el.classList.remove('page-enter');
    el.classList.remove('page-enter-active');
   }, 280);
  });
 }

 // Script Lazy Loading for Dashboard
 const loadedScripts = new Set();
 function loadScript(src, isModule=false) {
  return new Promise((resolve, reject) => {
   if (loadedScripts.has(src)) return resolve();
   const script = document.createElement('script');
   script.src = src;
   if (isModule) script.type = 'module';
   else script.defer = true;
   script.onload = () => { loadedScripts.add(src); resolve(); };
   script.onerror = () => reject(new Error(`Script load error: ${src}`));
   document.body.appendChild(script);
  });
 }

 async function loadDashboardDependencies() {
  const scripts = [
   'src/js/dashboard.js',
   'src/js/segmentation.js',
   'src/js/forecasting.js',
   'src/js/marketing.js',
   'src/js/crm.js',
   'src/js/content.js',
   'src/js/analyticsEngine.js',
   'src/js/analytics.js',
   'src/js/financialEngine.js',
   'src/js/financialCharts.js',
   'src/js/financialInsights.js',
   'src/js/financialModals.js',
   'src/js/financials.js'
  ];
  await Promise.all(scripts.map(s => loadScript(s)));
  await loadScript('src/js/branding.js', true);
 }

 async function loadAdminDependencies() {
  await loadScript('src/js/admin.js');
 }

 async function navigate(hash) {
  console.log("ACTIVE SESSION:", JSON.parse(localStorage.getItem("venturx_session")));
   
  if (window.currentRoute === hash) return;
  window.currentRoute = hash;

  const isPublic = publicRoutes.includes(hash);
  
  const session = JSON.parse(localStorage.getItem("venturx_session"));
  
  // Protected Route Middleware
  if (!isPublic && !session) {
   window.location.hash = '#/login';
   return;
  }
  
  // Role Redirects (If logged in and visiting login/signup, redirect to dashboard/admin)
  if ((hash === '#/login' || hash === '#/signup') && window.Auth && window.Auth.isLoggedIn()) {
    const user = window.Auth.getUser();
    if(user && user.role === 'admin') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/dashboard';
    }
    return;
  }

  // Admin access control
  if (hash === '#/admin') {
    const session = JSON.parse(localStorage.getItem("venturx_session"));
    if (!session || session.role !== 'admin') {
      window.location.hash = '#/login';
      return;
    }
  }

  const path = routes[hash] || routes['#/'];

  try {
   console.log("Loading Route:", hash);
   if (hash === '#/admin') console.log("Attempting Admin Route Load");

   // SAFELY DESTROY DASHBOARD CHARTS TO PREVENT MEMORY LEAKS
   if (window.Chart) {
     for (let id in Chart.instances) {
       Chart.instances[id].destroy();
     }
   }

   // Lazy load dashboard assets if navigating to internal route
   if (hash === '#/admin') {
    await loadAdminDependencies();
   } else if (!isPublic) {
    await loadDashboardDependencies();
   }
   
   await load('#content', path);
   setActiveNav(hash);
   window.scrollTo({ top: 0, behavior: 'smooth' });

   // Set Layout Mode
   if (isPublic) {
    document.documentElement.setAttribute('data-layout', 'public');
    
    // SEO Updates
    const meta = pageMeta[hash] || { title: 'VenturX | Premium AI Startup Platform', desc: 'VenturX AI SaaS command center.' };
    document.title = meta.title;
    let descMeta = document.querySelector("meta[name='description']");
    if(!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
    }
    descMeta.content = meta.desc;

   } else if (hash === '#/admin') {
    document.documentElement.setAttribute('data-layout', 'admin');
    document.title = 'VenturX | Admin Control Center';
   } else {
    document.documentElement.removeAttribute('data-layout');
    document.title = 'VenturX Dashboard';
   }
   
   document.documentElement.setAttribute('data-module', hash.replace('#/', '') || 'landing');

   document.dispatchEvent(new CustomEvent('page:loaded', { detail: { hash } }));

   if (hash === '#/login') {
    if (window.initLogin) window.initLogin();
   } else if (hash === '#/signup') {
    if (window.initSignup) window.initSignup();
   } else if (hash === '#/admin') {
    console.log("Admin JS Loaded");
    console.log(window.initAdminDashboard);
    if (window.initAdminDashboard) {
      window.initAdminDashboard();
    }
   } else if (!isPublic) {
    if (hash === '#/segmentation' && window.initializeSegmentation) window.initializeSegmentation();
    if (hash === '#/dashboard' && window.initDashboardPage) window.initDashboardPage();
    if (hash === '#/forecasting' && window.initializeForecasting) window.initializeForecasting();
    if (hash === '#/marketing' && window.initMarketingPage) window.initMarketingPage();
    if (hash === '#/crm' && window.initCRMPage) window.initCRMPage();
    if (hash === '#/content' && window.initContentHub) window.initContentHub();
    if (hash === '#/branding' && window.initBrandingStudio) window.initBrandingStudio();
    if (hash === '#/analytics') {
     if (window.destroyAnalyticsCharts) window.destroyAnalyticsCharts();
     if (window.initAnalyticsPage) window.initAnalyticsPage();
    }
    if (hash === '#/financials') {
     if (window.destroyFinancialCharts) window.destroyFinancialCharts();
     if (window.initFinancialsPage) window.initFinancialsPage();
    }
   }
  } catch (err) {
   console.error("Route load error:", err);
   const content = document.getElementById('content');
   if (content) {
    if (hash === '#/admin') {
      content.innerHTML = `<div class="public-page" style="display:flex;align-items:center;justify-content:center;height:60vh;padding:20px;text-align:center;">
        <div style="background:var(--public-surface, #fff);border:1px solid var(--public-border, #ccc);padding:40px;border-radius:16px;max-width:500px;">
          <h3 style="margin-bottom:16px;color:#ef4444;">Admin module failed to initialize</h3>
          <p style="color:var(--public-muted, #666);margin-bottom:24px;">There was an error initializing the control center.</p>
          <button onclick="window.location.hash='#/'" class="public-btn-signup">Return Home</button>
        </div>
      </div>`;
    } else {
      content.innerHTML = `<div class="public-page" style="display:flex;align-items:center;justify-content:center;height:60vh;padding:20px;text-align:center;">
        <div style="background:var(--public-surface, #fff);border:1px solid var(--public-border, #ccc);padding:40px;border-radius:16px;max-width:500px;">
          <h3 style="margin-bottom:16px;color:var(--public-text, #333);">Page Not Found</h3>
          <p style="color:var(--public-muted, #666);margin-bottom:24px;">Failed to load ${hash}.</p>
          <button onclick="window.location.hash='#/'" class="public-btn-signup">Return Home</button>
        </div>
      </div>`;
    }
   }
  } finally {
   if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
   }
  }
 }

 function setActiveNav(hash) {
  document.querySelectorAll('.nav a').forEach(a => {
   if (a.getAttribute('href') === hash) a.classList.add('active');
   else a.classList.remove('active');
  });
 }

 function currentHash() {
  return location.hash || '#/';
 }

 function init() {
  window.addEventListener('hashchange', () => navigate(currentHash()));
  if (!location.hash) {
   location.hash = '#/';
  } else {
   navigate(currentHash());
  }
 }

 return { init, navigate, currentHash };
})();

window.Router = Router;
