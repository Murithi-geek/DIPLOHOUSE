/**
 * DiploHouse Africa — script.js
 * Navigation, scroll reveal, counter animations, smooth interactions
 */

(function () {
  'use strict';

  /* ============================================================
     DOM REFERENCES
     ============================================================ */
  const navbar       = document.getElementById('navbar');
  const menuToggle   = document.getElementById('menuToggle');
  const fullscreenNav= document.getElementById('fullscreenNav');
  const navClose     = document.getElementById('navClose');
  const navMain      = document.getElementById('navMain');

  // All sub-screens (have data-screen="sub")
  const subScreens   = document.querySelectorAll('.nav-screen[data-screen="sub"]');

  // Buttons that open a sub-screen
  const subTriggers  = document.querySelectorAll('.nav-item--has-sub');

  // Back buttons inside sub-screens
  const backButtons  = document.querySelectorAll('[data-back]');

  // Nav links that close the nav on click
  const navLinks     = document.querySelectorAll('[data-close-nav]');

  /* ============================================================
     STATE
     ============================================================ */
  let navOpen        = false;
  let activeSubScreen= null;

  /* ============================================================
     NAVBAR SCROLL BEHAVIOR
     ============================================================ */
  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run once on load

  /* ============================================================
     FULLSCREEN NAV — OPEN / CLOSE
     ============================================================ */
  function openNav() {
    navOpen = true;
    fullscreenNav.classList.add('is-open');
    fullscreenNav.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Ensure main screen is visible, sub hidden
    resetToMainScreen();

    // Focus first nav item
    const firstItem = navMain.querySelector('.nav-item');
    if (firstItem) setTimeout(() => firstItem.focus(), 100);
  }

  function closeNav() {
    navOpen = false;
    fullscreenNav.classList.remove('is-open');
    fullscreenNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('is-active');
    document.body.style.overflow = '';
    menuToggle.focus();

    // Clean up sub screens after transition
    setTimeout(resetToMainScreen, 500);
  }

  function resetToMainScreen() {
    navMain.classList.remove('is-hidden');
    subScreens.forEach(function (screen) {
      screen.classList.remove('is-active');
      screen.setAttribute('aria-hidden', 'true');
    });
    activeSubScreen = null;
  }

  menuToggle.addEventListener('click', function () {
    navOpen ? closeNav() : openNav();
  });

  navClose.addEventListener('click', closeNav);

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navOpen) closeNav();
  });

  /* ============================================================
     FULLSCREEN NAV — SUB-MENU TRANSITIONS
     ============================================================ */
  subTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-target');
      const targetScreen = document.getElementById(targetId);
      if (!targetScreen) return;

      // Hide main screen
      navMain.classList.add('is-hidden');

      // Show target sub-screen
      targetScreen.classList.add('is-active');
      targetScreen.setAttribute('aria-hidden', 'false');
      activeSubScreen = targetScreen;

      // Focus back button in sub-screen
      const backBtn = targetScreen.querySelector('[data-back]');
      if (backBtn) setTimeout(() => backBtn.focus(), 80);
    });
  });

  backButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!activeSubScreen) return;

      // Hide sub-screen
      activeSubScreen.classList.remove('is-active');
      activeSubScreen.setAttribute('aria-hidden', 'true');
      activeSubScreen = null;

      // Show main screen
      navMain.classList.remove('is-hidden');

      // Return focus to the trigger that opened this sub-screen
      const triggerForThisScreen = document.querySelector('[data-target="' + btn.closest('.nav-screen').id + '"]');
      if (triggerForThisScreen) setTimeout(() => triggerForThisScreen.focus(), 80);
    });
  });

  // Close nav when a nav link (that goes to a section) is clicked
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  /* ============================================================
     SMOOTH SCROLL — intercept anchor links
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
     SCROLL REVEAL — Intersection Observer
     ============================================================ */
  const revealElements = document.querySelectorAll('.reveal-up');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ============================================================
     ANIMATED COUNTERS — Intersection Observer
     ============================================================ */
  const counterStats = document.querySelectorAll('.impact-stat[data-target]');

  /**
   * Animate a counter element from 0 to its target value.
   * @param {HTMLElement} el - The .impact-stat element
   */
  function animateCounter(el) {
    const numberEl = el.querySelector('.impact-stat__number');
    if (!numberEl) return;

    const target  = parseInt(el.getAttribute('data-target'), 10);
    const suffix  = el.getAttribute('data-suffix') || '';
    const duration = 1800; // ms
    const frameDuration = 1000 / 60; // ~60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const easeOutQuad = function (t) { return t * (2 - t); };

    const counter = setInterval(function () {
      frame++;
      const progress = easeOutQuad(frame / totalFrames);
      const current = Math.round(progress * target);
      numberEl.textContent = current + suffix;

      if (frame === totalFrames) {
        clearInterval(counter);
        numberEl.textContent = target + suffix;
      }
    }, frameDuration);
  }

  if ('IntersectionObserver' in window && counterStats.length > 0) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counterStats.forEach(function (stat) {
      counterObserver.observe(stat);
    });
  }

  /* ============================================================
     CONTACT FORM — basic validation & feedback
     ============================================================ */
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;

      required.forEach(function (field) {
        // Remove previous error state
        field.style.borderColor = '';

        if (!field.value.trim()) {
          field.style.borderColor = '#e53e3e';
          valid = false;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.style.borderColor = '#e53e3e';
          valid = false;
        }
      });

      if (valid) {
        // Show success message
        const submitBtn = contactForm.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '✓ Message Sent';
        submitBtn.style.background = '#2f855a';
        submitBtn.style.borderColor = '#2f855a';
        submitBtn.disabled = true;

        setTimeout(function () {
          contactForm.reset();
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
        }, 3500);
      }
    });

    // Clear error state on input
    contactForm.querySelectorAll('.form-input').forEach(function (field) {
      field.addEventListener('input', function () {
        field.style.borderColor = '';
      });
    });
  }

  /* ============================================================
     NEWSLETTER FORM — feedback
     ============================================================ */
  const newsletterForm = document.querySelector('.newsletter__form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const btn   = newsletterForm.querySelector('button[type="submit"]');

      if (!input || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        input.style.borderColor = '#e53e3e';
        return;
      }

      const originalText = btn.textContent;
      btn.textContent = '✓ Subscribed';
      btn.style.background = '#2f855a';
      btn.style.borderColor = '#2f855a';
      input.disabled = true;
      btn.disabled = true;

      setTimeout(function () {
        newsletterForm.reset();
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.borderColor = '';
        input.disabled = false;
        btn.disabled = false;
      }, 4000);
    });
  }

  /* ============================================================
     KEYBOARD TRAP — keep focus inside nav when open
     ============================================================ */
  fullscreenNav.addEventListener('keydown', function (e) {
    if (!navOpen || e.key !== 'Tab') return;

    const focusableSelectors = [
      'a[href]', 'button:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])',
      'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusable = Array.from(fullscreenNav.querySelectorAll(focusableSelectors)).filter(function (el) {
      return !el.closest('[aria-hidden="true"]') && el.offsetParent !== null;
    });

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ============================================================
     CLICK OUTSIDE NAV — close if clicking backdrop
     ============================================================ */
  fullscreenNav.addEventListener('click', function (e) {
    // Only close if clicking the very outer overlay (not its children)
    if (e.target === fullscreenNav) closeNav();
  });

})();

// Lightbox for publication full images
document.addEventListener('DOMContentLoaded', function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lbImg = lightbox.querySelector('.lightbox__img');
  var closeBtn = lightbox.querySelector('.lightbox__close');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  // Attach to publication Read More links
  document.querySelectorAll('.pub-card .btn-link').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var card = btn.closest('.pub-card');
      if (!card) return;
      var img = card.querySelector('.pub-card__image');
      if (img && img.src) {
        openLightbox(img.src, img.alt || (card.querySelector('.pub-card__title')||{}).textContent);
      } else {
        // fallback: follow link
        window.location.href = btn.href;
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
});
