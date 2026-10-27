/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - GELİŞMİŞ WEB BİLDİRİM & GERÇEK ZAMANLI SENKRONİZASYON MOTORU
   - Tüm browser alert() ve confirm() çağrılarını modern web içi UI bildirimlerine dönüştürür.
   - Sürücü Paneli <-> Admin Paneli arasında 0ms çift yönlü senkronizasyon sağlar.
   ========================================================================== */

(function () {
  'use strict';

  // 1. TOAST CONTAINER YÖNETİMİ
  let toastContainer = null;
  function getToastContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
      toastContainer = document.getElementById('ats-site-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'ats-site-toast-container';
        toastContainer.className = 'fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-3 sm:px-0';
        toastContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  // 2. GELİŞMİŞ WEB BİLDİRİMİ (TOAST) GÖSTERİCİ
  window.showSiteNotification = function (options) {
    if (typeof options === 'string') {
      options = { message: options };
    }

    const message = options.message || '';
    let type = options.type || 'info'; // 'success' | 'warning' | 'error' | 'info'
    let title = options.title || '';
    const duration = options.duration || (type === 'error' ? 6000 : 4500);

    // Tip otomatik algılama (alert() override için)
    const lower = message.toLowerCase();
    if (!options.type) {
      if (lower.includes('hata') || lower.includes('hatalı') || lower.includes('başarısız') || lower.includes('reddedil')) {
        type = 'error';
      } else if (lower.includes('uyarı') || lower.includes('dikkat') || lower.includes('bekleniyor') || lower.includes('lütfen')) {
        type = 'warning';
      } else if (lower.includes('başarıyla') || lower.includes('tebrik') || lower.includes('onaylandı') || lower.includes('güncellendi') || lower.includes('tamamlandı')) {
        type = 'success';
      } else {
        type = 'info';
      }
    }

    if (!title) {
      if (type === 'success') title = 'İşlem Başarılı';
      else if (type === 'warning') title = 'Dikkat / Bilgilendirme';
      else if (type === 'error') title = 'İşlem Hatası';
      else title = 'Sistem Bildirimi';
    }

    const container = getToastContainer();

    // Stil & İkon Yapılandırması
    const configs = {
      success: {
        border: 'border-emerald-500/40',
        bg: 'bg-slate-900/95',
        badgeBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        icon: 'check_circle',
        barColor: 'bg-emerald-500',
        titleColor: 'text-emerald-400'
      },
      warning: {
        border: 'border-amber-500/40',
        bg: 'bg-slate-900/95',
        badgeBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        icon: 'warning',
        barColor: 'bg-amber-500',
        titleColor: 'text-amber-400'
      },
      error: {
        border: 'border-rose-500/40',
        bg: 'bg-slate-900/95',
        badgeBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        icon: 'error',
        barColor: 'bg-rose-500',
        titleColor: 'text-rose-400'
      },
      info: {
        border: 'border-sky-500/40',
        bg: 'bg-slate-900/95',
        badgeBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
        icon: 'notifications_active',
        barColor: 'bg-sky-500',
        titleColor: 'text-sky-400'
      }
    };

    const cfg = configs[type] || configs.info;

    // Toast Elementi
    const toast = document.createElement('div');
    toast.className = `w-full pointer-events-auto rounded-2xl ${cfg.bg} ${cfg.border} border text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl p-4 flex flex-col gap-2 relative overflow-hidden transition-all duration-300 transform translate-y-[-12px] opacity-0 cursor-pointer select-none`;

    // Satır sonlarını HTML <br> ile koru ve emoji temizliği yap
    const formattedMsg = String(message)
      .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
      .replace(/[\n\r]+/g, '<br>');

    toast.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-8 h-8 rounded-xl ${cfg.badgeBg} flex items-center justify-center shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[20px]">${cfg.icon}</span>
          </div>
          <div class="flex flex-col min-w-0 pr-1">
            <span class="text-xs sm:text-sm font-bold ${cfg.titleColor} tracking-tight leading-tight">${title}</span>
            <p class="text-[12px] sm:text-[13px] text-slate-200 leading-snug mt-1 break-words">${formattedMsg}</p>
          </div>
        </div>
        <button type="button" aria-label="Kapat" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div class="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-1">
        <div class="h-full ${cfg.barColor} transition-all ease-linear" style="width: 100%; transition-duration: ${duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    // Animasyonla Aç
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-[-12px]', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      const bar = toast.querySelector('div > div.transition-all');
      if (bar) {
        requestAnimationFrame(() => {
          bar.style.width = '0%';
        });
      }
    });

    let dismissTimer = null;
    function closeToast() {
      if (dismissTimer) clearTimeout(dismissTimer);
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-[-10px]', 'opacity-0');
      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }

    dismissTimer = setTimeout(closeToast, duration);

    // Mouse gelince süreyi durdur, çıkınca devam et
    toast.addEventListener('mouseenter', () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    });
    toast.addEventListener('mouseleave', () => {
      dismissTimer = setTimeout(closeToast, 2000);
    });

    // Kapat butonuna basıldığında
    const closeBtn = toast.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeToast();
      });
    }

    // Tıklayınca kapat
    toast.addEventListener('click', closeToast);

    return toast;
  };

  window.showToast = window.showSiteNotification;

  // 3. TARAYICI ALERT FONKSİYONUNU WEB BİLDİRİMİ İLE DEĞİŞTİR (OVERRIDE)
  // Bu sayede tüm sayfalarda mevcut olan alert('...') çağrıları doğrudan web bildirimine dönüşür
  const originalAlert = window.alert;
  window.alert = function (message) {
    if (typeof message === 'undefined') return;
    try {
      window.showSiteNotification(message);
    } catch (e) {
      originalAlert(message);
    }
  };

  // 4. GELİŞMİŞ WEB ONAY MODALI (CONFIRM DIALOG)
  window.showSiteConfirm = function (options) {
    return new Promise((resolve) => {
      if (typeof options === 'string') {
        options = { message: options };
      }

      const title = options.title || 'İşlem Onayı';
      const message = options.message || 'Bu işlemi gerçekleştirmek istediğinize emin misiniz?';
      const confirmText = options.confirmText || 'Evet, Onayla';
      const cancelText = options.cancelText || 'Vazgeç';
      const type = options.type || 'warning'; // 'warning' | 'danger' | 'info' | 'success'

      let btnConfirmClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold';
      let iconName = 'help';
      let iconColor = 'text-amber-400 bg-amber-500/20 border-amber-500/30';

      if (type === 'danger' || type === 'error') {
        btnConfirmClass = 'bg-rose-600 hover:bg-rose-500 text-white font-bold';
        iconName = 'warning';
        iconColor = 'text-rose-400 bg-rose-500/20 border-rose-500/30';
      } else if (type === 'success') {
        btnConfirmClass = 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold';
        iconName = 'check_circle';
        iconColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      }

      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'fixed inset-0 z-[99999999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';

      const formattedMsg = String(message)
        .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
        .replace(/[\n\r]+/g, '<br>');

      modalOverlay.innerHTML = `
        <div class="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-white flex flex-col gap-5 transform transition-all duration-300 scale-95 opacity-0">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl ${iconColor} border flex items-center justify-center shrink-0 shadow-inner">
              <span class="material-symbols-outlined text-[24px]">${iconName}</span>
            </div>
            <div class="flex flex-col min-w-0 pr-1">
              <h3 class="font-bold text-base sm:text-lg text-white leading-tight">${title}</h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5 break-words">${formattedMsg}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" id="btn-site-confirm-cancel" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer">
              ${cancelText}
            </button>
            <button type="button" id="btn-site-confirm-ok" class="px-5 py-2.5 rounded-xl ${btnConfirmClass} text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center gap-1.5">
              <span>${confirmText}</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      const card = modalOverlay.querySelector('div');

      requestAnimationFrame(() => {
        modalOverlay.classList.remove('opacity-0');
        modalOverlay.classList.add('opacity-100');
        if (card) {
          card.classList.remove('scale-95', 'opacity-0');
          card.classList.add('scale-100', 'opacity-100');
        }
      });

      function cleanup(result) {
        modalOverlay.classList.remove('opacity-100');
        modalOverlay.classList.add('opacity-0');
        if (card) {
          card.classList.remove('scale-100', 'opacity-100');
          card.classList.add('scale-95', 'opacity-0');
        }
        setTimeout(() => {
          if (modalOverlay && modalOverlay.parentNode) {
            modalOverlay.parentNode.removeChild(modalOverlay);
          }
          resolve(result);
        }, 250);
      }

      modalOverlay.querySelector('#btn-site-confirm-ok').addEventListener('click', () => cleanup(true));
      modalOverlay.querySelector('#btn-site-confirm-cancel').addEventListener('click', () => cleanup(false));

      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) cleanup(false);
      });

      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          window.removeEventListener('keydown', keyHandler);
          cleanup(false);
        } else if (e.key === 'Enter') {
          window.removeEventListener('keydown', keyHandler);
          cleanup(true);
        }
      };
      window.addEventListener('keydown', keyHandler);
    });
  };

  // 5. ÇİFT YÖNLÜ CANLI SENKRONİZASYON MOTORU (BROADCAST + STORAGE BUS)
  const SYNC_CHANNEL_NAME = 'ats_portal_sync';
  const STORAGE_BUS_KEY = 'ats_sync_bus_event';

  let syncChannel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    } catch (e) {}
  }

  // Veri/Olay Yayınla (Sürücü <-> Admin Arası)
  window.atsBroadcastSync = function (eventType, payload) {
    const eventData = {
      type: eventType,
      payload: payload || {},
      timestamp: Date.now(),
      sender: window.location.pathname.split('/').pop() || 'unknown'
    };

    // 1. BroadcastChannel üzerinden ilet
    if (syncChannel) {
      try {
        syncChannel.postMessage(eventData);
      } catch (e) {}
    }

    // 2. LocalStorage Bus üzerinden ilet (Diğer sekmelerdeki 'storage' olayını tetikler)
    try {
      localStorage.setItem(STORAGE_BUS_KEY, JSON.stringify(eventData));
    } catch (e) {}

    // 3. Aynı pencere içi Custom Event
    window.dispatchEvent(new CustomEvent('ats_portal_internal_sync', { detail: eventData }));
  };

  // Veri/Olay Dinle
  window.atsOnSync = function (callback) {
    if (typeof callback !== 'function') return;

    // 1. BroadcastChannel Dinleyicisi
    if (syncChannel) {
      syncChannel.onmessage = function (event) {
        if (event.data) {
          callback(event.data);
        }
      };
    }

    // 2. Storage Bus Dinleyicisi
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_BUS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          callback(parsed);
        } catch (err) {}
      }
    });

    // 3. Dahili Event Dinleyicisi
    window.addEventListener('ats_portal_internal_sync', function (e) {
      if (e.detail) {
        callback(e.detail);
      }
    });
  };

  console.log('🔔 ATS Web Bildirim & Çift Yönlü Senkronizasyon Sistemi Aktif.');
})();
