/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - KENDİ HOSTING VERİTABANI SENKRONİZASYON MOTORU
   ========================================================================== */

(function () {
  'use strict';

  // Canlı Hosting API Adresi Belirleme
  function getApiEndpoint() {
    if (typeof window !== 'undefined' && window.location) {
      // Eğer avrupatirsoforu.com üzerinde çalışıyorsa bağıl URL kullan
      if (window.location.host && window.location.host.includes('avrupatirsoforu.com')) {
        return window.location.origin + '/api/applications.php';
      }
    }
    // Localhost, file:/// veya harici ortamlar için canlı endpoint
    return 'https://avrupatirsoforu.com/api/applications.php';
  }

  const SEED_IDS = new Set([
    'TR-2024-0981', 'TR-2024-0980', 'TR-2024-0979', 'TR-2024-0978',
    'TR-2024-0977', 'TR-2024-0976', 'TR-2024-0975', 'TR-2024-0974'
  ]);

  function isRealApplication(a) {
    if (!a || typeof a !== 'object') return false;
    const id = a.id || a.referenceNumber || '';
    if (!id) return false;
    if (SEED_IDS.has(id)) return false;
    return true;
  }

  window.isRealApplication = isRealApplication;
  window.isHostingDbActive = true;
  window.getHostingApiEndpoint = getApiEndpoint;

  // Cross-Tab Real-time Broadcast Channel (Aynı cihazdaki açık sekmeler için 0ms senkron)
  const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ats_portal_sync') : null;

  window.broadcastApplication = function(app) {
    if (broadcastChannel && app) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATION_SUBMITTED', data: app });
      } catch(e){}
    }
  };

  // 1. TEKİL BAŞVURUYU KENDİ HOSTİNG VERİTABANINA GÖNDER (POST)
  window.saveApplicationToHosting = async function (appData) {
    if (!appData) return false;
    const endpoint = getApiEndpoint();

    // 1. Anında yerel localStorage'a ekle (Hızlı UI tepkisi)
    try {
      let localApps = [];
      const str = localStorage.getItem('ats_applications');
      if (str) {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) localApps = parsed.filter(isRealApplication);
      }
      const appId = appData.id || appData.referenceNumber;
      const idx = localApps.findIndex(a => (a.id || a.referenceNumber) === appId);
      if (idx !== -1) {
        localApps[idx] = appData;
      } else {
        localApps.unshift(appData);
      }
      localStorage.setItem('ats_applications', JSON.stringify(localApps));
      window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: localApps }));
    } catch (e) {}

    // 2. Sekmeler arası yayınla
    window.broadcastApplication(appData);

    // 3. Kendi Hosting API'sine POST isteği at
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(appData)
      });

      if (res.ok) {
        const json = await res.json();
        console.log('✅ [Hosting DB] Başvuru başarıyla hosting veritabanına kaydedildi:', json);
        return true;
      } else {
        console.warn('⚠️ [Hosting DB] API Yanıt Hatası:', res.status);
      }
    } catch (err) {
      console.warn('⚠️ [Hosting DB] İletişim Hatası (Hosting API):', err.message);
    }
    return false;
  };

  // 2. TÜM LİSTEYİ SENKRONİZE ET (Geriye Dönük Uyumluluk)
  window.syncApplicationsToCloud = async function (appsList) {
    if (!appsList) return;
    const items = Array.isArray(appsList) ? appsList : [appsList];
    const cleanList = items.filter(isRealApplication);

    try {
      localStorage.setItem('ats_applications', JSON.stringify(cleanList));
      window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: cleanList }));
    } catch(e){}

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATIONS_SYNCED', data: cleanList });
      } catch(e){}
    }

    // En son eklenen başvuru varsa hostinge gönder
    if (cleanList.length > 0) {
      const latest = cleanList[0];
      return window.saveApplicationToHosting(latest);
    }
  };

  // 3. HOSTİNG VERİTABANINDAN TÜM BAŞVURULARI ÇEK (GET)
  window.fetchApplicationsFromCloud = async function () {
    const endpoint = getApiEndpoint() + '?t=' + Date.now();
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        const serverList = (json && Array.isArray(json.data)) ? json.data : (Array.isArray(json) ? json : null);

        if (serverList !== null) {
          const cleanServerList = serverList.filter(isRealApplication);

          // Yerel depodaki yeni kayıtlarla sunucu kayıtlarını harmanla
          let localApps = [];
          try {
            const str = localStorage.getItem('ats_applications');
            if (str) {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) localApps = parsed.filter(isRealApplication);
            }
          } catch(e){}

          const mergedMap = new Map();
          // Sunucudan gelenleri ekle
          cleanServerList.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key) mergedMap.set(key, a);
          });
          // Henüz sunucuya gitmemiş yerel kayıtları koru
          localApps.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, a);
              // Sunucuya da asenkron kaydet
              window.saveApplicationToHosting(a);
            }
          });

          const mergedList = Array.from(mergedMap.values());
          try {
            localStorage.setItem('ats_applications', JSON.stringify(mergedList));
          } catch(e){}

          window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: mergedList }));
          console.log('📥 [Hosting DB] Veriler güncellendi:', mergedList.length, 'başvuru');
          return mergedList;
        }
      }
    } catch (err) {
      console.warn('⚠️ [Hosting DB] Veri çekme uyarısı:', err.message);
    }

    // Fallback: Yerel depoyu dön
    try {
      const str = localStorage.getItem('ats_applications');
      if (str) {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed.filter(isRealApplication) : [];
      }
    } catch(e){}
    return [];
  };

  // 4. HOSTING ÜZERİNDE BAŞVURU GÜNCELLE (PUT - Statü/Onay Değişikliği)
  window.updateApplicationOnHosting = async function (appData) {
    if (!appData || (!appData.id && !appData.referenceNumber)) return false;
    const endpoint = getApiEndpoint();

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(appData)
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  };

  // 5. HOSTING ÜZERİNDEN BAŞVURU SİL (DELETE)
  window.deleteApplicationFromHosting = async function (appId) {
    if (!appId) return false;
    const endpoint = getApiEndpoint() + '?id=' + encodeURIComponent(appId);

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      return res.ok;
    } catch(e) {
      return false;
    }
  };

  // Sayfa yüklendiğinde otomatik verileri kontrol et
  document.addEventListener('DOMContentLoaded', function () {
    window.fetchApplicationsFromCloud();
  });

})();
