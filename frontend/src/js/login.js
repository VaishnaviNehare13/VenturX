window.initLogin = function() {
    const oldBtn = document.getElementById("doLoginBtn");
    if (!oldBtn) return;
    
    // Step 5: Remove duplicate event listeners by cloning
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    // Step 4: Add execution lock
    let loginInProgress = false;

    // Step 3: Single login handler
    newBtn.addEventListener('click', () => {
        if (loginInProgress) return;
        loginInProgress = true;

        const emailInput = document.getElementById('loginEmail');
        if(!emailInput) return;
        
        const email = emailInput.value.trim();
        if(!email) {
            loginInProgress = false;
            return alert('Enter email');
        }
        
        const role = email === "admin@venturx.in" ? "admin" : "user";
        
        const session = {
            email,
            role,
            name: role === "admin" ? "Admin" : "User",
            isLoggedIn: true,
            loginTime: Date.now()
        };
        
        console.log("SESSION WRITE:", session);
        
        localStorage.setItem("venturx_session", JSON.stringify(session));
        
        if (window.Auth) {
            window.Auth.login(session);
        }
        
        window.location.hash = role === "admin" ? "#/admin" : "#/dashboard";
    });
};
