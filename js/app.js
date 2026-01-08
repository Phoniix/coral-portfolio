// Initialize SPA Router
const router =  new Router();

// Global function to close mobile menu
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (hamburger) hamburger.classList.remove('active');
    if (navMenu) navMenu.classList.remove('active');
}

// Setup Navigation Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    // Handle Initial Page Load
    router.handleRoute();
    
    // Initialize portfolio modal on initial load
    setTimeout(() => initializePortfolioModal(), 100);
})

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link-active');

    // Debounce to prevent rapid clicking
    let lastClickTime = 0;
    const clickDelay = 150;

    navLinks.forEach(link => {
        // Remove old listener to prevent duplicates
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            e.preventDefault();

            // Debounce rapid clicks
            const now = Date.now();
            if (now - lastClickTime < clickDelay) {
                return;
            }
            lastClickTime = now;
            
            const pageName = newLink.getAttribute('data-page');
            router.navigateTo(pageName);
            
            // Close mobile menu immediately when link is clicked
            closeMobileMenu();
        });
    });
}

// Re-setup navigation when page content changes
const originalBindPageEvents = Router.prototype.bindPageEvents;
Router.prototype.bindPageEvents = function(pageName) {
    originalBindPageEvents.call(this, pageName);
    setupNavigation();
};

// Portfolio Modal Handler
function initializePortfolioModal() {
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    
    const projectsDataElement = document.getElementById('projects-data');
    if (!projectsDataElement) return; // Portfolio page not loaded yet
    
    const projectsData = JSON.parse(projectsDataElement.textContent);

    // Remove old event listeners by cloning nodes
    projectCards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', () => {
            const projectId = newCard.getAttribute('data-project-id');
            openProjectModal(projectId, projectsData, modal, modalBody);
        });
    });

    // Close modal handlers
    if (modalClose) {
        const newClose = modalClose.cloneNode(true);
        modalClose.parentNode.replaceChild(newClose, modalClose);
        newClose.addEventListener('click', () => closeModal(modal));
    }

    // Close on background click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

function openProjectModal(projectId, projectsData, modal, modalBody) {
    const project = projectsData[projectId];
    if (!project || !modal || !modalBody) return;

    // Calculate improvements
    const improvements = calculateImprovements(project.metrics);

    // Build modal content
    modalBody.innerHTML = `
        <h2>${project.name}</h2>
        <span class="project-type-badge">${project.type} • ${project.duration}</span>
        
        <p class="modal-description">${project.description}</p>

        <div class="metrics-section">
            <h3>Results & Metrics</h3>
            <div class="metrics-comparison">
                ${Object.keys(project.metrics.before).map((key) => `
                    <div class="metric-item before">
                        <div class="metric-period">Before</div>
                        <div class="metric-number">${formatMetric(key, project.metrics.before[key])}</div>
                        <div class="metric-name">${formatMetricName(key)}</div>
                    </div>
                    <div class="metric-item after">
                        <div class="metric-period">After</div>
                        <div class="metric-number">${formatMetric(key, project.metrics.after[key])}</div>
                        <div class="metric-name">${formatMetricName(key)}</div>
                        <div class="metric-improvement">+${improvements[key]}%</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="services-performed">
            <h3>Services Performed</h3>
            <ul class="services-list">
                ${project.services.map(service => `<li>${service}</li>`).join('')}
            </ul>
        </div>

        ${project.images && project.images.length > 0 ? `
            <div class="image-gallery">
                <h3>Project Gallery</h3>
                <div class="gallery-grid">
                    ${project.images.map(img => `
                        <div class="gallery-item">
                            <img src="${img}" alt="${project.name} Content">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        ${project.results && project.results.length > 0 ? `
            <div class="results-section">
                <h3>Key Results</h3>
                <ul class="results-list">
                    ${project.results.map(result => `<li>${result}</li>`).join('')}
                </ul>
            </div>
        ` : ''}

        ${project.testimonial ? `
            <div class="testimonial-box">
                <p class="testimonial-text">${project.testimonial.text}</p>
                <p class="testimonial-author">— ${project.testimonial.author}</p>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function calculateImprovements(metrics) {
    const improvements = {};
    Object.keys(metrics.before).forEach(key => {
        const before = metrics.before[key];
        const after = metrics.after[key];
        const improvement = ((after - before) / before * 100).toFixed(0);
        improvements[key] = improvement;
    });
    return improvements;
}

function formatMetric(key, value) {
    if (key === 'followers') {
        return value.toLocaleString();
    }
    if (key === 'engagement') {
        return `${value}%`;
    }
    return value;
}

function formatMetricName(key) {
    const names = {
        'followers': 'Followers',
        'engagement': 'Engagement Rate'
    };
    return names[key] || key;
}