class Router {
  constructor() {
    this.routes = {
      home: "fragments/hero.html",
      about: "fragments/about.html",
      services: "fragments/services.html",
      contact: "fragments/contact.html",
    };

    this.pageTitles = {
      home: "Coral Estrada Portfolio",
      about: "About - Coral Estrada Portfolio",
      services: "Services - Coral Estrada Portfolio",
      contact: "Contact - Coral Estrada Portfolio",
    };

    // Add loading state and abort controller
    this.isLoading = false;
    this.currentAbortController = null;
    this.currentPage = null;

    this.init();
  }

  init() {
    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      this.handleRoute();
    });

    // Handle hash changes (Spa Navigation)
    window.addEventListener("hashchange", () => {
      this.handleRoute();
    });
  }

  getCurrentPage() {
    const hash = window.location.hash.slice(1) || "home";
    return hash;
  }

  async loadPage(pageName) {
    const fragmentPath = this.routes[pageName];
    if (!fragmentPath) {
      console.error(`Page ${pageName} not found`);
      return null;
    }

    // Cancel previous request if still loading
    if (this.currentAbortController) {
      this.currentAbortController.abort(); // ✅ Fixed
    }

    // Create new abort Controller for this request
    this.currentAbortController = new AbortController();

    try {
      const response = await fetch(fragmentPath, {
        signal: this.currentAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${fragmentPath}`);
      }

      return await response.text();
    } catch (error) {
      // Ignore aborted requests
      if (error.name === "AbortError") {
        return null;
      }
      console.error("Error Loading page: ", error);
      return `<section class="content-section"><h2>Error</h2><p>Failed to load page. Please try again.</p></section>`;
    }
  }

  updateActiveNav(pageName) {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link-active").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current page
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  updatePageTitle(pageName) {
    document.title = this.pageTitles[pageName] || this.pageTitles["home"];
  }

  async handleRoute() {
    const pageName = this.getCurrentPage();

    // Prevent loading same page twice
    if (this.currentPage === pageName && this.isLoading) {
      return;
    }

    // Skip if already loading (prevents rapid clicking of nav links)
    if (this.isLoading && this.currentPage !== pageName) {
      // Allow navigation to different page, but cancel current load
      // The abort Controller will handle this request
    }

    this.isLoading = true;
    this.currentPage = pageName;
    const contentContainer = document.getElementById("app-content");

    // Update Navigation
    this.updateActiveNav(pageName);

    // Update Page Titles
    this.updatePageTitle(pageName);

    // Load and Render Content
    const content = await this.loadPage(pageName);

    // Check if this request was aborted or if page changed
    if (content && this.currentPage === pageName) {
      contentContainer.innerHTML = content;

      // Re-bind any dynamic event listers after content loads
      this.bindPageEvents(pageName);
    }

    this.isLoading = false;
    this.currentAbortController = null;
  }

  bindPageEvents(pageName) {
    // Handle Interlinks within loaded content
    const internalLinks = document.querySelectorAll("[data-page]");
    internalLinks.forEach((link) => {
      // Remove old listeners to prevent duplicates
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);

      newLink.addEventListener("click", (e) => {
        e.preventDefault();
        const targetPage = newLink.getAttribute("data-page"); // ✅ Fixed
        this.navigateTo(targetPage);
      });
    });

    // Handle Form Submissions (Contact Form)
    if (pageName === "contact") {
      const contactForm = document.getElementById("contact-form");
      if (contactForm) {
        // Remove old listener to prevent duplicates
        const newForm = contactForm.cloneNode(true);
        contactForm.parentNode.replaceChild(newForm, contactForm);

        newForm.addEventListener("submit", (e) => this.handleContactSubmit(e)); // ✅ Fixed
      }
    }
  }

  navigateTo(pageName) {
    // Prevent Navigation if already on that page
    if (this.currentPage === pageName && !this.isLoading) {
      return;
    }

    window.location.hash = pageName;
    this.handleRoute();
  }

  handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    // Initialize EmailJS
    emailjs.init("jUTBgtI2ylhcKwnSG");

    //Get form data - variable names must match EmailJS template
    const formData = {
      name: form.querySelector("#name").value,
      message: form.querySelector("#message").value,
      time: new Date().toLocaleString(),
      from_email: form.querySelector("#email").value,
      subject: form.querySelector("#subject").value,
    };

    // Send Email
    emailjs.send(
        "service_57pebrt", // EmailJS Service ID
        "template_7o0auxk", // EmailJS Template ID
        formData
      )
      .then(() => {
        // Successful Attempt To Send
        submitButton.textContent = "Message Successfully Received";
        submitButton.style.backgroundColor = "#28a745";
        alert(
          "Thank you for your message! I will get back to you as soon as possible."
        );
        form.reset();

        // Reset Submit Button After 2 Seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          submitButton.style.backgroundColor = "";
        }, 2000);
      })
      .catch((error) => {
        // Error Handling
        console.error("EmailJS Error: ", error);
        submitButton.textContent = "Error - Try Again";
        submitButton.style.backgroundColor = "#dc3545";
        alert(
          "Sorry, there was an error sending your message. Please try again later."
        );

        //Reset Button After 2 Seconds
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          submitButton.style.backgroundColor = "";
        }, 2000);
      });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Router;
}
