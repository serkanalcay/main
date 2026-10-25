/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - ÇEREZ (COOKIE) VE GİZLİLİK ONAY SİSTEMİ
   KVKK (6698 Sayılı Kanun) & GDPR Standartlarına Uygun Çerez Bildirimi
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'ats_cookie_consent';

  // Kalıcı Çerez Yardımcıları (365 Gün Kalıcı Bellek)
  function getCookie(name) {
    try {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    } catch (e) {
      return null;
    }
  }

  function setCookie(name, val, days) {
    try {
      const d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = name + '=' + encodeURIComponent(val) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax';
    } catch (e) {}
  }

  function getConsent() {
    // 1. Kalıcı HTTP çerezi kontrolü
    const cookieVal = getCookie(STORAGE_KEY);
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        if (parsed && parsed.accepted) {
          // localStorage ile eşitle
          try { localStorage.setItem(STORAGE_KEY, cookieVal); } catch(e){}
          return parsed;
        }
      } catch (e) {
        return { accepted: true, analytics: true };
      }
    }

    // 2. localStorage kontrolü
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.accepted) {
          // Çerez ile eşitle (365 gün)
          setCookie(STORAGE_KEY, saved, 365);
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  function saveConsent(data) {
    const consent = {
      accepted: !!data.accepted,
      analytics: !!data.analytics,
      functional: !!data.functional,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR')
    };

    const consentStr = JSON.stringify(consent);

    // Hem localStorage hem de 365 günlük kalıcı HTTP Cookie'ye yaz
    try {
      localStorage.setItem(STORAGE_KEY, consentStr);
    } catch (e) {}
    setCookie(STORAGE_KEY, consentStr, 365);

    // Analitik motoruna çerez bildirim olayını ilet
    if (typeof window.recordCookieConsentEvent === 'function') {
      window.recordCookieConsentEvent(consent.accepted && consent.analytics);
    }

    // Olayı sekmelere ve pencereye yayınla
    window.dispatchEvent(new CustomEvent('ats_cookie_consent_updated', { detail: consent }));
    return consent;
  }

  function renderCookieBanner() {
    // Ziyaretçi 1 kez kabul ettiyse veya izin kayıtlıysa ASLA tekrar sorma
    if (getConsent()) return;

    // Eğer banner zaten DOM'da varsa çık
    if (document.getElementById('ats-cookie-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'ats-cookie-banner';
    banner.className = 'fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 text-white p-4 sm:p-5 md:p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[9999] transition-all duration-500 transform translate-y-8 opacity-0';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    banner.innerHTML = `
      <div class="flex flex-col gap-3 sm:gap-4">
        <!-- Başlık & İkon & Rozet -->
        <div class="flex items-start justify-between gap-2 sm:gap-3">
          <div class="flex items-center gap-2.5 sm:gap-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <span class="material-symbols-outlined text-[20px] sm:text-[24px]">cookie</span>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm sm:text-base md:text-lg leading-tight flex items-center gap-2">
                Çerez ve Gizlilik Bildirimi
              </h3>
              <span class="text-[11px] sm:text-xs text-amber-400 font-medium">KVKK &amp; GDPR Çerez Politikası</span>
            </div>
          </div>
          <span class="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Güvenli Portal
          </span>
        </div>

        <!-- Açıklama Metni (Neden istendiği net ve açık) -->
        <p class="text-slate-300 text-[11px] sm:text-xs md:text-sm leading-relaxed max-h-24 sm:max-h-none overflow-y-auto pr-1">
          Web sitemizde daha hızlı ve kaliteli deneyim sunmak, ziyaretçi trafiğini anonim analiz etmek ve başvuru süreçlerinizi kolaylaştırmak için KVKK kapsamında standart çerezler kullanılmaktadır.
        </p>

        <!-- Butonlar & Tercih Linki -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-800">
          <button type="button" id="btn-cookie-details" class="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer transition-colors flex items-center justify-center sm:justify-start gap-1 py-1">
            <span class="material-symbols-outlined text-[14px]">tune</span>
            Tercihleri Yönet
          </button>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button type="button" id="btn-cookie-necessary" class="flex-1 sm:flex-none px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all text-center cursor-pointer">
              Yalnızca Zorunlu
            </button>
            <button type="button" id="btn-cookie-accept-all" class="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 text-center flex items-center justify-center gap-1.5 cursor-pointer">
              <span class="material-symbols-outlined text-[16px] sm:text-[18px]">check</span>
              Kabul Et
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Giriş Animasyonu
    requestAnimationFrame(() => {
      banner.classList.remove('translate-y-8', 'opacity-0');
      banner.classList.add('translate-y-0', 'opacity-100');
    });

    // Buton Olayları
    const btnAccept = banner.querySelector('#btn-cookie-accept-all');
    const btnNecessary = banner.querySelector('#btn-cookie-necessary');
    const btnDetails = banner.querySelector('#btn-cookie-details');

    if (btnAccept) {
      btnAccept.addEventListener('click', () => {
        saveConsent({ accepted: true, analytics: true, functional: true });
        closeBanner(banner);
      });
    }

    if (btnNecessary) {
      btnNecessary.addEventListener('click', () => {
        saveConsent({ accepted: true, analytics: false, functional: false });
        closeBanner(banner);
      });
    }

    if (btnDetails) {
      btnDetails.addEventListener('click', () => {
        openModal();
      });
    }
  }

  function closeBanner(bannerEl) {
    if (!bannerEl) bannerEl = document.getElementById('ats-cookie-banner');
    if (!bannerEl) return;
    bannerEl.classList.remove('translate-y-0', 'opacity-100');
    bannerEl.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => {
      if (bannerEl && bannerEl.parentNode) {
        bannerEl.parentNode.removeChild(bannerEl);
      }
    }, 400);
  }

  // Ayrıntılı Tercih Modalı
  function openModal() {
    let modal = document.getElementById('ats-cookie-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ats-cookie-modal';
      modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300';
      modal.innerHTML = `
        <div class="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-amber-400 text-2xl">cookie</span>
              <h4 class="font-bold text-lg">Çerez Tercihlerini Özelleştir</h4>
            </div>
            <button type="button" id="btn-close-cookie-modal" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <span class="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div class="flex flex-col gap-4 text-xs md:text-sm max-h-[60vh] overflow-y-auto pr-1">
            <!-- 1. Zorunlu Çerezler -->
            <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">Zorunlu Çerezler</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase">Her Zaman Aktif</span>
                </div>
                <p class="text-slate-400 text-xs mt-1">
                  Portalın temel oturum güvenliği, form adımları ve sayfa yönlendirmeleri için zorunludur. Devre dışı bırakılamaz.
                </p>
              </div>
              <input type="checkbox" checked disabled class="mt-1 accent-amber-500 cursor-not-allowed">
            </div>

            <!-- 2. Analitik ve Trafik Çerezleri -->
            <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <span class="font-bold text-white text-sm">Trafik &amp; Analitik Çerezleri</span>
                <p class="text-slate-400 text-xs mt-1">
                  Ziyaretçi sayısı, sayfalarda geçirilen süre ve başvuru formuna tıklama hızlarını ölçmemizi sağlar. Tüm veriler anonimdir.
                </p>
              </div>
              <input type="checkbox" id="ats-chk-analytics" checked class="mt-1 w-4 h-4 accent-amber-500 cursor-pointer">
            </div>

            <!-- 3. İşlevsellik Çerezleri -->
            <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
              <div>
                <span class="font-bold text-white text-sm">İşlevsellik &amp; Tercih Çerezleri</span>
                <p class="text-slate-400 text-xs mt-1">
                  Başvuru formundaki tercihlerinizi ve form taslağınızı hatırlayarak işlem kolaylığı sağlar.
                </p>
              </div>
              <input type="checkbox" id="ats-chk-functional" checked class="mt-1 w-4 h-4 accent-amber-500 cursor-pointer">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button type="button" id="btn-save-cookie-prefs" class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md">
              Tercihlerimi Kaydet ve Kapat
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-close-cookie-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
      });

      modal.querySelector('#btn-save-cookie-prefs').addEventListener('click', () => {
        const analyticsConsent = modal.querySelector('#ats-chk-analytics').checked;
        const functionalConsent = modal.querySelector('#ats-chk-functional').checked;
        saveConsent({
          accepted: true,
          analytics: analyticsConsent,
          functional: functionalConsent
        });
        modal.classList.add('hidden');
        closeBanner();
      });
    } else {
      modal.classList.remove('hidden');
    }
  }

  // Dışa açık API ve ayar açma fonksiyonu
  window.atsCookieConsent = {
    getConsent: getConsent,
    openSettings: openModal,
    showBanner: renderCookieBanner,
    resetConsent: function () {
      localStorage.removeItem(STORAGE_KEY);
      renderCookieBanner();
    }
  };

  // Sayfa yüklendiğinde hemen çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCookieBanner);
  } else {
    renderCookieBanner();
  }

})();
