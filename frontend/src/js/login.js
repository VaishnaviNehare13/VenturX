window.initLogin = function() {
    const oldBtn = document.getElementById("doLoginBtn");
    if (!oldBtn) return;
    
    // Step 5: Remove duplicate event listeners by cloning
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    // Step 4: Add execution lock
    let loginInProgress = false;

    // Step 3: Single login handler
    newBtn.addEventListener('click', async () => {
        if (loginInProgress) return;
        loginInProgress = true;

        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        if(!emailInput || !passwordInput) return;
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if(!email || !password) {
            loginInProgress = false;
            return alert('Enter email and password');
        }
        
        try {
            const response = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {

                // Store authenticated session
                localStorage.setItem(
                    "venturx_session",
                    JSON.stringify(data.user)
                );

                console.log("LOGIN SUCCESS:", data.user);

                // Redirect based on role
                if (data.user.role === "admin") {

                    console.log("Redirecting Admin...");

                    window.location.hash = "#/admin";

                } else {

                    console.log("Redirecting User Dashboard...");

                    window.location.hash = "#/dashboard";
                }

            } else {

                alert("Invalid email or password");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Server Error");
        } finally {
            loginInProgress = false;
        }
    });
};
