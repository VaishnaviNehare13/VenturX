window.initSignup = function() {
    const oldBtn = document.getElementById("doSignupBtn");
    if (!oldBtn) return;
    
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    let signupInProgress = false;

    newBtn.addEventListener('click', () => {
        if (signupInProgress) return;
        signupInProgress = true;

        const session = { 
            name: 'New Founder', 
            email: 'new@startup.com', 
            initials: 'NF', 
            role: 'user', 
            isLoggedIn: true, 
            loginTime: Date.now() 
        };
        
        console.log('SESSION WRITE:', session);
        
        localStorage.setItem("venturx_session", JSON.stringify(session));

        if(window.Auth) {
            window.Auth.login(session);
        }
        
        window.location.hash = '#/dashboard';
    });
};
