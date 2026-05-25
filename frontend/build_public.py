import os

nav = """<nav class="public-navbar" id="publicNavbar">
  <a href="#/" class="public-brand">
    <div style="width:32px;height:32px;background:linear-gradient(135deg, #6366f1, #a855f7);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">V</div> VenturX
  </a>
  <div class="public-nav-links">
    <a href="#/features">Features</a>
    <a href="#/pricing">Pricing</a>
    <a href="#/about">About</a>
    <a href="#/contact">Contact</a>
  </div>
  <div class="public-auth-buttons">
    <a href="#/login" class="public-btn-login">Log In</a>
    <a href="#/signup" class="public-btn-signup">Get Started</a>
  </div>
</nav>"""

footer = """<footer class="public-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <div class="public-brand">
        <div style="width:32px;height:32px;background:linear-gradient(135deg, #6366f1, #a855f7);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">V</div> VenturX
      </div>
      <p>The AI Operating System for Modern Startups. Automate forecasting, optimize campaigns, and scale faster.</p>
    </div>
    <div class="footer-col">
      <h4>Product</h4>
      <ul>
        <li><a href="#/features">Features</a></li>
        <li><a href="#/pricing">Pricing</a></li>
        <li><a href="#/login">Dashboard</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="#/about">About Us</a></li>
        <li><a href="#/contact">Contact</a></li>
        <li><a href="#/contact">Careers</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="#/contact">Privacy Policy</a></li>
        <li><a href="#/contact">Terms of Service</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div>&copy; 2026 VenturX. All rights reserved.</div>
    <div>Built for modern founders.</div>
  </div>
</footer>
<script>
  // Navbar scroll effect
  setTimeout(() => {
    const c = document.getElementById('content');
    if (c) {
      c.addEventListener('scroll', function() {
        if(this.scrollTop > 50) document.getElementById('publicNavbar').classList.add('scrolled');
        else document.getElementById('publicNavbar').classList.remove('scrolled');
      });
    }
  }, 100);
</script>"""

