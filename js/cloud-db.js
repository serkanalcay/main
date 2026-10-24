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

  // Simulation & Mock Candidate Identifiers to Permanently Filter Out
  const SIMULATION_IDS = new Set([
    'TR-2024-0981', 'TR-2024-0980', 'TR-2024-0979', 'TR-2024-0978',
    'TR-2024-0977', 'TR-2024-0976', 'TR-2024-0975', 'TR-2024-0974',
    'AVR-8492', 'AVR-8488', 'AVR-8480', 'AVR-8472', 'AVR-8461', 'AVR-8455', 'AVR-8449',
    'AVR-5435', 'AVR-2026-9999', 'AVR-2026-9700'
  ]);

  const SIMULATION_NAMES = new Set([
    'murat demir', 'emre korkmaz', 'serkan yıldız', 'serkan yildiz',
    'halil ibrahim taş', 'halil ibrahim tas', 'cemil özkan', 'cemil ozkan',
    'oğuzhan aydın', 'oguzhan aydin', 'bülent şimşek', 'bulent simsek',
    'ahmet yilmaz', 'ahmet yılmaz', 'can polat', 'aaaa'
  ]);

  // Persistent Tombstone List (Deleted IDs must NEVER return)
  function getDeletedIdsList() {
    try {
      const stored = localStorage.getItem('ats_deleted_ids');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch(e) {
      return [];
    }
  }

  function markIdAsDeleted(id) {
    if (!id) return;
    try {
      const list = getDeletedIdsList();
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('ats_deleted_ids', JSON.stringify(list));
      }
    } catch(e) {}
  }

  window.getDeletedApplicationIds = getDeletedIdsList;
  window.markApplicationDeleted = markIdAsDeleted;

  function isRealApplication(a) {
    if (!a || typeof a !== 'object') return false;
    const id = a.id || a.referenceNumber || '';
    if (!id) return false;
    if (SIMULATION_IDS.has(id)) return false;

    const delList = getDeletedIdsList();
    if (delList.includes(id) || (a.referenceNumber && delList.includes(a.referenceNumber))) {
      return false;
    }

    const name = (a.fullName || '').trim().toLowerCase();
    if (SIMULATION_NAMES.has(name)) return false;

    return true;
  }

  window.isRealApplication = isRealApplication;
  window.isHostingDbActive = true;
  window.getHostingApiEndpoint = getApiEndpoint;

  // Cross-Tab Real-time Broadcast Channel
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
    if (!appData || !isRealApplication(appData)) return false;
    const endpoint = getApiEndpoint();

    // 1. Anında yerel localStorage'a ekle
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
      return res.ok;
    } catch (err) {
      return false;
    }
  };

  // 2. TÜM LİSTEYİ SENKRONİZE ET
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
          // Sunucudaki simülasyon veya daha önce silinmiş kayıtları otomatik temizle
          serverList.forEach(item => {
            if (item && !isRealApplication(item)) {
              const simId = item.id || item.referenceNumber;
              if (simId) {
                // Sunucudan kalıcı olarak sil
                fetch(getApiEndpoint() + '?id=' + encodeURIComponent(simId), { method: 'DELETE' }).catch(() => {});
              }
            }
          });

          const cleanServerList = serverList.filter(isRealApplication);

          // Yerel depodaki kayıtları temizle
          let localApps = [];
          try {
            const str = localStorage.getItem('ats_applications');
            if (str) {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) localApps = parsed.filter(isRealApplication);
            }
          } catch(e){}

          const mergedMap = new Map();
          cleanServerList.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key) mergedMap.set(key, a);
          });
          localApps.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, a);
              window.saveApplicationToHosting(a);
            }
          });

          const mergedList = Array.from(mergedMap.values()).filter(isRealApplication);
          try {
            localStorage.setItem('ats_applications', JSON.stringify(mergedList));
          } catch(e){}

          window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: mergedList }));
          return mergedList;
        }
      }
    } catch (err) {}

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

  // 4. HOSTING ÜZERİNDE BAŞVURU GÜNCELLE (PUT)
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
    markIdAsDeleted(appId);

    // Yerel depodan ve bellekten derhal kaldır
    try {
      const str = localStorage.getItem('ats_applications');
      if (str) {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => a && (a.id || a.referenceNumber) !== appId);
          localStorage.setItem('ats_applications', JSON.stringify(filtered));
          window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: filtered }));
        }
      }
    } catch(e) {}

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATION_DELETED', id: appId });
      } catch(e){}
    }

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

  // 6. TÜM VERİLERİ SIFIRLA
  window.clearAllApplicationsFromHosting = async function () {
    try {
      localStorage.setItem('ats_applications', JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: [] }));
    } catch(e) {}

    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATIONS_CLEARED' });
      } catch(e){}
    }

    const endpoint = getApiEndpoint() + '?action=clear_all';
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
