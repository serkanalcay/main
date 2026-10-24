/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - GELİŞMİŞ TRAFİK & ETKİLEŞİM ANALİTİK MOTORU
   ==========================================================================
   - Web sitesi tekil ve toplam ziyaretçi sayısı
   - Ortalama sitede kalma süresi (aktif sekme süresi)
   - Ne kadar sürede başvuruya tıkladıkları (Dönüşüm Süresi)
   - Hangi sayfada ne kadar durdukları (Sayfa bazlı süre dökümü)
   - Cross-Tab Canlı Senkronizasyon (BroadcastChannel) ve API Entegrasyonu
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'ats_traffic_analytics';
  const VISITOR_KEY = 'ats_vid';
  const SESSION_KEY = 'ats_session_id';
  const SESSION_START_KEY = 'ats_session_start_time';
  const SESSION_APPLIED_KEY = 'ats_session_already_applied';

  // Canlı Hosting veya Localhost API Adresi
  function getApiEndpoint() {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.host && window.location.host.includes('avrupatirsoforu.com')) {
        return window.location.origin + '/api/analytics.php';
      }
    }
    return 'api/analytics.php';
  }

  // Varsayılan Başlangıç Analitik Verisi (Sadece Gerçek Veriler İçin Sıfırdan Başlangıç)
  function getDefaultData() {
    return {
      isRealOnly: true,
      totalVisitors: 0,
      uniqueVisitors: 0,
      totalPageviews: 0,
      totalDurationSeconds: 0,
      averageDurationSeconds: 0,
      bounceCount: 0,
      pages: {
        'Ana Sayfa': {
          path: 'index.html',
          views: 0,
          durationSeconds: 0,
          avgDurationSeconds: 0
        },
        'Başvuru Formu': {
          path: 'basvuru.html',
          views: 0,
          durationSeconds: 0,
          avgDurationSeconds: 0
        },
        'Hizmetlerimiz': {
          path: 'hizmetler.html',
          views: 0,
          durationSeconds: 0,
          avgDurationSeconds: 0
        },
        'Hakkımızda': {
          path: 'hakkimizda.html',
          views: 0,
          durationSeconds: 0,
          avgDurationSeconds: 0
        },
        'İletişim': {
          path: 'iletisim.html',
          views: 0,
          durationSeconds: 0,
          avgDurationSeconds: 0
        }
      },
      conversions: {
        totalApplyClicks: 0,
        totalApplyClickTimeSeconds: 0,
        avgApplyClickTimeSeconds: 0,
        clickDistribution: {
          '0-30s': 0,
          '30-60s': 0,
          '1-2m': 0,
          '2-5m': 0,
          '5m+': 0
        },
        recentClicks: []
      },
      cookieConsent: {
        accepted: 0,
        necessaryOnly: 0
      },
      lastUpdated: Date.now()
    };
  }

  // Veriyi Yükleme (Geçmiş simülasyon/mock verilerini temizler, yalnızca gerçek veriyi tutar)
  function getAnalyticsData() {
    const PURGE_FLAG = 'ats_purged_simulation_v3';
    try {
      if (localStorage.getItem(PURGE_FLAG) !== 'true') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(PURGE_FLAG, 'true');
        const initial = getDefaultData();
        saveAnalyticsData(initial, false);
        return initial;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.isRealOnly) {
          return parsed;
        }
      }
    } catch (e) {}
    const initial = getDefaultData();
    saveAnalyticsData(initial, false);
    return initial;
  }

  // Cross-Tab Broadcast Channel
  const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ats_portal_sync') : null;

  // Veriyi Kaydetme
  function saveAnalyticsData(data, shouldBroadcast = true) {
    if (!data) return;
    data.lastUpdated = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}

    if (shouldBroadcast && broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'TRAFFIC_UPDATE', data: data });
      } catch (e) {}
    }

    // API ile senkronize et (Arka planda, kullanıcıyı bekletmeden)
    syncToApi(data);
  }

  // Backend API Senkronu
  async function syncToApi(data) {
    const endpoint = getApiEndpoint();
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      // Offline / statik çalışırken sessizce yut
    }
  }

  // Sayfa Adını Çözümleme
  function getNormalizedPageName() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('basvuru')) return 'Başvuru Formu';
    if (path.includes('hizmetler')) return 'Hizmetlerimiz';
    if (path.includes('hakkimizda')) return 'Hakkımızda';
    if (path.includes('iletisim')) return 'İletişim';
    if (path.includes('driver-panel')) return 'Sürücü Masası';
    if (path.includes('login')) return 'Giriş Ekranı';
    return 'Ana Sayfa';
  }

  // Kalıcı Çerez Yardımcıları
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

  // 1. ZİYARETÇİ VE OTURUM KURULUMU (Otomatik Ziyaretçi Kaydı)
  function initVisitorAndSession() {
    let isNewVisitor = false;
    let vid = null;
    try {
      vid = localStorage.getItem(VISITOR_KEY) || getCookie(VISITOR_KEY);
      if (!vid) {
        vid = 'VID-' + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem(VISITOR_KEY, vid);
        setCookie(VISITOR_KEY, vid, 365);
        isNewVisitor = true;
      } else {
        // Eşitle
        localStorage.setItem(VISITOR_KEY, vid);
        setCookie(VISITOR_KEY, vid, 365);
      }
    } catch (e) {}

    let isNewSession = false;
    let sessionStart = null;
    try {
      const existingSession = sessionStorage.getItem(SESSION_KEY);
      if (!existingSession) {
        const sid = 'SESS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem(SESSION_KEY, sid);
        sessionStart = Date.now();
        sessionStorage.setItem(SESSION_START_KEY, sessionStart.toString());
        isNewSession = true;
      } else {
        sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now());
      }
    } catch (e) {
      sessionStart = Date.now();
    }

    // Metrikleri Güncelle
    const data = getAnalyticsData();
    data.totalPageviews = (data.totalPageviews || 0) + 1;
    if (isNewVisitor) {
      data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
    }
    if (isNewSession) {
      data.totalVisitors = (data.totalVisitors || 0) + 1;
    }

    const pageName = getNormalizedPageName();
    if (!data.pages) data.pages = {};
    if (!data.pages[pageName]) {
      data.pages[pageName] = { path: window.location.pathname, views: 0, durationSeconds: 0, avgDurationSeconds: 0 };
    }
    data.pages[pageName].views = (data.pages[pageName].views || 0) + 1;

    saveAnalyticsData(data);
    return { vid, isNewSession, sessionStart };
  }

  // 2. ORTALAMA SÜRE VE SAYFA BAŞI SÜRE TAKİBİ
  let pageEnterTime = Date.now();
  let accumulatedActiveSeconds = 0;
  let heartbeatInterval = null;

  function recordPageTime() {
    if (document.visibilityState !== 'visible') return;
    accumulatedActiveSeconds += 5;

    const data = getAnalyticsData();
    data.totalDurationSeconds = (data.totalDurationSeconds || 0) + 5;
    if (data.totalVisitors > 0) {
      data.averageDurationSeconds = Math.round(data.totalDurationSeconds / data.totalVisitors);
    }

    const pageName = getNormalizedPageName();
    if (!data.pages[pageName]) {
      data.pages[pageName] = { path: window.location.pathname, views: 1, durationSeconds: 0, avgDurationSeconds: 0 };
    }
    data.pages[pageName].durationSeconds = (data.pages[pageName].durationSeconds || 0) + 5;
    const views = Math.max(1, data.pages[pageName].views || 1);
    data.pages[pageName].avgDurationSeconds = Math.round(data.pages[pageName].durationSeconds / views);

    saveAnalyticsData(data, false); // Heartbeat'i her seferinde broadcast ile boğmamak için false
  }

  function startDurationTracker() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(recordPageTime, 5000);

    // Sekmeden ayrılırken kalan süreyi işle
    const flushTime = () => {
      const now = Date.now();
      const diffSec = Math.round((now - pageEnterTime) / 1000);
      if (diffSec > 0 && diffSec < 86400) {
        // En son farkı kaydet
        const data = getAnalyticsData();
        data.lastUpdated = Date.now();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
      }
    };

    window.addEventListener('beforeunload', flushTime);
    window.addEventListener('pagehide', flushTime);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushTime();
      } else {
        pageEnterTime = Date.now();
      }
    });
  }

  // 3. "NE KADAR SÜREDE BAŞVURUYA TIKLADIKLARI" DÖNÜŞÜM TAKİBİ
  function trackApplyConversion(targetEl) {
    let sessionStart = null;
    try {
      sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY));
      // Eğer bu oturumda zaten başvuru tıklaması kaydedildiyse tekrar sayma (tekilleştirme)
      const alreadyApplied = sessionStorage.getItem(SESSION_APPLIED_KEY);
      if (alreadyApplied) return;
      sessionStorage.setItem(SESSION_APPLIED_KEY, 'true');
    } catch (e) {}

    if (!sessionStart) sessionStart = Date.now() - 30000; // Varsayılan 30 sn
    let elapsedSeconds = Math.round((Date.now() - sessionStart) / 1000);
    if (elapsedSeconds < 3) elapsedSeconds = 3; // Minimum 3 saniye mantıklı sınır
    if (elapsedSeconds > 7200) elapsedSeconds = 7200; // 2 saat tavan

    const pageName = getNormalizedPageName();
    let label = 'Başvuru Butonu';
    if (targetEl) {
      label = targetEl.getAttribute('data-path') || targetEl.innerText?.trim() || targetEl.id || 'Başvuru Butonu';
      if (label.length > 30) label = label.substring(0, 30) + '...';
    }

    const data = getAnalyticsData();
    if (!data.conversions) {
      data.conversions = {
        totalApplyClicks: 0,
        totalApplyClickTimeSeconds: 0,
        avgApplyClickTimeSeconds: 0,
        clickDistribution: { '0-30s': 0, '30-60s': 0, '1-2m': 0, '2-5m': 0, '5m+': 0 },
        recentClicks: []
      };
    }

    data.conversions.totalApplyClicks = (data.conversions.totalApplyClicks || 0) + 1;
    data.conversions.totalApplyClickTimeSeconds = (data.conversions.totalApplyClickTimeSeconds || 0) + elapsedSeconds;
    data.conversions.avgApplyClickTimeSeconds = Math.round(data.conversions.totalApplyClickTimeSeconds / data.conversions.totalApplyClicks);

    // Süre Aralığına Dağıt
    let bucket = '0-30s';
    if (elapsedSeconds > 300) bucket = '5m+';
    else if (elapsedSeconds > 120) bucket = '2-5m';
    else if (elapsedSeconds > 60) bucket = '1-2m';
    else if (elapsedSeconds > 30) bucket = '30-60s';

    if (!data.conversions.clickDistribution) {
      data.conversions.clickDistribution = { '0-30s': 0, '30-60s': 0, '1-2m': 0, '2-5m': 0, '5m+': 0 };
    }
    data.conversions.clickDistribution[bucket] = (data.conversions.clickDistribution[bucket] || 0) + 1;

    // Son Başvuru Tıklama Loguna Ekle
    const clickLog = {
      id: 'CLK-' + Math.floor(100 + Math.random() * 900),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('tr-TR'),
      seconds: elapsedSeconds,
      page: pageName,
      label: label
    };

    if (!Array.isArray(data.conversions.recentClicks)) {
      data.conversions.recentClicks = [];
    }
    data.conversions.recentClicks.unshift(clickLog);
    data.conversions.recentClicks = data.conversions.recentClicks.slice(0, 25);

    saveAnalyticsData(data, true);

    console.log(`🎯 [ATS Trafik Takibi] Başvuru Tıklaması Kaydedildi: ${elapsedSeconds} saniye sonra tıklandı (${pageName} -> ${label})`);
  }

  // Başvuru Butonlarını ve Formlarını Dinleme
  function setupApplyClickListeners() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('a, button, [data-path]');
      if (!target) return;

      const href = (target.getAttribute('href') || '').toLowerCase();
      const text = (target.innerText || '').toLowerCase();
      const dataPath = (target.getAttribute('data-path') || '').toLowerCase();

      const isApplyAction = 
        href.includes('basvuru') ||
        href.includes('#hizli-basvuru') ||
        dataPath === 'hemen-basvur' ||
        text.includes('başvur') ||
        text.includes('kayıt formunu') ||
        text.includes('başvuruyu tamamla');

      if (isApplyAction) {
        trackApplyConversion(target);
      }
    }, true);

    // Hızlı Başvuru Formu Gönderimi
    const quickForm = document.getElementById('onBasvuruForm');
    if (quickForm) {
      quickForm.addEventListener('submit', function () {
        trackApplyConversion(quickForm);
      });
    }

    // Kapsamlı Başvuru Formu
    const mainForm = document.getElementById('mainBasvuruForm') || document.querySelector('form[action*="basvuru"]');
    if (mainForm) {
      mainForm.addEventListener('submit', function () {
        trackApplyConversion(mainForm);
      });
    }
  }

  // 4. ÇEREZ İZNİ OLAYI KAYDI
  window.recordCookieConsentEvent = function (isAcceptedAll) {
    const data = getAnalyticsData();
    if (!data.cookieConsent) data.cookieConsent = { accepted: 0, necessaryOnly: 0 };
    if (isAcceptedAll) {
      data.cookieConsent.accepted = (data.cookieConsent.accepted || 0) + 1;
    } else {
      data.cookieConsent.necessaryOnly = (data.cookieConsent.necessaryOnly || 0) + 1;
    }
    saveAnalyticsData(data, true);
  };

  // 5. VERİLERİ SIFIRLAMA FONKSİYONU
  window.resetTrafficAnalytics = function () {
    const fresh = getDefaultData();
    fresh.totalVisitors = 0;
    fresh.uniqueVisitors = 0;
    fresh.totalPageviews = 0;
    fresh.totalDurationSeconds = 0;
    fresh.averageDurationSeconds = 0;
    fresh.bounceCount = 0;
    Object.keys(fresh.pages).forEach(k => {
      fresh.pages[k].views = 0;
      fresh.pages[k].durationSeconds = 0;
      fresh.pages[k].avgDurationSeconds = 0;
    });
    fresh.conversions.totalApplyClicks = 0;
    fresh.conversions.totalApplyClickTimeSeconds = 0;
    fresh.conversions.avgApplyClickTimeSeconds = 0;
    fresh.conversions.clickDistribution = { '0-30s': 0, '30-60s': 0, '1-2m': 0, '2-5m': 0, '5m+': 0 };
    fresh.conversions.recentClicks = [];
    fresh.cookieConsent = { accepted: 0, necessaryOnly: 0 };

    saveAnalyticsData(fresh, true);
    return fresh;
  };

  // Genel API Dışa Aktarımı
  window.atsAnalytics = {
    getData: getAnalyticsData,
    saveData: saveAnalyticsData,
    resetData: window.resetTrafficAnalytics,
    trackApply: trackApplyConversion
  };

  // Admin panelinde miyiz kontrolü (Admin panelinde ziyaretçi sayacı çalıştırmıyoruz)
  const isAdmin = window.location.pathname.includes('admin-panel');
  if (!isAdmin) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initVisitorAndSession();
        startDurationTracker();
        setupApplyClickListeners();
      });
    } else {
      initVisitorAndSession();
      startDurationTracker();
      setupApplyClickListeners();
    }
  }

})();
