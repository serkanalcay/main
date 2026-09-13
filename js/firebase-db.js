/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - GOOGLE FIREBASE REALTIME & FIRESTORE CORE DB
   ========================================================================== */

(function () {
  'use strict';

  // 1. FIREBASE CONFIGURATION (Google Firebase Web App Configuration)
  // Siz kendi Firebase Konsolunuzdan (console.firebase.google.com) aldığınız 
  // proje ayarlarını buraya yapıştırabilirsiniz.
  const firebaseConfig = {
    apiKey: "AIzaSyB_ATS_PORTAL_FIREBASE_KEY_2026",
    authDomain: "avrupatirsoforu.firebaseapp.com",
    projectId: "avrupatirsoforu-db",
    storageBucket: "avrupatirsoforu-db.appspot.com",
    messagingSenderId: "987654321012",
    appId: "1:987654321012:web:a1b2c3d4e5f6g7h8i9j0"
  };

  let db = null;
  let isFirebaseReady = false;

  // 2. INITIALIZE FIREBASE & FIRESTORE
  window.initFirebaseDB = function () {
    if (typeof firebase !== 'undefined' && firebase.apps) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        
        // Enable offline persistence so data is cached locally even offline
        db.enablePersistence({ synchronizeTabs: true }).catch(err => {
          // Silent catch for persistence warnings in multi-tab edge cases
        });

        isFirebaseReady = true;
        console.log("🔥 Google Firebase Firestore veritabanı başarıyla bağlandı!");
      } catch (err) {
        console.warn("Firebase bağlantı uyarısı (fallback modu aktif):", err.message);
      }
    }
  };

  // 3. FIRESTORE APPLICATIONS CRUD OPERATIONS
  
  // Save or Update an Application in Firebase Firestore
  window.saveATSApplicationToFirebase = async function (appData) {
    if (!appData || !appData.id) return;
    
    // Always save to localStorage immediately for instant local UI responsiveness
    let apps = window.getATSApplications ? window.getATSApplications() : [];
    const idx = apps.findIndex(a => a && a.id === appData.id);
    if (idx !== -1) {
      apps[idx] = appData;
    } else {
      apps.unshift(appData);
    }
    try { localStorage.setItem('ats_applications', JSON.stringify(apps)); } catch(e){}

    // Save to Firestore
    if (isFirebaseReady && db) {
      try {
        const docRefId = String(appData.id).replace(/[^a-zA-Z0-9_-]/g, '_');
        await db.collection('ats_applications').doc(docRefId).set(appData, { merge: true });
        console.log("🔥 Firebase Firestore: Başvuru senkronize edildi ->", appData.id);
      } catch (e) {
        console.warn("Firestore kaydetme hatası:", e.message);
      }
    }
  };

  // Fetch All Applications from Firestore
  window.fetchATSApplicationsFromFirebase = async function () {
    if (isFirebaseReady && db) {
      try {
        const snapshot = await db.collection('ats_applications').get();
        if (!snapshot.empty) {
          const apps = [];
          snapshot.forEach(doc => {
            apps.push(doc.data());
          });
          if (apps.length > 0) {
            localStorage.setItem('ats_applications', JSON.stringify(apps));
            return apps;
          }
        }
      } catch (e) {
        console.warn("Firestore okuma hatası:", e.message);
      }
    }
    // Fallback to localStorage
    return window.getATSApplications ? window.getATSApplications() : [];
  };

  // Listen Real-time Changes in Applications from Firestore
  window.listenATSApplications = function (onUpdateCallback) {
    if (isFirebaseReady && db) {
      try {
        return db.collection('ats_applications').onSnapshot(snapshot => {
          const apps = [];
          snapshot.forEach(doc => {
            apps.push(doc.data());
          });
          if (apps.length > 0) {
            localStorage.setItem('ats_applications', JSON.stringify(apps));
            if (typeof onUpdateCallback === 'function') {
              onUpdateCallback(apps);
            }
          }
        }, err => {
          console.warn("Realtime dinleme uyarısı:", err.message);
        });
      } catch(e){}
    }
    return null;
  };

  // Delete an Application from Firestore
  window.deleteATSApplicationFromFirebase = async function (appId) {
    if (!appId) return;

    // Delete from localStorage
    let apps = window.getATSApplications ? window.getATSApplications() : [];
    apps = apps.filter(a => a && a.id !== appId);
    try { localStorage.setItem('ats_applications', JSON.stringify(apps)); } catch(e){}

    // Delete from Firestore
    if (isFirebaseReady && db) {
      try {
        const docRefId = String(appId).replace(/[^a-zA-Z0-9_-]/g, '_');
        await db.collection('ats_applications').doc(docRefId).delete();
        console.log("🔥 Firebase Firestore: Başvuru silindi ->", appId);
      } catch(e){}
    }
  };

  // 4. FIRESTORE MESSAGING OPERATIONS
  window.saveATSMessageToFirebase = async function (appId, messageData) {
    if (!appId || !messageData) return;

    const docRefId = String(appId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const localKey = 'ats_messages_' + appId;
    
    let msgs = [];
    try {
      const stored = localStorage.getItem(localKey);
      if (stored) msgs = JSON.parse(stored);
    } catch(e){}
    
    msgs.push(messageData);
    try { localStorage.setItem(localKey, JSON.stringify(msgs)); } catch(e){}

    if (isFirebaseReady && db) {
      try {
        await db.collection('ats_messages').doc(docRefId).collection('history').add(messageData);
        console.log("🔥 Firebase Firestore: Mesaj gönderildi ->", appId);
      } catch(e){}
    }
  };

  window.listenATSMessages = function (appId, onUpdateCallback) {
    if (isFirebaseReady && db && appId) {
      try {
        const docRefId = String(appId).replace(/[^a-zA-Z0-9_-]/g, '_');
        return db.collection('ats_messages').doc(docRefId).collection('history')
          .orderBy('time', 'asc')
          .onSnapshot(snapshot => {
            const msgs = [];
            snapshot.forEach(doc => msgs.push(doc.data()));
            if (msgs.length > 0) {
              localStorage.setItem('ats_messages_' + appId, JSON.stringify(msgs));
              if (typeof onUpdateCallback === 'function') {
                onUpdateCallback(msgs);
              }
            }
          }, err => {});
      } catch(e){}
    }
    return null;
  };

  // 5. FIRESTORE CMS & LIVE SETTINGS OPERATIONS
  window.saveCMSDataToFirebase = async function (cmsData) {
    if (!cmsData) return;
    try { localStorage.setItem('cms_settings', JSON.stringify(cmsData)); } catch(e){}

    if (isFirebaseReady && db) {
      try {
        await db.collection('ats_settings').doc('cms').set(cmsData, { merge: true });
        console.log("🔥 Firebase Firestore: CMS Ayarları kaydedildi");
      } catch(e){}
    }
  };

  window.fetchCMSDataFromFirebase = async function () {
    if (isFirebaseReady && db) {
      try {
        const doc = await db.collection('ats_settings').doc('cms').get();
        if (doc.exists) {
          const cmsData = doc.data();
          localStorage.setItem('cms_settings', JSON.stringify(cmsData));
          return cmsData;
        }
      } catch(e){}
    }
    try {
      const stored = localStorage.getItem('cms_settings');
      if (stored) return JSON.parse(stored);
    } catch(e){}
    return null;
  };

  // Auto-Initialize Firebase DB when SDK loads
  document.addEventListener('DOMContentLoaded', function () {
    window.initFirebaseDB();
  });

})();
