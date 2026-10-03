window.initLogin = function() {
    const oldBtn = document.getElementById("doLoginBtn");
    if (!oldBtn) return;
    
    // Step 5: Remove duplicate event listeners by cloning
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    // Step 4: Add execution lock
    let loginInProgress = false;

    // Step 3: Single login handler
    newBtn.addEventListener('click', async (e) => {
        if (e) e.preventDefault();
        if (loginInProgress) return;
        loginInProgress = true;

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if(!emailInput || !passwordInput) {
            loginInProgress = false;
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email.includes('@')) {
            loginInProgress = false;
            return alert('Please enter a valid email address');
        }

        if(!email || !password) {
            loginInProgress = false;
            return alert('Enter email and password');
        }
        
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                // 1. Store authenticated session FIRST
                const session = {
                    ...data.user,
                    isLoggedIn: true,
                    loginTime: Date.now()
                };

                if (window.Auth) {
                    window.Auth.login(session);
                } else {
                    localStorage.setItem("venturx_session", JSON.stringify(session));
                }

                console.log("[Auth] Login successful");

                // 2. Redirect based on role to authenticated route
                const targetRoute = session.role === "admin" ? "#/admin" : "#/dashboard";
                console.log(`[Router] Navigating to authenticated route: ${targetRoute}`);
                window.location.hash = targetRoute;

            } else {
                alert(data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Server Error");
        } finally {
            loginInProgress = false;
        }
    });
};