pages = {
  'landing.html': f"""<div class="public-page">
  {nav}
  <section class="hero-section">
    <div class="hero-content">
      <h1>Run Your Startup with AI Intelligence</h1>
      <p>VenturX helps startups automate forecasting, campaign optimization, CRM analytics, and financial intelligence using AI-powered business workflows.</p>
      <div class="hero-buttons">
        <a href="#/signup" class="public-btn-signup" style="padding: 16px 32px; font-size: 18px;">Start Free Trial</a>
        <a href="#/features" class="public-btn-outline" style="padding: 16px 32px; font-size: 18px;">Watch Demo</a>
      </div>
    </div>
    <div class="hero-visual">
      <div class="glass-preview">
        <div style="height: 120px; background: rgba(99,102,241,0.1); border-radius: 8px; margin-bottom: 16px;"></div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="height: 80px; background: rgba(168,85,247,0.1); border-radius: 8px;"></div>
          <div style="height: 80px; background: rgba(99,102,241,0.1); border-radius: 8px;"></div>
        </div>
      </div>
      <div class="floating-card" style="top: -20px; right: -20px;">
        <strong style="display:block;margin-bottom:4px;color:white;">AI Forecast</strong>
        <span style="color:#4ade80;">+$12,450 MRR</span>
      </div>
      <div class="floating-card" style="bottom: 40px; left: -40px; animation-delay: 1s;">
        <strong style="display:block;margin-bottom:4px;color:white;">Campaign ROI</strong>
        <span style="color:#4ade80;">+324%</span>
      </div>
    </div>
  </section>

  <section class="public-section">
    <div class="section-header">
      <h2>Trust & Scale</h2>
      <p>Powering over 10,000+ modern startups across the globe.</p>
    </div>
    <div class="public-grid-3" style="text-align: center;">
      <div><h3 style="font-size: 48px; color: var(--public-primary);">10k+</h3><p>Active Startups</p></div>
      <div><h3 style="font-size: 48px; color: var(--public-secondary);">50M+</h3><p>AI Predictions</p></div>
      <div><h3 style="font-size: 48px; color: #4ade80;">98%</h3><p>Forecast Accuracy</p></div>
    </div>
  </section>

  <section class="public-section" style="background: var(--public-surface);">
    <div class="section-header">
      <h2>Features Built for Growth</h2>
      <p>Everything you need to scale your startup.</p>
    </div>
    <div class="public-grid-3">
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="line-chart"></i></div>
        <h3>AI Forecasting</h3>
        <p>Predict revenue and runway with 98% accuracy using our machine learning models.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="target"></i></div>
        <h3>Campaign Intelligence</h3>
        <p>Optimize marketing spend with real-time performance predictions.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="users"></i></div>
        <h3>CRM Analytics</h3>
        <p>Segment users automatically and track customer satisfaction scores.</p>
      </div>
    </div>
    <div style="text-align:center; margin-top: 40px;">
      <a href="#/features" class="public-btn-outline">View All Features</a>
    </div>
  </section>

  <section class="public-section" style="text-align:center;">
    <h2 style="font-size: 40px; margin-bottom: 24px;">Start scaling your startup with AI</h2>
    <a href="#/signup" class="public-btn-signup" style="padding: 16px 48px; font-size: 18px;">Get Started Today</a>
  </section>
  {footer}
</div>""",

  'features.html': f"""<div class="public-page">
  {nav}
  <section class="public-section" style="padding-top: 140px;">
    <div class="section-header">
      <h2>Platform Features</h2>
      <p>Deep dive into the AI modules powering VenturX.</p>
    </div>
    <div class="public-grid-3">
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="trending-up"></i></div>
        <h3>Forecasting</h3>
        <p>Our proprietary ML engine analyzes your startup's financial history to project revenue, expenses, and runway for the next 6 months. Plan with confidence.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="megaphone"></i></div>
        <h3>Marketing</h3>
        <p>Stop guessing which campaigns will work. AI evaluates ad copy, channels, and budgets to predict conversion rates before you spend a dime.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="users"></i></div>
        <h3>CRM & Segmentation</h3>
        <p>Interactive UMAP scatter plots and automated clustering group your customers by behavior, helping you tailor your outreach.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="zap"></i></div>
        <h3>Recommendations</h3>
        <p>Get personalized product up-sell recommendations for every client in your database based on their purchase history.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="pie-chart"></i></div>
        <h3>Financials</h3>
        <p>Real-time P&L tracking, expense categorization, and intelligent cost-reduction insights.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon"><i data-lucide="briefcase"></i></div>
        <h3>Workflow Optimization</h3>
        <p>Analyze team productivity and automate repetitive operational tasks.</p>
      </div>
    </div>
  </section>
  {footer}
</div>""",

  'pricing.html': f"""<div class="public-page">
  {nav}
  <section class="public-section" style="padding-top: 140px;">
    <div class="section-header">
      <h2>Transparent Pricing</h2>
      <p>Plans that scale with your startup.</p>
    </div>
    <div class="public-grid-3">
      <div class="pricing-card">
        <h3>Starter</h3>
        <div class="pricing-price">₹499<span>/mo</span></div>
        <ul class="pricing-features">
          <li><i data-lucide="check"></i> Basic Analytics</li>
          <li><i data-lucide="check"></i> CRM Access (up to 1k users)</li>
          <li><i data-lucide="check"></i> 10 AI Forecasts / month</li>
        </ul>
        <a href="#/signup" class="public-btn-outline" style="width:100%; text-align:center; display:block; box-sizing:border-box;">Start Free Trial</a>
      </div>
      <div class="pricing-card featured">
        <h3>Growth <span style="font-size:12px;background:var(--public-primary);padding:4px 8px;border-radius:12px;color:white;vertical-align:middle;margin-left:8px;">Popular</span></h3>
        <div class="pricing-price">₹1999<span>/mo</span></div>
        <ul class="pricing-features">
          <li><i data-lucide="check"></i> Advanced AI Analytics</li>
          <li><i data-lucide="check"></i> Campaign Intelligence</li>
          <li><i data-lucide="check"></i> Unlimited Forecasts</li>
          <li><i data-lucide="check"></i> Priority Support</li>
        </ul>
        <a href="#/signup" class="public-btn-signup" style="width:100%; text-align:center; display:block; box-sizing:border-box;">Get Growth</a>
      </div>
      <div class="pricing-card">
        <h3>Enterprise</h3>
        <div class="pricing-price">Custom</div>
        <ul class="pricing-features">
          <li><i data-lucide="check"></i> Everything in Growth</li>
          <li><i data-lucide="check"></i> Dedicated Account Manager</li>
          <li><i data-lucide="check"></i> Custom AI Models</li>
          <li><i data-lucide="check"></i> SSO Integration</li>
        </ul>
        <a href="#/contact" class="public-btn-outline" style="width:100%; text-align:center; display:block; box-sizing:border-box;">Contact Sales</a>
      </div>
    </div>
  </section>
  {footer}
</div>""",

  'about.html': f"""<div class="public-page">
  {nav}
  <section class="public-section" style="padding-top: 140px;">
    <div class="section-header">
      <h2>About VenturX</h2>
      <p>Building the brain for modern startups.</p>
    </div>
    <div style="max-width: 800px; margin: 0 auto; line-height: 1.8; color: var(--public-muted); font-size: 18px;">
      <p style="margin-bottom: 24px;">VenturX was founded with a single mission: to democratize access to enterprise-grade AI for startups everywhere. Too often, early-stage companies fail not because their idea is bad, but because they lack the data insights to make the right operational and financial decisions.</p>
      <p style="margin-bottom: 24px;">We've built an AI Operating System that integrates directly with your business data to provide real-time forecasting, marketing optimization, and customer intelligence.</p>
      <h3 style="color: var(--public-text); margin: 40px 0 20px;">Our Technology</h3>
      <p>VenturX is powered by a robust Python Flask microservices architecture, running advanced Machine Learning models (like XGBoost for forecasting, and UMAP for segmentation) connected to a blazing-fast Vanilla JS frontend dashboard.</p>
    </div>
  </section>
  {footer}
</div>""",

  'contact.html': f"""<div class="public-page">
  {nav}
  <section class="public-section" style="padding-top: 140px;">
    <div class="section-header">
      <h2>Contact Us</h2>
      <p>We're here to help you scale.</p>
    </div>
    <div style="max-width: 600px; margin: 0 auto; background: var(--public-surface); border: 1px solid var(--public-border); padding: 40px; border-radius: 24px;">
      <div class="auth-form-group">
        <label>Name</label>
        <input type="text" placeholder="John Doe">
      </div>
      <div class="auth-form-group">
        <label>Email</label>
        <input type="email" placeholder="john@startup.com">
      </div>
      <div class="auth-form-group">
        <label>Message</label>
        <textarea rows="5" placeholder="How can we help you?" style="width:100%; background:rgba(0,0,0,0.2); border:1px solid var(--public-border); border-radius:8px; padding:12px 16px; color:var(--public-text); outline:none; box-sizing:border-box; font-family:inherit;"></textarea>
      </div>
      <button class="public-btn-signup" style="width: 100%;" onclick="alert('Message sent! Our team will reach out shortly.')">Send Message</button>
    </div>
  </section>
  {footer}
</div>""",

  'login.html': f"""<div class="public-page">
  {nav}
  <div class="auth-container">
    <div class="auth-card">
      <h1>Welcome Back</h1>
      <p>Sign in to your VenturX workspace.</p>
      
      <div class="auth-form-group">
        <label>Email Address</label>
        <input type="email" id="loginEmail" placeholder="founder@startup.com" value="demo@venturx.in">
      </div>
      
      <div class="auth-form-group">
        <label>Password</label>
        <input type="password" id="loginPassword" placeholder="••••••••" value="demo123">
      </div>
      
      <div style="text-align: right; margin-bottom: 16px;">
        <a href="javascript:void(0)" style="color: var(--public-primary); font-size: 14px; text-decoration: none;">Forgot Password?</a>
      </div>
      
      <button class="auth-btn" id="doLoginBtn">Sign In</button>
      
      <div class="auth-links">
        Don't have a workspace? <a href="#/signup">Create one</a>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('doLoginBtn').addEventListener('click', () => {{
      const email = document.getElementById('loginEmail').value;
      if(!email) return alert('Enter email');
      
      // Setup session
      const user = {{
        name: 'Demo Founder',
        email: email,
        initials: 'DF',
        role: email.includes('admin') ? 'admin' : 'user'
      }};
      
      if(window.Auth) {{
        window.Auth.login(user);
        window.location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
      }} else {{
        localStorage.setItem('user', JSON.stringify(user));
        window.location.hash = '#/dashboard';
      }}
    }});
  </script>
</div>""",

  'signup.html': f"""<div class="public-page">
  {nav}
  <div class="auth-container" style="padding-top: 100px;">
    <div class="auth-card" style="max-width: 600px;">
      <h1>Create Workspace</h1>
      <p>Get started with VenturX for free.</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="auth-form-group">
          <label>Full Name</label>
          <input type="text" placeholder="John Doe">
        </div>
        <div class="auth-form-group">
          <label>Email Address</label>
          <input type="email" placeholder="john@startup.com">
        </div>
      </div>
      
      <div class="auth-form-group">
        <label>Startup Name</label>
        <input type="text" placeholder="Acme Corp">
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="auth-form-group">
          <label>Industry</label>
          <select style="width:100%; background:rgba(0,0,0,0.2); border:1px solid var(--public-border); border-radius:8px; padding:12px 16px; color:var(--public-text); outline:none; font-family:inherit;">
            <option>SaaS / Software</option>
            <option>E-commerce</option>
            <option>Fintech</option>
            <option>Healthcare</option>
            <option>Other</option>
          </select>
        </div>
        <div class="auth-form-group">
          <label>Team Size</label>
          <select style="width:100%; background:rgba(0,0,0,0.2); border:1px solid var(--public-border); border-radius:8px; padding:12px 16px; color:var(--public-text); outline:none; font-family:inherit;">
            <option>1-10</option>
            <option>11-50</option>
            <option>51-200</option>
            <option>200+</option>
          </select>
        </div>
      </div>
      
      <div class="auth-form-group">
        <label>Password</label>
        <input type="password" placeholder="••••••••">
      </div>
      
      <button class="auth-btn" onclick="
        if(window.Auth) {{
          window.Auth.login({{ name: 'New Founder', email: 'new@startup.com', initials: 'NF', role: 'user' }});
          window.location.hash = '#/dashboard';
        }} else {{
          localStorage.setItem('user', JSON.stringify({{ name: 'New Founder', role: 'user' }}));
          window.location.hash = '#/dashboard';
        }}
      ">Create Workspace</button>
      
      <div class="auth-links">
        Already have a workspace? <a href="#/login">Sign in</a>
      </div>
    </div>
  </div>
</div>"""
}

import os
base_dir = r"c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\pages"

for filename, content in pages.items():
    path = os.path.join(base_dir, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created {filename}")
