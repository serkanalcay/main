/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - SHARED ENTERPRISE CORE & CMS SYSTEM
   ========================================================================== */

(function () {
  'use strict';

  // 1. DEFAULT CMS SETTINGS
  const DEFAULT_CMS = {
    reportPrice: "65",
    translationPrice: "3000",
    bannerText: "Avrupa Tır Şoförlüğü Ön Başvuruları Başladı! 24 Saatte Evrak & Uygunluk Denetimi.",
    phone: "+90 (850) 840 00 00",
    email: "info@avrupatirsoforu.com"
  };

  // Get active CMS settings from localStorage or fallback
  window.getCMSData = function () {
    try {
      const stored = localStorage.getItem('cms_settings');
      if (stored) {
        return Object.assign({}, DEFAULT_CMS, JSON.parse(stored));
      }
    } catch (e) {}
    return DEFAULT_CMS;
  };

  // Sync CMS data into DOM elements across all pages
  window.initCMSData = function () {
    const cms = window.getCMSData();

    // Update Report Price Displays
    document.querySelectorAll('.cmsReportPriceDisplay').forEach(el => {
      el.textContent = cms.reportPrice + ' €';
    });

    // Update Translation Price Displays
    document.querySelectorAll('.cmsTranslationPriceDisplay').forEach(el => {
      el.textContent = cms.translationPrice + ' ₺';
    });

    // Update Banner Displays
    document.querySelectorAll('.cmsBannerTextDisplay').forEach(el => {
      el.textContent = cms.bannerText;
    });

    // Update Phone Displays
    document.querySelectorAll('.cmsPhoneDisplay').forEach(el => {
      el.textContent = cms.phone;
    });

    // Update Email Displays
    document.querySelectorAll('.cmsEmailDisplay').forEach(el => {
      el.textContent = cms.email;
    });
  };

  // 2. MOBILE MENU TOGGLE
  window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  };

  // 3. LOGIN LINK CLICK GUARD
  window.handleLoginClick = function (e) {
    const sessionStr = sessionStorage.getItem('user_session') || localStorage.getItem('user_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.loggedIn) {
          if (e) e.preventDefault();
          if (session.role === 'admin') {
            window.location.href = 'admin-panel.html';
          } else {
            window.location.href = 'driver-panel.html';
          }
        }
      } catch (err) {}
    }
  };

  // 4. ACCORDION CONTROLS FOR FAQ SECTIONS
  window.initAccordions = function () {
    const accordionTriggers = document.querySelectorAll('.faq-accordion-trigger');
    accordionTriggers.forEach(btn => {
      btn.addEventListener('click', function () {
        const content = this.nextElementSibling;
        const icon = this.querySelector('.material-symbols-outlined');
        if (content) {
          content.classList.toggle('hidden');
        }
        if (icon) {
          icon.classList.toggle('rotate-180');
        }
      });
    });
  };

  // 5. SMOOTH SCROLLING FOR ANCHORS
  window.initSmoothScroll = function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  };

  // 6. SHARED APPLICATIONS DATA STORAGE MANAGER
  const DEFAULT_APPLICATIONS = [];

  window.getATSApplications = function () {
    try {
      const stored = localStorage.getItem('ats_applications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  };

  window.saveATSApplications = function (apps) {
    try {
      localStorage.setItem('ats_applications', JSON.stringify(apps));
    } catch (e) {}
  };

  // INITIALIZE ON DOM READY
  document.addEventListener('DOMContentLoaded', function () {
    window.initCMSData();
    window.initAccordions();
    window.initSmoothScroll();
  });

})();
