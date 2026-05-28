import os

css_content = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Premium Dark Theme Variables */
  --color-bg: #09090b;
  --color-surface: rgba(24, 24, 27, 0.6);
  --color-card: rgba(24, 24, 27, 0.4);
  --color-primary: #8b5cf6;
  --color-primary-glow: rgba(139, 92, 246, 0.4);
  --color-secondary: #3b82f6;
  --color-accent: #f43f5e;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  
  --color-text: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-muted: #64748b;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-hover: rgba(255, 255, 255, 0.04);
  
  --radius: 16px;
  --radius-sm: 8px;
  --radius-lg: 24px;
  
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.6), 0 0 20px var(--color-primary-glow);
  --shadow-glass: inset 0 1px 1px rgba(255, 255, 255, 0.05);
  
  --sidebar-width: 280px;
  --topbar-height: 72px;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  --glass-blur: blur(16px);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Force dark theme everywhere since it's a premium dark SaaS */
body, [data-theme="light"] {
  --color-bg: #09090b;
  --color-surface: rgba(24, 24, 27, 0.6);
  --color-text: #f8fafc;
}

/* Global Styles */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; overflow-x: hidden; }

body {
  font-family: var(--font-family);
  background: var(--color-bg);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(139, 92, 246, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.08), transparent 25%);
  background-attachment: fixed;
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

/* Layout Grid */
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 32px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin-top: 0;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}
h1 { font-size: 2.5rem; line-height: 1.2; }
h2 { font-size: 1.8rem; }
h3 { font-size: 1.4rem; }
p { margin-top: 0; color: var(--color-text-secondary); }
.muted { color: var(--color-muted); }
.lead { font-size: 1.1rem; }

/* Premium Glass Cards */
.card, .glass-card {
  background: var(--color-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow), var(--shadow-glass);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.card:hover, .glass-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover), var(--shadow-glass);
  border-color: rgba(139, 92, 246, 0.3);
}

/* Interactive card glow effect */
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: var(--transition);
}
.card:hover::before { opacity: 1; }

/* Grids */
.grid { display: grid; gap: 24px; }
.grid.two { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
.grid.three { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid.four { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }

/* Premium Buttons */
.btn, button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
  font-family: var(--font-family);
  text-decoration: none;
}

.btn:active { transform: scale(0.97); }

.btn-primary, .btn.primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  color: white;
  box-shadow: 0 4px 14px var(--color-primary-glow);
}
.btn-primary:hover, .btn.primary:hover {
  box-shadow: 0 6px 20px var(--color-primary-glow);
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn-premium {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
  border-radius: 20px;
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.6);
}

.btn-secondary, .btn.secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
.btn-secondary:hover, .btn.secondary:hover {
  background: var(--color-hover);
  border-color: rgba(255,255,255,0.2);
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  padding: 8px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
}
.icon-btn:hover {
  background: var(--color-hover);
  color: var(--color-primary);
}

/* Inputs & Forms */
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-input, input, select, textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: 14px;
  transition: var(--transition);
}

.form-input:focus, input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
  background: rgba(0, 0, 0, 0.4);
}

/* Tables */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th {
  background: rgba(0,0,0,0.3);
  padding: 16px;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}
td {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--color-hover); }

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--color-border);
}
.badge.success { color: var(--color-success); background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.2); }
.badge.warning { color: var(--color-warning); background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2); }
.badge.danger { color: var(--color-accent); background: rgba(244, 63, 94, 0.1); border-color: rgba(244, 63, 94, 0.2); }

/* Utilities */
.hidden { display: none !important; }
.flex { display: flex; }
.align-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

/* Premium Animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

/* Status Dots */
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; display: inline-block;
}
.status-dot.active { background: var(--color-success); box-shadow: 0 0 8px var(--color-success); }
.status-dot.warning { background: var(--color-warning); box-shadow: 0 0 8px var(--color-warning); }

/* Topbar & Sidebar Overrides */
.topbar {
  height: var(--topbar-height);
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 40;
}

.sidebar {
  width: var(--sidebar-width);
  background: rgba(9, 9, 11, 0.95);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: transform 0.3s ease;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-sm);
  margin: 4px 16px;
  transition: var(--transition);
}

.sidebar-nav a:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.sidebar-nav a.active {
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), transparent);
  color: var(--color-primary);
  border-left: 3px solid var(--color-primary);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}

/* Page Transitions */
.page-enter { opacity: 0; transform: translateY(10px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: opacity 0.3s, transform 0.3s; }
.page-exit { opacity: 1; transform: translateY(0); }
.page-exit-active { opacity: 0; transform: translateY(-10px); transition: opacity 0.3s, transform 0.3s; }

/* Profile Icon Glow */
.profile-icon {
  transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}
.profile-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6) !important;
}

/* Responsive Overrides */
@media (max-width: 1024px) {
  .grid.three, .grid.four { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
}

@media (max-width: 768px) {
  .sidebar { position: fixed; height: 100vh; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .content-wrapper { padding: 16px; }
  .topbar { padding: 0 16px; }
}
"""

with open(r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\styles\main.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("main.css completely rewritten with premium UI styles.")
