/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - GLOBAL CLOUD DATABASE & REALTIME SYNC ENGINE
   ========================================================================== */

(function () {
  'use strict';

  // High-availability Global Cloud Object ID (CORS-enabled REST API)
  const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a15eb4ec723fea';

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
  window.isCloudSyncActive = false;

  // Cross-Tab Real-time Broadcast Channel
  const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ats_portal_sync') : null;

  window.broadcastApplication = function(app) {
    if (broadcastChannel && app) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATION_SUBMITTED', data: app });
      } catch(e){}
    }
  };

  // 1. PUSH APPLICATIONS TO GLOBAL CLOUD DATABASE & LOCAL STORAGE
  window.syncApplicationsToCloud = async function (appsList) {
    if (!appsList || !Array.isArray(appsList)) return;
    const cleanList = appsList.filter(isRealApplication);

    // 1. Immediate localStorage update
    try {
      localStorage.setItem('ats_applications', JSON.stringify(cleanList));
    } catch(e){}

    // 2. Broadcast custom event across current window
    try {
      window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: cleanList }));
    } catch(e){}

    // 3. Broadcast across tabs via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'APPLICATIONS_SYNCED', data: cleanList });
      } catch(e){}
    }

    // 4. Send to Global Cloud REST API (asynchronous, non-blocking)
    try {
      const payload = {
        name: 'ats_applications_global',
        data: {
          list: cleanList,
          lastUpdated: new Date().toISOString()
        }
      };

      const res = await fetch(CLOUD_OBJECT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        window.isCloudSyncActive = true;
        console.log('☁️ [Cloud-DB] Senkronize Edildi:', cleanList.length, 'başvuru');
      }
    } catch (err) {
      // Cloud warning; local storage and BroadcastChannel remain fully active
    }
  };

  // 2. FETCH LATEST APPLICATIONS FROM GLOBAL CLOUD DATABASE
  window.fetchApplicationsFromCloud = async function () {
    try {
      const res = await fetch(CLOUD_OBJECT_URL + '?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        const rawCloudList = json && json.data && Array.isArray(json.data.list) ? json.data.list : null;

        if (rawCloudList !== null) {
          const cloudList = rawCloudList.filter(isRealApplication);

          // Merge local and cloud applications
          let localApps = [];
          try {
            const str = localStorage.getItem('ats_applications');
            if (str) {
              const parsed = JSON.parse(str);
              if (Array.isArray(parsed)) {
                localApps = parsed.filter(isRealApplication);
              }
            }
          } catch(e){}

          const mergedMap = new Map();
          // Cloud entries
          cloudList.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key) mergedMap.set(key, a);
          });
          // Local real entries not yet in cloud
          localApps.forEach(a => {
            const key = a.id || a.referenceNumber;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, a);
            }
          });

          const mergedApps = Array.from(mergedMap.values());

          try {
            localStorage.setItem('ats_applications', JSON.stringify(mergedApps));
          } catch(e){}

          // If local had new items, push merged to cloud
          if (mergedApps.length > cloudList.length) {
            window.syncApplicationsToCloud(mergedApps);
          }

          window.isCloudSyncActive = true;
          window.dispatchEvent(new CustomEvent('ats_applications_updated', { detail: mergedApps }));
          return mergedApps;
        }
      }
    } catch (err) {
      // Offline fallback
    }

    // Fallback to local storage
    try {
      const str = localStorage.getItem('ats_applications');
      if (str) {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed.filter(isRealApplication) : [];
      }
      return [];
    } catch(e){
      return [];
    }
  };

  // 3. CONVENIENCE METHOD TO ADD APPLICATION
  window.addApplication = async function (appData) {
    if (!appData || !appData.id) return;
    let apps = [];
    try {
      const str = localStorage.getItem('ats_applications');
      if (str) {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) apps = parsed.filter(isRealApplication);
      }
    } catch(e){}

    const key = appData.id || appData.referenceNumber;
    const idx = apps.findIndex(a => (a.id || a.referenceNumber) === key);
    if (idx !== -1) {
      apps[idx] = appData;
    } else {
      apps.unshift(appData);
    }

    await window.syncApplicationsToCloud(apps);
    window.broadcastApplication(appData);
    return apps;
  };

  // Auto-Fetch on load
  document.addEventListener('DOMContentLoaded', function () {
    window.fetchApplicationsFromCloud();
  });

})();
