// Basic hash router and dynamic HTML loader

const Router = (() => {
 const routes = {
  '#/': 'src/pages/landing.html',
  '#/landing': 'src/pages/landing.html',
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
  '#/pricing': 'src/pages/Plans.html',
  '#/plans': 'src/pages/Plans.html',
  '#/login': 'src/pages/login.html',
  '#/signup': 'src/pages/signup.html',
  '#/notifications': 'src/pages/notifications.html',
  '#/support': 'src/pages/support.html'
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

 function showSpinner(show) {
  // Disabled
 }

 // EMERGENCY LOADER CLEANUP
 setTimeout(() => {
  document.querySelectorAll('.loader,.spinner,.loading-overlay,#globalLoader')
   .forEach(el => el.remove());
 }, 1000);

 async function navigate(hash) {
  const path = routes[hash] || routes['#/'];
  try {
   // SAFELY DESTROY DASHBOARD CHARTS TO PREVENT MEMORY LEAKS
   if (window.destroyDashboardCharts) {
       window.destroyDashboardCharts();
   }
   
   await load('#content', path);
   setActiveNav(hash);
   window.scrollTo({ top: 0, behavior: 'smooth' });
   // full-width layout on landing
   if (hash === '#/' || hash === '#/landing') {
    document.documentElement.setAttribute('data-layout', 'full');
   } else {
    document.documentElement.removeAttribute('data-layout');
   }
   document.dispatchEvent(new CustomEvent('page:loaded', { detail: { hash } }));
   if (hash === '#/segmentation' && window.initializeSegmentation) {
    window.initializeSegmentation();
   }
   if (hash === '#/dashboard' || hash === '#/') {
    if (window.initDashboardPage) window.initDashboardPage();
   }
   if (hash === '#/forecasting' && window.initializeForecasting) {
    window.initializeForecasting();
   }
   if (hash === '#/marketing' && window.initMarketingPage) {
    window.initMarketingPage();
   }
   if (hash === '#/crm' && window.initCRMPage) {
    window.initCRMPage();
   }
   if (hash === '#/content' && window.initContentHub) {
    window.initContentHub();
   }
   if (hash === '#/branding' && window.initBrandingStudio) {
    window.initBrandingStudio();
   }
   if (hash === '#/analytics') {
    if (window.destroyAnalyticsCharts) window.destroyAnalyticsCharts();
    if (window.initAnalyticsPage) window.initAnalyticsPage();
   }
   if (hash === '#/financials') {
    if (window.destroyFinancialCharts) window.destroyFinancialCharts();
    if (window.initFinancialsPage) window.initFinancialsPage();
   }
  } catch (err) {
   console.error(err);
   const content = document.getElementById('content');
   if (content) {
    content.innerHTML = `<div class="card"><h3>Failed to load</h3><p class="muted">${String(err)}</p></div>`;
   }
  } finally {
   showSpinner(false);
   // Initialize Lucide icons on any newly rendered DOM elements
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
 }

 return { init, navigate, currentHash };
})();

window.Router = Router;
