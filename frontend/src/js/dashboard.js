// dashboard.js - ULTRA-SAFE STATIC VERSION

window.initDashboardPage = function() {
    console.log("INITIALIZING ULTRA-SAFE STATIC DASHBOARD");

    // No async/await
    // No rendering loops
    // No Chart.js
    // No requestAnimationFrame
    // No heavy observers

    // Force show dashboard just in case router added a loading class globally
    setTimeout(() => {
        document.body.classList.remove("loading");
        const loader = document.getElementById("globalLoader");
        if(loader) loader.remove();
        console.log("Safe timeout guard executed.");
    }, 500);
};

window.destroyDashboardCharts = function() {
    console.log("Destroy safe dashboard charts...");
    // Nothing to destroy in ultra-safe mode
};
