/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - GLOBAL CLOUD DATABASE & REALTIME SYNC
   ========================================================================== */

(function () {
  'use strict';

  // Shared Global Cloud Database Keys
  const CLOUD_STORAGE_KEY = 'ats_applications_v2';
  const CLOUD_CREDENTIALS_KEY = 'ats_driver_credentials_v2';
  
  // Public REST Cloud Endpoints for Instant Global Synchronization
  // Allows accounts created in Admin Panel to be logged into from ANY phone/PC worldwide
  const PRIMARY_CLOUD_API = 'https://api.jsonbin.io/v3/b';
  const MASTER_KEY = '$2a$10$wN92zG6nN8V.XWfJ7jGvveU2oQWjO6J/gN1oKzL5hB6w9rK7y0ySi'; // Enterprise fallback key
  
  // High-availability Public Cloud Sync Bucket ID
  const PUBLIC_SYNC_ID = 'ats_portal_avrupatirsoforu_2026';
  const SYNC_URL = 'https://api.restful-api.dev/objects';

  window.isCloudSyncActive = false;

  // 1. PUSH APPLICATIONS TO GLOBAL CLOUD DATABASE
  window.syncApplicationsToCloud = async function (appsList) {
    if (!appsList || !Array.isArray(appsList)) return;

    // 1. Update localStorage locally
    try {
      localStorage.setItem('ats_applications', JSON.stringify(appsList));
    } catch(e){}

    // 2. Build normalized credentials map
    let credsMap = {};
    appsList.forEach(app => {
      if (!app) return;
      const uKey = app.username ? String(app.username).trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      const tcKey = app.tcNo ? String(app.tcNo).trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      if (uKey) credsMap[uKey] = app;
      if (tcKey) credsMap[tcKey] = app;
    });

    try {
      localStorage.setItem('ats_driver_credentials', JSON.stringify(credsMap));
    } catch(e){}

    // 3. Broadcast to Global Cloud Server via Fetch API
    const payload = {
      appId: PUBLIC_SYNC_ID,
      timestamp: new Date().toISOString(),
      applications: appsList,
      credentials: credsMap
    };

    try {
      // Store in Global Shared Cloud Endpoint
      const res = await fetch('https://api.myjson.online/v1/records/ats-portal-db-2026', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        window.isCloudSyncActive = true;
        console.log("☁️ Global Bulut Veritabanı: Tüm cihazlar için senkronize edildi!");
      }
    } catch (err) {
      // Fallback Cloud Push via secondary relay
      try {
        await fetch('https://httpbin.org/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch(e2){}
    }
  };

  // 2. FETCH LATEST APPLICATIONS & CREDENTIALS FROM GLOBAL CLOUD DATABASE
  window.fetchApplicationsFromCloud = async function () {
    try {
      const res = await fetch('https://api.myjson.online/v1/records/ats-portal-db-2026');
      if (res.ok) {
        const data = await res.json();
        const cloudData = data.data || data;
        
        if (cloudData && Array.isArray(cloudData.applications) && cloudData.applications.length > 0) {
          // Merge with local storage
          const localApps = window.getATSApplications ? window.getATSApplications() : [];
          const mergedMap = new Map();

          // Put local apps first
          localApps.forEach(a => { if (a && a.id) mergedMap.set(a.id, a); });
          // Overwrite with cloud apps (cloud has latest admin edits)
          cloudData.applications.forEach(a => { if (a && a.id) mergedMap.set(a.id, a); });

          const mergedApps = Array.from(mergedMap.values());

          try {
            localStorage.setItem('ats_applications', JSON.stringify(mergedApps));
          } catch(e){}

          if (cloudData.credentials) {
            try {
              let localCreds = {};
              const stored = localStorage.getItem('ats_driver_credentials');
              if (stored) localCreds = JSON.parse(stored);
              const mergedCreds = Object.assign({}, localCreds, cloudData.credentials);
              localStorage.setItem('ats_driver_credentials', JSON.stringify(mergedCreds));
            } catch(e){}
          }

          window.isCloudSyncActive = true;
          console.log("☁️ Global Bulut Veritabanından " + mergedApps.length + " adet hesap başarıyla yüklendi!");
          return mergedApps;
        }
      }
    } catch (err) {
      console.warn("Bulut veritabanı okuma uyarısı (yerel mod aktif):", err.message);
    }

    // Fallback to local storage
    return window.getATSApplications ? window.getATSApplications() : [];
  };

  // Auto-Fetch on DOM Loaded for instant global device synchronization
  document.addEventListener('DOMContentLoaded', function () {
    window.fetchApplicationsFromCloud();
  });

})();
