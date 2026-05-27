import re

filepath = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

new_settings_code = r"""function getSettingsHTML() {
  const s = window.LiveMongoSettings || {};
  
  const getToggleHTML = (id, label, desc, checked) => `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:500; color:#f8fafc;">${label}</div>
        <div style="font-size:13px; color:#94a3b8;">${desc}</div>
      </div>
      <button class="admin-btn" id="${id}" style="border: 1px solid ${checked ? '#10b981' : '#475569'}; color: ${checked ? '#10b981' : '#f8fafc'};">${checked ? 'Enabled' : 'Disabled'}</button>
    </div>
  `;

  const getInputHTML = (id, label, desc, val, type="text") => `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:500; color:#f8fafc;">${label}</div>
        <div style="font-size:13px; color:#94a3b8;">${desc}</div>
      </div>
      <input type="${type}" id="${id}" value="${val}" style="background:rgba(0,0,0,0.2); border:1px solid #334155; color:#fff; padding:6px 12px; border-radius:4px; width:120px; text-align:right;" />
    </div>
  `;

  return `
    <div class="admin-section-header">
      <h2>Platform Control Panel</h2>
      ${s.updated_at ? `<div style="font-size:12px; color:#94a3b8;">Last synced: ${new Date(s.updated_at).toLocaleString()}</div>` : ''}
    </div>
    <div class="admin-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Global Configuration</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${getInputHTML('inp_platform_name', 'Platform Name', 'Display name for the SaaS application.', s.platform_name || '')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_maintenance_mode', 'Maintenance Mode', 'Restrict access to admin panel only.', s.maintenance_mode)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_ai_engine_enabled', 'AI Engine Global', 'Enable or disable all AI prediction models.', s.ai_engine_enabled)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_dark_mode', 'Forced Dark Mode', 'Enforce absolute contrast theme.', s.dark_mode)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; color:#f8fafc;">Flush AI Engine Cache</div>
              <div style="font-size:13px; color:#94a3b8;">Forces all models to recompute next request.</div>
            </div>
            <button class="admin-btn admin-btn-primary" id="btnFlushCache">Flush Cache</button>
          </div>
        </div>
      </div>
      <div class="admin-card">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Security & Operations</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${getInputHTML('inp_session_timeout', 'Session Timeout (min)', 'Idle time before automatic logout.', s.session_timeout || 30, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_api_rate_limit', 'API Rate Limit', 'Requests allowed per hour per user.', s.api_rate_limit || 1000, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_ai_confidence_threshold', 'AI Confidence Threshold', 'Minimum score required to trigger autonomous actions.', s.ai_confidence_threshold || 85, 'number')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getInputHTML('inp_backup_frequency', 'Backup Frequency', 'Cron schedule for database snapshots.', s.backup_frequency || 'Daily')}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_email_alerts', 'System Email Alerts', 'Send critical alerts to admin emails.', s.email_alerts)}
          <hr style="border:0; border-top:1px solid rgba(255,255,255,0.05);">
          ${getToggleHTML('btn_audit_logging', 'Verbose Audit Logging', 'Record all user actions to activity logs.', s.audit_logging)}
        </div>
      </div>
    </div>
  `;
}

function bindSettingsEvents() {
  const s = window.LiveMongoSettings || {};

  // Toggles
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.onclick = () => {
        el.innerText = 'Saving...';
        saveSettings({ [key]: !s[key] });
      };
    }
  };

  bindToggle('btn_maintenance_mode', 'maintenance_mode');
  bindToggle('btn_ai_engine_enabled', 'ai_engine_enabled');
  bindToggle('btn_dark_mode', 'dark_mode');
  bindToggle('btn_email_alerts', 'email_alerts');
  bindToggle('btn_audit_logging', 'audit_logging');

  // Inputs
  const bindInput = (id, key, isNumber) => {
    const el = document.getElementById(id);
    if (el) {
      el.onchange = (e) => {
        let val = e.target.value;
        if (isNumber) val = parseInt(val) || 0;
        e.target.style.borderColor = '#10b981';
        saveSettings({ [key]: val });
      };
    }
  };

  bindInput('inp_platform_name', 'platform_name', false);
  bindInput('inp_session_timeout', 'session_timeout', true);
  bindInput('inp_api_rate_limit', 'api_rate_limit', true);
  bindInput('inp_ai_confidence_threshold', 'ai_confidence_threshold', true);
  bindInput('inp_backup_frequency', 'backup_frequency', false);

  const flushBtn = document.getElementById('btnFlushCache');
  if (flushBtn) {
    flushBtn.onclick = () => {
      window.dispatchEvent(new CustomEvent("platform:data-updated", { detail: { module: "admin-settings" } }));
      window.AdminUI.openOverlay('modal', 'Cache Flushed', '<div class="admin-empty-state"><i data-lucide="check-circle" style="color:#10b981; width:48px; height:48px; margin-bottom:16px;"></i><h3 style="color:#fff; margin:0;">AI and Analytics Caches Flushed Globally.</h3></div>');
    };
  }
}
"""

pattern = re.compile(r'function getSettingsHTML\(\).*?function bindSettingsEvents\(\).*?\}\n\}\nwindow.closeAdminOverlay', re.DOTALL)
new_content = pattern.sub(new_settings_code + "\nwindow.closeAdminOverlay", content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replaced!")
