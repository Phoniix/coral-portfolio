// Initialize SPA Router
const router =  new Router();

// Setup Navigation Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link-active');

    // Debounce to prevent rapid clicking
    let lastClickTime = 0;
    const clickDelay = 150;

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Debounce rapid clicks
            const now = Date.now();
            if (now - lastClickTime < clickDelay) {
                return;
            }
            lastClickTime = now;
            
            const pageName = link.getAttribute('data-page');
            router.navigateTo(pageName);
        });
    });

    // Handle Initial Page Load
    router.handleRoute();
})