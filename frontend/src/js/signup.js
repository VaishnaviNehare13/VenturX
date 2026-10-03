window.initSignup = function () {

    const oldBtn = document.getElementById("doSignupBtn");

    if (!oldBtn) return;

    const newBtn = oldBtn.cloneNode(true);

    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    let signupInProgress = false;

    newBtn.addEventListener('click', async () => {

        if (signupInProgress) return;

        signupInProgress = true;

        try {

            // GET FORM VALUES
            const name =
                document.querySelector('input[placeholder="Full Name"]')?.value ||
                document.querySelector('input[type="text"]')?.value;

            const email =
                document.querySelector('input[type="email"]')?.value;

            const company =
                document.querySelectorAll('input[type="text"]')[1]?.value || '';

            const industry =
                document.querySelector('select')?.value || 'SaaS';

            const team_size =
                document.querySelectorAll('select')[1]?.value || '1-10';

            const password =
                document.querySelector('input[type="password"]')?.value;

            // VALIDATION
            if (!name || !email || !password) {

                alert("Please fill all required fields");

                signupInProgress = false;

                return;
            }

            // SEND TO FLASK BACKEND
            const response = await fetch(
                "/api/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        company,
                        industry,
                        team_size,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log("Signup Response:", data);

            if (!data.success) {

                alert(data.message || "Signup failed");

                signupInProgress = false;

                return;
            }

            // CREATE & SAVE SESSION FIRST
            const session = {
                name: data.user.name,
                email: data.user.email,
                initials: (data.user.name || "U").substring(0, 2).toUpperCase(),
                role: data.user.role || "user",
                company: data.user.company || company || '',
                isLoggedIn: true,
                loginTime: Date.now()
            };

            if (window.Auth) {
                window.Auth.login(session);
            } else {
                localStorage.setItem("venturx_session", JSON.stringify(session));
            }

            console.log("[Auth] Login successful");
            console.log("[Auth] Workspace created and session established for:", session.email);

            alert("Workspace Created Successfully");

            // REDIRECT TO AUTHENTICATED ROUTE
            const targetRoute = session.role === "admin" ? "#/admin" : "#/dashboard";
            console.log(`[Router] Navigating to authenticated route: ${targetRoute}`);
            window.location.hash = targetRoute;

        } catch (error) {

            console.error("Signup Error:", error);

            alert("Server Error");

        } finally {

            signupInProgress = false;
        }

    });

};