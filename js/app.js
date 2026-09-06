/* ==========================================================================
   ALMANYATİRSOFORLUGU.COM - EXECUTIVE ADMIN & AUTH SYSTEM (ENTERPRISE EDITION)
   ========================================================================== */

// GLOBAL MODAL UTILITIES (Exposed immediately to avoid inline onclick reference errors)
window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    console.warn('Modal not found:', modalId);
  }
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.applyJob = function (jobTitle) {
  window.location.href = 'basvuru.html';
};

(function () {
  'use strict';

  // DEFAULT CONFIGURATIONS & SEEDS
  const DEFAULT_EURO_RATE = 56.0;

  const DEFAULT_SITE_SETTINGS = {
    bannerActive: true,
    bannerText: "📢 2026 Almanya TIR Şoförlüğü Vize ve İş Kontenjanları Açılmıştır!",
    whatsappPhone: "+90 532 000 0000",
    supportEmail: "destek@almanyatirsoforlugu.com",
    euroRate: 56.0,
    maintenanceMode: false,
    maintenanceMessage: "Sistemimiz altyapı güncellemeleri nedeniyle bakımdadır. Lütfen kısa süre sonra tekrar deneyiniz."
  };

  const DEFAULT_USERS = [
    {
      id: 'usr-admin',
      name: 'Sistem Yöneticisi (Admin)',
      email: 'admin@almanyatirsoforlugu.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      source: 'Sistem Yöneticisi',
      createdAt: '2026-08-01'
    },
    {
      id: 'usr-1',
      name: 'Mehmet Demir',
      email: 'mehmet.demir@gmail.com',
      password: 'mehmet123',
      role: 'driver',
      status: 'active',
      source: 'Başvuru Onayı',
      createdAt: '2026-08-20'
    }
  ];

  const DEFAULT_APPLICATIONS = [
    {
      id: 'app-1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@gmail.com',
      phone: '+90 532 111 2233',
      birthYear: '1988',
      passport: 'Evet',
      hasLicense: 'Var',
      licenseClasses: ['CE', 'C', 'C1'],
      hasSrc: 'Var',
      srcTypes: ['SRC 3', 'SRC 4'],
      hasAdr: 'Evet',
      experience: '5-9 Yıl',
      message: '10 yıldır Türkiye ve Avrupa hattında TIR şoförlüğü yapıyorum. Kod 95 eğitimi tamamlandı.',
      createdAt: '2026-09-04 14:30',
      status: 'pending'
    },
    {
      id: 'app-2',
      name: 'Mehmet Demir',
      email: 'mehmet.demir@gmail.com',
      phone: '+90 533 444 5566',
      birthYear: '1992',
      passport: 'Evet',
      hasLicense: 'Var',
      licenseClasses: ['CE', 'B'],
      hasSrc: 'Var',
      srcTypes: ['SRC 1', 'SRC 3', 'SRC 4'],
      hasAdr: 'Hayır',
      experience: '2-4 Yıl',
      message: 'Almanya vize başvuru evraklarım tamdır.',
      createdAt: '2026-09-02 10:15',
      status: 'approved',
      createdUserId: 'usr-1'
    }
  ];

  const DEFAULT_JOBS = [
    {
      id: 'job-1',
      title: 'Frankfurt & Münih Bölgesi CE Sınıfı TIR Şoförü',
      location: 'Frankfurt / Almanya',
      salary: '3.200 € - 3.800 € / Ay',
      license: 'CE Sınıfı',
      status: 'active',
      desc: 'Uluslararası lojistik filomuz için. Konaklama desteği, vize işlemleri ve Kod 95 eğitimi sağlanır.'
    },
    {
      id: 'job-2',
      title: 'Stuttgart Şehir İçi Ağır Vasıta Şoförü',
      location: 'Stuttgart / Almanya',
      salary: '2.900 € - 3.400 € / Ay',
      license: 'C / CE Sınıfı',
      status: 'active',
      desc: 'Günlük bölgesel dağıtım seferleri, akşam evde konaklama imkanı, günlük Spesen harcırah.'
    }
  ];

  const DEFAULT_ARTICLES = [
    {
      id: 'art-kod95-tr',
      title: '🚨 FLAŞ HABER: Almanya\'da Kod 95 Sınavlarında Türkçe Dil Desteği Dönemi Başladı!',
      slug: 'almanya-kod95-turkce-dil-destegi-2026',
      category: 'Mevzuat & Müjde',
      keywords: 'Almanya Türkçe Kod 95 sınavı, IHK Kod 95 Türkçe, Almanya TIR şoförü vize',
      metaDesc: 'Almanya Ulaştırma Bakanlığı ve IHK kararıyla ağır vasıta Kod 95 sınavlarında Türkçe dil desteği resmen başladı. Türk şoförler için Almanya kapıları ardına kadar açılıyor!',
      author: 'Başeditör Serkan / Lojistik Haber Merkezi',
      date: '2026-09-04',
      readTime: '7 Dk Okuma',
      images: [],
      content: `
        <div class="news-breaking-badge">⚡ ALMANYA LOJİSTİK SEKTÖRÜNDE TARİHİ ADIM</div>
        <h2>Türk Şoförleri İçin Devrim Niteliğinde Karar: Kod 95 Sınavı Artık Türkçe!</h2>
        <p>Almanya lojistik sektöründe uzun süredir yaşanan ağır vasıta sürücüsü krizini çözmek amacıyla Federal Ulaştırma ve Dijital Altyapı Bakanlığı (BMDV) ile Almanya Ticaret ve Sanayi Odaları (IHK) tarihi bir adıma imza attı. Yapılan resmi açıklamaya göre, AB standartlarındaki <strong>Kod 95 (Befähigungsnachweis) mesleki yeterlilik sınavlarında Türkçe dil desteği resmen sunulmaya başlandı!</strong></p>

        <div class="news-callout-gold">
          <h3>💡 Neden Bu Haber Bu Kadar Önemli?</h3>
          <p>Daha önce Almanca B1/B2 seviye şartı ve Almanca sınav zorunluluğu nedeniyle binlerce nitelikli ve tecrübeli Türk TIR şoförümüz Almanya vizesi ve iş onay süreçlerinde engellere takılıyordu. Bu tarihi kararla birlikte, yılların tecrübesine sahip Türk şoförlerimiz dil engelini tamamen aşarak doğrudan kendi ana dillerinde sınava girip Kod 95 belgesini alabilecekler.</p>
        </div>

        <h3>Kararın Detayları ve Sınav Formatı</h3>
        <p>Almanya genelindeki IHK (Industrie- und Handelskammer) sınav merkezlerinde uygulanacak yeni sistemde:</p>
        <ul>
          <li><strong>Ana Dilde Sınav Ekranı:</strong> Sınav sisteminde sorular ve tüm seçenekler Türkçe olarak görüntülenebilecek.</li>
          <li><strong>Terminoloji Destek Kılavuzu:</strong> Sürüş teknikleri, dijital takograf kullanımı, yük emniyeti, AETR sürüş/dinlenme süreleri ve ADR tehlikeli madde kuralları Türkçe ek açıklamalarla desteklenecek.</li>
          <li><strong>Hızlı Denklik & Muafiyet:</strong> Türkiye'den SRC 3 / SRC 4 belgesine sahip olan sürücüler, hızlandırılmış modül eğitimi sonrasında Türkçe sınavla doğrudan sertifikalandırılabilecek.</li>
        </ul>

        <h3>Almanya Nakliyeciler Derneği (BGL) Açıklaması</h3>
        <p>Almanya Karayolu Taşımacılığı ve Lojistik Federasyonu (BGL) yetkilileri kararı sevinçle karşıladı: <em>"Almanya lojistik pazarında şu anda 80.000'den fazla ağır vasıta sürücüsü açığı bulunmaktadır. Türkiye'deki TIR şoförleri uluslararası hatta kendisini kanıtlamış en disiplinli ve yetkin profesyonellerdir. Türkçe sınav opsiyonu, hem Alman lojistik sektörünün tıkanıklığını çözecek hem de Türk sürücülerimize Avrupa'da yüksek yaşam standartlı bir kariyer kapısı açacaktır."</em></p>

        <h3>Türk Şoförlerimiz Sürece Nasıl Başlayabilir?</h3>
        <p>Platformumuz (<strong>almanyatirsoforlugu.com</strong>) üzerinden yapacağınız başvurularda, Almanya'daki anlaşmalı lojistik devleri ve sertifikalı eğitim kurumlarımız aracılığıyla:</p>
        <ol>
          <li>Türkçe Kod 95 müfredatı ve güncel IHK sınav soru bankası verilmektedir.</li>
          <li>Vize süresince konaklama imkanı, aile birleşimi danışmanlığı ve İş Ajansı (ZAV) ön onayı sağlanmaktadır.</li>
          <li><strong>3.200 € – 4.200 € net maaş + günlük 28 € - 34 € Spesen harcırahlı</strong> iş sözleşmeleri doğrudan sunulmaktadır.</li>
        </ol>

        <div class="news-callout-emerald">
          <h4>🚀 Siz de Almanya'da TIR Şoförü Olarak Çalışmak İster Misiniz?</h4>
          <p>Hemen sol menüdeki veya sayfanın üstündeki <strong>"İş Başvurusu Yap"</strong> butonuna tıklayarak formunuzu eksiksiz doldurun. Uzman kadromuz Türkçe Kod 95 ve Almanya vize dosyanızı hemen başlatsın!</p>
        </div>
      `
    },
    {
      id: 'art-1',
      title: 'Almanya C/CE Sınıfı Ehliyet Denkliği 2026 Tam Rehberi',
      slug: 'almanya-c-ce-ehliyet-denkligi-2026',
      category: 'Ehliyet & Vize',
      keywords: 'Almanya TIR ehliyet denkliği, CE ehliyet Almanya, Kod 95 vize',
      metaDesc: 'Türkiye C ve CE sınıfı ehliyet sahipleri için 2026 yılında Almanya ehliyet denkliği alma adımları, gerekli belgeler ve süreç rehberi.',
      author: 'Uzman Lojistik Danışmanı',
      date: '2026-08-28',
      readTime: '4 Dk Okuma',
      images: [],
      content: `<h2>Almanya'da TIR Şoförü Olarak Çalışmak İçin Ehliyet Denkliği Nasıl Alınır?</h2>
<p>Almanya'da ağır vasıta (C ve CE sınıfı) sürücülerine olan devasa ihtiyaç sebebiyle, Türkiye'den gelen deneyimli şoförlere yüksek maaşlar ve hızlı çalışma vizesi imkanı sunulmaktadır. Ancak ilk adım Türk ehliyetinin Alman standartlarına (Führerschein-Anerkennung) entegre edilmesidir.</p>

<h3>Gerekli Temel Evraklar:</h3>
<ul>
  <li><strong>C / CE Sınıfı Ehliyet:</strong> Türkiye'den alınmış geçerli sürücü belgesi.</li>
  <li><strong>Psikoteknik Raporu & Sağlık Testi:</strong> Almanca tercümeli göz ve genel sağlık muayenesi.</li>
  <li><strong>SRC 3 / SRC 4 ve Kod 95:</strong> Avrupa Birliği standartlarına uygun 95 Kodu modül eğitimi sertifikası.</li>
  <li><strong>Adli Sicil Kaydı:</strong> Apostilli ve çevirili temiz sabıka kaydı.</li>
</ul>

<h3>Net Maaş Beklentisi ve Avantajlar</h3>
<p>Almanya'da yeni başlayan bir TIR şoförü aylık ortalama <strong>2.800 € ile 3.800 € net</strong> maaş almakta, buna ek olarak günlük 28 € ila 35 € tutarında vergiden muaf harcırah (Spesen) ödenmektedir.</p>`
    },
    {
      id: 'art-2',
      title: 'Almanya TIR Şoförü Maaşları: Net Euro ve Harcırah (Spesen) Detayları',
      slug: 'almanya-tir-soforu-maaslari-2026',
      category: 'Maaş & Yaşam',
      keywords: 'Almanya şoför maaşı 2026, Spesen harcırah hesabı, Steuerklasse şoför',
      metaDesc: 'Almanya TIR şoförleri ne kadar kazanır? Vergi sınıfları (Steuerklasse), gece mesaili net maaşlar ve günlük Spesen harcırah hesaplama detayları.',
      author: 'Finans ve İK Uzmanı',
      date: '2026-08-29',
      readTime: '5 Dk Okuma',
      images: [],
      content: `<h2>Almanya Lojistik Sektöründe Güncel Şoför Kazançları</h2>
<p>Almanya'da şoför maaşları eyaletlere, çalışılan firmanın büyüklüğüne ve gece/haftasonu sürüşlerine göre değişiklik gösterir. Ancak sektördeki en büyük avantaj <strong>Spesen</strong> adı verilen vergiden muaf günlük harcırahlardır.</p>

<h3>2026 Yılı Net Kazanç Tablosu:</h3>
<p>Vergi Sınıfı 1 (Bekar) bir TIR şoförü için örnek aylık kazanç:</p>
<ul>
  <li>Brüt Taban Maaş: 3.200 €</li>
  <li>Net Maaş (Vergi Düşüldükten Sonra): ~2.350 €</li>
  <li>Günlük Harcırah (24 gün x 28 €): +672 €</li>
  <li>Gece & Tehlikeli Madde (ADR) Primi: +300 €</li>
  <li><strong>TOPLAM NET ELE GEÇEN: ~3.322 € (~186.000 TL)</strong></li>
</ul>`
    }
  ];

  // DEFAULT LOGS
  const DEFAULT_LOGS = [
    { timestamp: '2026-09-04 21:45', message: '🟢 Sistem başlatıldı ve veritabanı bağlandı.' },
    { timestamp: '2026-09-04 21:50', message: '📋 Sürücü başvurusu alındı: Caner Yıldız (CE Ehliyet, 5 Yıl Tecrübe)' },
    { timestamp: '2026-09-04 22:00', message: '✅ Sürücü hesabı onaylandı ve aktif edildi: Mehmet Demir (mehmet.demir@gmail.com)' }
  ];

  // STATE VARIABLES
  let siteSettings = { ...DEFAULT_SITE_SETTINGS };
  let users = [];
  let applications = [];
  let jobs = [];
  let articles = [];
  let systemLogs = [];
  let currentUser = null;
  let selectedAppDetailId = null;

  // DOM READY INITIALIZATION
  document.addEventListener('DOMContentLoaded', function () {
    loadAllStorage();
    initBirthYearSelect();
    applySiteSettingsUI();
    loadUserSession();
    renderPublicJobs();
    renderBlogGrid();
    initCalculators();
    initEventListeners();
    checkApiKeySetup();
    handleRouting();
  });

  // STORAGE OPERATIONS
  function loadAllStorage() {
    try {
      const savedSettings = localStorage.getItem('alman_tir_settings');
      siteSettings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SITE_SETTINGS };

      const savedUsers = localStorage.getItem('alman_tir_users');
      users = savedUsers ? JSON.parse(savedUsers) : [ ...DEFAULT_USERS ];

      const savedApps = localStorage.getItem('alman_tir_applications');
      applications = savedApps ? JSON.parse(savedApps) : [ ...DEFAULT_APPLICATIONS ];

      const savedJobs = localStorage.getItem('alman_tir_jobs');
      jobs = savedJobs ? JSON.parse(savedJobs) : [ ...DEFAULT_JOBS ];

      const savedArticles = localStorage.getItem('alman_tir_articles');
      if (savedArticles) {
        articles = JSON.parse(savedArticles);
        if (!articles.some(a => a.id === 'art-kod95-tr')) {
          articles.unshift(DEFAULT_ARTICLES[0]);
        }
      } else {
        articles = [ ...DEFAULT_ARTICLES ];
      }

      const savedLogs = localStorage.getItem('alman_tir_logs');
      systemLogs = savedLogs ? JSON.parse(savedLogs) : [ ...DEFAULT_LOGS ];
    } catch (e) {
      console.error('Storage parse error, fallback to defaults', e);
      siteSettings = { ...DEFAULT_SITE_SETTINGS };
      users = [ ...DEFAULT_USERS ];
      applications = [ ...DEFAULT_APPLICATIONS ];
      jobs = [ ...DEFAULT_JOBS ];
      articles = [ ...DEFAULT_ARTICLES ];
      systemLogs = [ ...DEFAULT_LOGS ];
    }

    saveAllStorage();
  }

  function saveAllStorage() {
    localStorage.setItem('alman_tir_settings', JSON.stringify(siteSettings));
    localStorage.setItem('alman_tir_users', JSON.stringify(users));
    localStorage.setItem('alman_tir_applications', JSON.stringify(applications));
    localStorage.setItem('alman_tir_jobs', JSON.stringify(jobs));
    localStorage.setItem('alman_tir_articles', JSON.stringify(articles));
    localStorage.setItem('alman_tir_logs', JSON.stringify(systemLogs));
  }

  function logActivity(msg) {
    const now = new Date();
    const ts = now.toISOString().slice(0, 16).replace('T', ' ');
    systemLogs.unshift({ timestamp: ts, message: msg });
    if (systemLogs.length > 50) systemLogs.pop();
    localStorage.setItem('alman_tir_logs', JSON.stringify(systemLogs));
    renderSystemLogs();
  }

  function renderSystemLogs() {
    const container = document.getElementById('system-logs-feed');
    if (!container) return;
    if (systemLogs.length === 0) {
      container.innerHTML = `<div class="log-entry" style="color:var(--text-muted);">Henüz aktivite kaydı yok.</div>`;
      return;
    }
    container.innerHTML = systemLogs.map(l => `
      <div class="log-entry">
        <span class="log-timestamp">[${l.timestamp}]</span> ${l.message}
      </div>
    `).join('');
  }

  window.clearSystemLogs = function () {
    systemLogs = [];
    localStorage.setItem('alman_tir_logs', JSON.stringify(systemLogs));
    renderSystemLogs();
  };


  // BIRTH YEAR POPULATOR
  function initBirthYearSelect() {
    const select = document.getElementById('apply-birth-year');
    if (!select) return;

    select.innerHTML = '<option value="">Doğum Yılınızı Seçiniz *</option>';
    const currentYear = new Date().getFullYear();
    for (let yr = currentYear - 18; yr >= 1955; yr--) {
      select.innerHTML += `<option value="${yr}">${yr}</option>`;
    }
  }

  // LIVE SITE SETTINGS APPLICATION
  function applySiteSettingsUI() {
    // Banner
    const bannerBox = document.getElementById('site-announcement-banner');
    const bannerText = document.getElementById('announcement-banner-text');
    if (bannerBox && bannerText) {
      if (siteSettings.bannerActive) {
        bannerBox.style.display = 'flex';
        bannerText.textContent = siteSettings.bannerText || DEFAULT_SITE_SETTINGS.bannerText;
      } else {
        bannerBox.style.display = 'none';
      }
    }

    // Euro Rate
    const rateInputAdmin = document.getElementById('setting-euro-rate-input');
    if (rateInputAdmin) rateInputAdmin.value = siteSettings.euroRate || DEFAULT_EURO_RATE;

    // Maintenance Mode
    const isMaintenance = siteSettings.maintenanceMode;
    const isUserAdmin = currentUser && currentUser.role === 'admin';
    let overlay = document.getElementById('maintenance-overlay-el');

    if (isMaintenance && !isUserAdmin) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay-el';
        overlay.className = 'maintenance-overlay';
        overlay.innerHTML = `
          <div style="max-width:550px; background:rgba(30,41,59,0.95); padding:3rem; border-radius:24px; border:1px solid #334155;">
            <h1 style="font-size:2.5rem; margin-bottom:1rem; color:#f59e0b;">🚨 SISTEM BAKIMDA</h1>
            <p style="font-size:1.1rem; line-height:1.6; margin-bottom:2rem; color:#cbd5e1;">${siteSettings.maintenanceMessage || 'Sistemimiz bakımdadır.'}</p>
            <p style="font-size:0.85rem; color:#94a3b8;">Yönetici Paneli Girişi: <a href="#panel" style="color:#38bdf8; text-decoration:underline;" onclick="location.reload()">/panel</a></p>
          </div>
        `;
        document.body.appendChild(overlay);
      }
      overlay.style.display = 'flex';
    } else if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // DYNAMIC FORM TOGGLES
  window.toggleLicenseBoxes = function (hasLicense) {
    const wrapper = document.getElementById('license-classes-wrapper');
    if (wrapper) wrapper.style.display = hasLicense ? 'block' : 'none';
  };

  window.toggleSrcBoxes = function (hasSrc) {
    const wrapper = document.getElementById('src-types-wrapper');
    if (wrapper) wrapper.style.display = hasSrc ? 'block' : 'none';
  };

  window.toggleCardCheck = function (input) {
    const card = input.closest('.form-check-card');
    if (card) {
      if (input.type === 'radio') {
        const name = input.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          const rCard = r.closest('.form-check-card');
          if (rCard) rCard.classList.remove('selected');
        });
      }
      if (input.checked) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  };

  // APPLICATION FORM SUBMISSION HANDLER
  window.submitJobApplication = function (e) {
    e.preventDefault();

    const name = document.getElementById('apply-name')?.value.trim();
    const email = document.getElementById('apply-email')?.value.trim().toLowerCase();
    const phone = document.getElementById('apply-phone')?.value.trim();
    const birthYear = document.getElementById('apply-birth-year')?.value;
    const passportRadio = document.querySelector('input[name="apply-passport"]:checked');
    const hasLicenseRadio = document.querySelector('input[name="apply-has-license"]:checked');
    const hasSrcRadio = document.querySelector('input[name="apply-has-src"]:checked');
    const hasAdrRadio = document.querySelector('input[name="apply-adr"]:checked');
    const experience = document.getElementById('apply-experience')?.value;
    const message = document.getElementById('apply-message')?.value.trim();

    if (!name || !email || !phone || !birthYear || !passportRadio || !hasLicenseRadio || !hasSrcRadio || !hasAdrRadio) {
      alert('⚠️ Lütfen zorunlu (*) alanları (Ad Soyad, E-Posta, Telefon, Doğum Yılı, Pasaport, Ehliyet, SRC, ADR) eksiksiz doldurunuz!');
      return;
    }

    // License Classes
    const licenseClasses = [];
    if (hasLicenseRadio.value === 'Var') {
      document.querySelectorAll('input[name="apply-license-class"]:checked').forEach(cb => {
        licenseClasses.push(cb.value);
      });
    }

    // SRC Types
    const srcTypes = [];
    if (hasSrcRadio.value === 'Var') {
      document.querySelectorAll('input[name="apply-src-type"]:checked').forEach(cb => {
        srcTypes.push(cb.value);
      });
    }

    const newApp = {
      id: 'app-' + Date.now(),
      name,
      email,
      phone,
      birthYear,
      passport: passportRadio.value,
      hasLicense: hasLicenseRadio.value,
      licenseClasses: licenseClasses.length > 0 ? licenseClasses : ['Belirtilmedi'],
      hasSrc: hasSrcRadio.value,
      srcTypes: srcTypes.length > 0 ? srcTypes : ['Yok'],
      hasAdr: hasAdrRadio.value,
      experience: experience || '2-4 Yıl',
      message: message || 'Ek mesaj bırakılmadı.',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };

    applications.unshift(newApp);
    logActivity(`📋 Yeni sürücü başvurusu alındı: ${name} (${email})`);
    saveAllStorage();

    window.closeModal('job-apply-modal');

    // SUCCESS ALERT & NOTIFICATION
    alert(`🎉 TEBRİKLER SAYIN ${name.toUpperCase()}!\n\nSürücü Başvuru Formunuz başarıyla sisteme iletildi.\n\nİnceleme Süreci:\n1. Pasaport ve Doğum Yılı doğrulamanız yapılacak.\n2. Ehliyet sınıflarınız (${newApp.licenseClasses.join(', ')}) ve SRC belgeleriniz incelenecek.\n3. Onay sonrası kullanıcı giriş hesabınız açılıp tarafınıza SMS/E-posta gönderilecektir.`);

    // Reset Form
    e.target.reset();
    initBirthYearSelect();

    renderAdminDashboard();
    renderApplicationsTable();
  };

  // USER AUTHENTICATION & SESSION MANAGEMENT
  function loadUserSession() {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        updateUserNavUI();
      } catch (e) {
        currentUser = null;
      }
    }
  }

  function updateUserNavUI() {
    const authBtn = document.getElementById('nav-auth-btn');
    const badgeBox = document.getElementById('user-profile-badge-box');

    if (currentUser) {
      if (authBtn) {
        authBtn.className = 'btn btn-secondary';
        authBtn.innerHTML = `👤 ${currentUser.name || currentUser.username || 'Kullanıcı'}`;
        authBtn.onclick = function () {
          if (currentUser.role === 'admin') {
            goToAdminPanel();
          } else {
            openDriverProfileModal();
          }
        };
      }
      if (badgeBox) {
        badgeBox.style.display = 'block';
        badgeBox.innerHTML = currentUser.role === 'admin' 
          ? `<button class="btn btn-gold" onclick="goToAdminPanel()" style="padding:0.45rem 0.9rem; font-size:0.85rem; font-weight:700;">⚡ Yönetici Paneli</button>`
          : `<span class="badge badge-approved" style="font-size:0.85rem; padding:0.45rem 0.8rem;">✅ Onaylı Sürücü</span>`;
      }
    } else {
      if (authBtn) {
        authBtn.className = 'btn btn-secondary';
        authBtn.innerHTML = '👤 Giriş Yap';
        authBtn.onclick = function () {
          window.openModal('auth-modal');
        };
      }
      if (badgeBox) badgeBox.style.display = 'none';
    }
  }

  window.handleLoginSubmit = function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email')?.value.trim().toLowerCase();
    const passwordInput = document.getElementById('login-password')?.value.trim();

    const user = users.find(u => u.email.toLowerCase() === emailInput && u.password === passwordInput);

    if (!user) {
      alert('❌ Hatalı E-Posta veya Şifre!\n\nEğer henüz hesabınız yoksa lütfen "Sürücü Başvuru Formu" doldurunuz. Başvurunuz onaylandıktan sonra hesabınız açılacaktır.');
      return;
    }

    if (user.status !== 'active') {
      alert('⚠️ Hesabınız şu anda pasif durumdadır. İnceleme devam ediyor olabilir.');
      return;
    }

    currentUser = user;
    localStorage.setItem('user_session', JSON.stringify(currentUser));
    updateUserNavUI();
    window.closeModal('auth-modal');

    alert(`🎉 Hoş geldiniz Sayın ${user.name}! Oturumunuz açıldı.`);

    if (user.role === 'admin') {
      goToAdminPanel();
    } else {
      openDriverProfileModal();
    }
  };

  window.handleAdminLoginSubmit = function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('admin-login-email')?.value.trim().toLowerCase();
    const passwordInput = document.getElementById('admin-login-password')?.value.trim();

    const adminUser = users.find(u => u.email.toLowerCase() === emailInput && u.password === passwordInput && u.role === 'admin');

    if (!adminUser) {
      alert('❌ Yönetici girişi başarısız! E-posta veya şifre hatalı.\n\nVarsayılan Admin Giriş Bilgileri:\nE-Posta: admin@almanyatirsoforlugu.com\nŞifre: admin123');
      return;
    }

    currentUser = adminUser;
    localStorage.setItem('user_session', JSON.stringify(currentUser));
    updateUserNavUI();
    window.closeModal('admin-login-modal');

    alert(`⚡ Hoş geldiniz Sayın ${adminUser.name}! Yönetici Kontrol Paneline aktarılıyorsunuz.`);
    goToAdminPanel();
  };

  window.logoutUser = function () {
    currentUser = null;
    localStorage.removeItem('user_session');
    updateUserNavUI();
    window.closeModal('driver-profile-modal');
    alert('Oturum kapatıldı.');
    goToPublicSite();
  };

  function openDriverProfileModal() {
    if (!currentUser) return;
    document.getElementById('driver-profile-name').textContent = currentUser.name;
    document.getElementById('driver-profile-email').textContent = currentUser.email;
    window.openModal('driver-profile-modal');
  }

  // PRIVATE ROUTING (#panel or /panel)
  function handleRouting() {
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash === '#panel' || pathname.endsWith('/panel')) {
      showAdminView();
    } else {
      showMainView();
    }
  }

  window.addEventListener('hashchange', handleRouting);

  function showAdminView() {
    const mainView = document.getElementById('main-site-view');
    const adminView = document.getElementById('admin-site-view');
    if (mainView && adminView) {
      mainView.style.display = 'none';
      adminView.classList.add('active');
      adminView.style.display = 'flex';

      const adminNameElem = document.getElementById('admin-user-info-name');
      const adminEmailElem = document.getElementById('admin-user-info-email');
      if (adminNameElem) adminNameElem.textContent = currentUser ? currentUser.name : 'Sistem Yöneticisi';
      if (adminEmailElem) adminEmailElem.textContent = currentUser ? currentUser.email : 'admin@almanyatirsoforlugu.com';

      renderAdminDashboard();
      window.scrollTo(0, 0);
    }
  }

  function showMainView() {
    const mainView = document.getElementById('main-site-view');
    const adminView = document.getElementById('admin-site-view');
    if (mainView && adminView) {
      adminView.classList.remove('active');
      adminView.style.display = 'none';
      mainView.style.display = 'block';
    }
  }

  window.goToAdminPanel = function () {
    window.location.hash = '#panel';
  };

  window.goToPublicSite = function () {
    window.location.hash = '';
    showMainView();
  };

  // ADMIN PANEL TAB SWITCHER ENGINE
  window.switchAdminTab = function (tabName) {
    const tabs = ['dashboard', 'applications', 'users', 'settings', 'jobs', 'calc', 'articles', 'logs'];
    const tabTitles = {
      dashboard: '📊 Yönetim Paneli / Genel Bakış',
      applications: '📋 Başvuru Takip & Sürücü Dosyaları',
      jobs: '🚚 Aktif Lojistik & Şoför İş İlanları',
      calc: '💶 Maaş & Spesen Projeksiyonu Hesaplayıcı',
      articles: '📝 SEO Blog & Makale Editörü',
      users: '👥 Sistem Kullanıcıları & Yetkilendirme',
      settings: '⚙️ Web Sitesi & Sistem Ayarları',
      logs: '📜 Canlı Sistem Aktivite Logları'
    };

    tabs.forEach(t => {
      const btn = document.getElementById(`admin-tab-btn-${t}`);
      const pane = document.getElementById(`admin-tab-content-${t}`);
      if (btn) btn.classList.remove('active');
      if (pane) pane.style.display = 'none';
    });

    const targetBtn = document.getElementById(`admin-tab-btn-${tabName}`);
    const targetPane = document.getElementById(`admin-tab-content-${tabName}`);

    if (targetBtn) targetBtn.classList.add('active');
    if (targetPane) targetPane.style.display = 'block';

    const breadcrumb = document.getElementById('admin-topbar-breadcrumb') || document.getElementById('wp-topbar-breadcrumb-title');
    if (breadcrumb && tabTitles[tabName]) {
      breadcrumb.textContent = tabTitles[tabName];
    }

    if (tabName === 'dashboard') renderAdminDashboard();
    if (tabName === 'applications') renderApplicationsTable();
    if (tabName === 'users') renderUsersTable();
    if (tabName === 'settings') populateSettingsForm();
    if (tabName === 'jobs') renderJobsTable();
    if (tabName === 'articles') renderAdminArticlesTable();
    if (tabName === 'logs') renderSystemLogs();
  };


  // ADMIN DASHBOARD OVERVIEW RENDER
  function renderAdminDashboard() {
    const totalApps = applications.length;
    const pendingApps = applications.filter(a => a.status === 'pending').length;
    const approvedApps = applications.filter(a => a.status === 'approved').length;
    const activeJobsCount = jobs.filter(j => j.status === 'active').length;

    const elTotal = document.getElementById('stat-total-apps');
    const elPending = document.getElementById('stat-pending-apps');
    const elApproved = document.getElementById('stat-approved-apps');
    const elJobs = document.getElementById('stat-active-jobs');
    const elEuro = document.getElementById('stat-euro-rate');

    if (elTotal) elTotal.textContent = totalApps;
    if (elPending) elPending.textContent = pendingApps;
    if (elApproved) elApproved.textContent = approvedApps;
    if (elJobs) elJobs.textContent = activeJobsCount;
    if (elEuro) elEuro.textContent = (siteSettings.euroRate || DEFAULT_EURO_RATE) + ' ₺';

    const pendingBadge = document.getElementById('pending-badge-count');
    if (pendingBadge) pendingBadge.textContent = pendingApps;

    const recentBody = document.getElementById('admin-recent-apps-tbody');
    if (!recentBody) return;

    const recentList = applications.slice(0, 5);
    if (recentList.length === 0) {
      recentBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Henüz giren başvuru yok.</td></tr>`;
      return;
    }

    recentBody.innerHTML = recentList.map(app => `
      <tr>
        <td><strong>${app.name}</strong></td>
        <td>${app.email}</td>
        <td><strong>${app.birthYear || '-'}</strong></td>
        <td>${app.experience}</td>
        <td>Pasaport: <b>${app.passport}</b> | ADR: <b>${app.hasAdr}</b></td>
        <td><small style="color:var(--text-muted);">${app.createdAt}</small></td>
        <td>${getStatusBadgeHtml(app.status)}</td>
        <td>
          <button class="btn btn-secondary" style="padding:0.35rem 0.75rem; font-size:0.8rem; border-radius:8px;" onclick="window.openApplicationDetailModal('${app.id}')">🔎 İncele</button>
        </td>
      </tr>
    `).join('');
  }

  // APPLICATIONS TABLE & FILTERS
  window.filterApplications = function () {
    renderApplicationsTable();
  };

  function renderApplicationsTable() {
    const tbody = document.getElementById('admin-applications-tbody');
    if (!tbody) return;

    const search = document.getElementById('app-search-input')?.value.trim().toLowerCase() || '';
    const statusFilter = document.getElementById('app-status-filter')?.value || 'all';

    let filtered = applications.filter(app => {
      const matchSearch = app.name.toLowerCase().includes(search) || app.email.toLowerCase().includes(search) || app.phone.includes(search);
      const matchStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:2.5rem;">Arama kriterine uygun başvuru bulunamadı.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(app => `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">${app.name}</div>
          <div style="color:var(--text-muted); font-size:0.82rem;">✉️ ${app.email} | 📞 ${app.phone}</div>
        </td>
        <td><span style="font-size:1rem; font-weight:800; color:var(--accent-blue);">${app.birthYear || '-'}</span></td>
        <td><span class="badge ${app.passport === 'Evet' ? 'badge-approved' : 'badge-rejected'}">${app.passport}</span></td>
        <td>${(app.licenseClasses || []).map(l => `<span class="tag-item highlight">${l}</span>`).join(' ')}</td>
        <td>${(app.srcTypes || []).map(s => `<span class="tag-item">${s}</span>`).join(' ')}</td>
        <td><span class="badge ${app.hasAdr === 'Evet' ? 'badge-approved' : 'badge-inactive'}">${app.hasAdr}</span></td>
        <td><b>${app.experience}</b></td>
        <td>${getStatusBadgeHtml(app.status)}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.8rem; border-radius:8px;" onclick="window.openApplicationDetailModal('${app.id}')">🔍 Detay</button>
            ${app.status === 'pending' ? `
              <button class="btn btn-primary" style="padding:0.35rem 0.65rem; font-size:0.8rem; border-radius:8px;" onclick="window.approveApplicationDirect('${app.id}')">✅ Onayla</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  function getStatusBadgeHtml(status) {
    if (status === 'pending') return `<span class="badge-pending">⏳ Beklemede</span>`;
    if (status === 'approved') return `<span class="badge-approved">✅ Onaylandı</span>`;
    if (status === 'rejected') return `<span class="badge-rejected">❌ Reddedildi</span>`;
    return `<span class="badge-inactive">${status}</span>`;
  }

  // APPLICATION DOSSIER & APPROVAL WORKFLOW
  window.openApplicationDetailModal = function (appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    selectedAppDetailId = appId;

    document.getElementById('detail-app-name').textContent = app.name;
    document.getElementById('detail-app-email').textContent = app.email;
    document.getElementById('detail-app-phone').textContent = app.phone;
    document.getElementById('detail-app-birth').textContent = app.birthYear || 'Belirtilmedi';
    document.getElementById('detail-app-passport').textContent = app.passport;
    document.getElementById('detail-app-exp').textContent = app.experience;
    document.getElementById('detail-app-adr').textContent = app.hasAdr;
    document.getElementById('detail-app-date').textContent = app.createdAt;
    document.getElementById('detail-app-status-badge').innerHTML = getStatusBadgeHtml(app.status);

    const licElem = document.getElementById('detail-app-licenses');
    licElem.innerHTML = (app.licenseClasses || []).map(l => `<span class="tag-item highlight" style="font-size:0.9rem; padding:0.3rem 0.7rem;">${l}</span>`).join(' ');

    const srcElem = document.getElementById('detail-app-src');
    srcElem.innerHTML = (app.srcTypes || []).map(s => `<span class="tag-item" style="font-size:0.9rem; padding:0.3rem 0.7rem;">${s}</span>`).join(' ');

    document.getElementById('detail-app-message').textContent = app.message || 'Ek mesaj belirtilmemiş.';

    window.openModal('application-detail-modal');
  };

  window.approveAndCreateUserFromDetail = function () {
    if (!selectedAppDetailId) return;
    window.approveApplicationDirect(selectedAppDetailId);
    window.closeModal('application-detail-modal');
  };

  window.rejectApplicationFromDetail = function () {
    if (!selectedAppDetailId) return;
    const app = applications.find(a => a.id === selectedAppDetailId);
    if (app) {
      app.status = 'rejected';
      logActivity(`❌ Sürücü başvurusu reddedildi: ${app.name} (${app.email})`);
      saveAllStorage();
      renderAdminDashboard();
      renderApplicationsTable();
      window.closeModal('application-detail-modal');
      alert('❌ Başvuru reddedildi.');
    }
  };

  window.deleteApplicationFromDetail = function () {
    if (!selectedAppDetailId) return;
    if (confirm('Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?')) {
      const app = applications.find(a => a.id === selectedAppDetailId);
      if (app) logActivity(`🗑️ Sürücü başvurusu silindi: ${app.name}`);
      applications = applications.filter(a => a.id !== selectedAppDetailId);
      saveAllStorage();
      renderAdminDashboard();
      renderApplicationsTable();
      window.closeModal('application-detail-modal');
    }
  };

  window.approveApplicationDirect = function (appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    let existingUser = users.find(u => u.email.toLowerCase() === app.email.toLowerCase());
    const generatedPassword = app.phone.replace(/[^0-9]/g, '').slice(-6) || 'sofor2026';

    if (!existingUser) {
      existingUser = {
        id: 'usr-' + Date.now(),
        name: app.name,
        email: app.email,
        password: generatedPassword,
        role: 'driver',
        status: 'active',
        source: 'Başvuru Onayı',
        createdAt: new Date().toISOString().split('T')[0]
      };
      users.push(existingUser);
    } else {
      existingUser.status = 'active';
    }

    app.status = 'approved';
    app.createdUserId = existingUser.id;
    logActivity(`✅ Sürücü başvurusu onaylandı & kullanıcı hesabı açıldı: ${app.name} (${app.email})`);
    saveAllStorage();

    renderAdminDashboard();
    renderApplicationsTable();

    alert(`✅ SAYIN ${app.name.toUpperCase()} BAŞVURUSU ONAYLANDI!\n\nKullanıcı Hesabı Aktifleştirildi:\n• Giriş E-Postası: ${app.email}\n• Giriş Şifresi: ${existingUser.password}\n\nSürücü bu bilgilerle sistemde oturum açabilir.`);
  };

  // USERS MANAGEMENT
  function renderUsersTable() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(usr => `
      <tr>
        <td>
          <div style="font-weight:700; font-size:0.95rem;">${usr.name}</div>
          <small style="color:var(--text-muted);">${usr.email}</small>
        </td>
        <td><span class="badge ${usr.role === 'admin' ? 'badge-gold' : 'badge-cyan'}">${usr.role === 'admin' ? '⚡ Yönetici' : '🚚 Sürücü'}</span></td>
        <td>Giriş Şifresi: <code style="background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">${usr.password}</code></td>
        <td><small style="color:var(--text-muted);">${usr.source || 'Sistem'}</small></td>
        <td><span class="badge ${usr.status === 'active' ? 'badge-approved' : 'badge-rejected'}">${usr.status === 'active' ? '🟢 Aktif' : '🔴 Pasif'}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem;" onclick="window.openEditUserModal('${usr.id}')">✏️ Düzenle</button>
            ${usr.role !== 'admin' ? `<button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; color:var(--accent-red);" onclick="window.deleteUser('${usr.id}')">🗑️ Sil</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.openCreateUserModal = function () {
    document.getElementById('user-edit-id').value = '';
    document.getElementById('user-edit-name').value = '';
    document.getElementById('user-edit-email').value = '';
    document.getElementById('user-edit-password').value = '';
    document.getElementById('user-edit-role').value = 'driver';
    document.getElementById('user-edit-status').value = 'active';
    window.openModal('user-edit-modal');
  };

  window.openEditUserModal = function (userId) {
    const usr = users.find(u => u.id === userId);
    if (!usr) return;

    document.getElementById('user-edit-id').value = usr.id;
    document.getElementById('user-edit-name').value = usr.name;
    document.getElementById('user-edit-email').value = usr.email;
    document.getElementById('user-edit-password').value = usr.password;
    document.getElementById('user-edit-role').value = usr.role;
    document.getElementById('user-edit-status').value = usr.status;
    window.openModal('user-edit-modal');
  };

  window.saveUserForm = function (e) {
    e.preventDefault();

    const id = document.getElementById('user-edit-id').value;
    const name = document.getElementById('user-edit-name').value.trim();
    const email = document.getElementById('user-edit-email').value.trim().toLowerCase();
    const password = document.getElementById('user-edit-password').value.trim();
    const role = document.getElementById('user-edit-role').value;
    const status = document.getElementById('user-edit-status').value;

    if (!name || !email || !password) {
      alert('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (id) {
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], name, email, password, role, status };
      }
    } else {
      users.push({
        id: 'usr-' + Date.now(),
        name,
        email,
        password,
        role,
        status,
        source: 'Manuel Yönetici',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    saveAllStorage();
    renderUsersTable();
    window.closeModal('user-edit-modal');
    alert('💾 Kullanıcı hesabı başarıyla kaydedildi.');
  };

  window.deleteUser = function (userId) {
    if (confirm('Bu kullanıcı hesabını silmek istediğinize emin misiniz?')) {
      users = users.filter(u => u.id !== userId);
      saveAllStorage();
      renderUsersTable();
    }
  };

  // SITE SETTINGS FORM HANDLERS
  function populateSettingsForm() {
    document.getElementById('setting-banner-active').value = siteSettings.bannerActive ? 'true' : 'false';
    document.getElementById('setting-banner-text').value = siteSettings.bannerText || '';
    document.getElementById('setting-whatsapp-phone').value = siteSettings.whatsappPhone || '';
    document.getElementById('setting-support-email').value = siteSettings.supportEmail || '';
    document.getElementById('setting-euro-rate-input').value = siteSettings.euroRate || DEFAULT_EURO_RATE;
    document.getElementById('setting-maintenance-mode').value = siteSettings.maintenanceMode ? 'true' : 'false';
    document.getElementById('setting-maintenance-msg').value = siteSettings.maintenanceMessage || '';
  }

  window.saveSiteGeneralSettings = function (e) {
    e.preventDefault();

    siteSettings.bannerActive = document.getElementById('setting-banner-active').value === 'true';
    siteSettings.bannerText = document.getElementById('setting-banner-text').value.trim();
    siteSettings.whatsappPhone = document.getElementById('setting-whatsapp-phone').value.trim();
    siteSettings.supportEmail = document.getElementById('setting-support-email').value.trim();

    saveAllStorage();
    applySiteSettingsUI();
    alert('✅ Üst Duyuru Bandı ve İletişim Bilgileri Kaydedildi!');
  };

  window.saveFinancialSettings = function (e) {
    e.preventDefault();

    const newRate = parseFloat(document.getElementById('setting-euro-rate-input').value);
    if (!isNaN(newRate) && newRate > 0) {
      siteSettings.euroRate = newRate;
    }
    siteSettings.maintenanceMode = document.getElementById('setting-maintenance-mode').value === 'true';
    siteSettings.maintenanceMessage = document.getElementById('setting-maintenance-msg').value.trim();

    saveAllStorage();
    applySiteSettingsUI();
    calculateSalary();
    alert('✅ Euro Döviz Kuru ve Bakım Modu Ayarları Güncellendi!');
  };

  // JOB LISTINGS CRUD
  function renderJobsTable() {
    const tbody = document.getElementById('admin-jobs-tbody');
    if (!tbody) return;

    tbody.innerHTML = jobs.map(j => `
      <tr>
        <td><strong>${j.title}</strong></td>
        <td>${j.location}</td>
        <td><b style="color:var(--accent-gold);">${j.salary}</b></td>
        <td><span class="tag-item highlight">${j.license}</span></td>
        <td><span class="badge ${j.status === 'active' ? 'badge-approved' : 'badge-inactive'}">${j.status === 'active' ? '🟢 Yayında' : '🔴 Taslak'}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem;" onclick="window.openEditJobModal('${j.id}')">✏️ Düzenle</button>
            <button class="btn btn-secondary" style="padding:0.35rem 0.65rem; font-size:0.78rem; color:var(--accent-red);" onclick="window.deleteJob('${j.id}')">🗑️ Sil</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderPublicJobs() {
    const container = document.getElementById('job-listings-container');
    if (!container) return;

    const activeJobs = jobs.filter(j => j.status === 'active');
    if (activeJobs.length === 0) {
      container.innerHTML = `<div class="glass-card" style="grid-column:1/-1; text-align:center;"><p>Aktif iş ilanı bulunmamaktadır.</p></div>`;
      return;
    }

    container.innerHTML = activeJobs.map(job => `
      <div class="glass-card job-card">
        <span class="badge badge-gold" style="margin-bottom:0.5rem; display:inline-block;">⚡ Açık Pozisyon</span>
        <h3 style="font-size:1.3rem; margin-bottom:0.5rem;" class="text-gradient-cyan">${job.title}</h3>
        <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">📍 <strong>Lokasyon:</strong> ${job.location} | 💳 <strong>Ehliyet:</strong> ${job.license}</p>
        <p style="font-size:1.1rem; font-weight:800; color:var(--accent-gold); margin-bottom:1rem;">Maaş: ${job.salary}</p>
        <p style="font-size:0.88rem; color:var(--text-main); margin-bottom:1.5rem;">${job.desc}</p>
        <a href="basvuru.html" class="btn btn-primary" style="width:100%; justify-content:center;">📝 Hemen Başvur</a>
      </div>
    `).join('');
  }

  window.openCreateJobModal = function () {
    document.getElementById('job-edit-id').value = '';
    document.getElementById('job-edit-title').value = '';
    document.getElementById('job-edit-location').value = '';
    document.getElementById('job-edit-salary').value = '';
    document.getElementById('job-edit-license').value = 'CE Sınıfı';
    document.getElementById('job-edit-status').value = 'active';
    document.getElementById('job-edit-desc').value = '';
    window.openModal('job-edit-modal');
  };

  window.openEditJobModal = function (jobId) {
    const j = jobs.find(x => x.id === jobId);
    if (!j) return;

    document.getElementById('job-edit-id').value = j.id;
    document.getElementById('job-edit-title').value = j.title;
    document.getElementById('job-edit-location').value = j.location;
    document.getElementById('job-edit-salary').value = j.salary;
    document.getElementById('job-edit-license').value = j.license;
    document.getElementById('job-edit-status').value = j.status;
    document.getElementById('job-edit-desc').value = j.desc;
    window.openModal('job-edit-modal');
  };

  window.saveJobForm = function (e) {
    e.preventDefault();

    const id = document.getElementById('job-edit-id').value;
    const title = document.getElementById('job-edit-title').value.trim();
    const location = document.getElementById('job-edit-location').value.trim();
    const salary = document.getElementById('job-edit-salary').value.trim();
    const license = document.getElementById('job-edit-license').value.trim();
    const status = document.getElementById('job-edit-status').value;
    const desc = document.getElementById('job-edit-desc').value.trim();

    if (id) {
      const idx = jobs.findIndex(j => j.id === id);
      if (idx !== -1) {
        jobs[idx] = { ...jobs[idx], title, location, salary, license, status, desc };
      }
    } else {
      jobs.push({
        id: 'job-' + Date.now(),
        title,
        location,
        salary,
        license,
        status,
        desc
      });
    }

    saveAllStorage();
    renderJobsTable();
    renderPublicJobs();
    window.closeModal('job-edit-modal');
    alert('🚚 İş İlanı Kaydedildi.');
  };

  window.deleteJob = function (jobId) {
    if (confirm('Bu iş ilanını silmek istediğinize emin misiniz?')) {
      jobs = jobs.filter(j => j.id !== jobId);
      saveAllStorage();
      renderJobsTable();
      renderPublicJobs();
    }
  };

  // BLOG ENGINE WITH CATEGORY FILTERING & DYNAMIC PHOTO CAROUSEL
  let activeBlogCategory = 'Tümü';
  const carouselIntervals = {};

  window.filterBlogCategory = function (cat, btnElement) {
    activeBlogCategory = cat;
    document.querySelectorAll('.blog-cat-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
      btnElement.classList.add('active');
    }
    renderBlogGrid();
  };

  window.switchBlogSlide = function (artId, slideIdx) {
    const container = document.getElementById(`carousel-${artId}`);
    if (!container) return;

    const slides = container.querySelectorAll('.blog-carousel-slide');
    const dots = container.querySelectorAll('.blog-carousel-dot');

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === slideIdx);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === slideIdx);
    });
  };

  function startCarouselAutoRotate(artId, totalCount) {
    if (carouselIntervals[artId]) clearInterval(carouselIntervals[artId]);
    let current = 0;
    carouselIntervals[artId] = setInterval(() => {
      current = (current + 1) % totalCount;
      window.switchBlogSlide(artId, current);
    }, 4000);
  }

  function renderBlogGrid() {
    const container = document.getElementById('blog-posts-container');
    if (!container) return;

    let filtered = articles;
    if (activeBlogCategory && activeBlogCategory !== 'Tümü') {
      filtered = articles.filter(a => a.category === activeBlogCategory);
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="glass-card" style="grid-column: 1/-1; text-align:center; padding: 3rem;">
        <p style="color: var(--text-muted);">Bu kategoride henüz yayınlanmış haber veya blog yazısı bulunmamaktadır.</p>
      </div>`;
      return;
    }

    container.innerHTML = filtered.map(art => {
      // Photo Carousel HTML if images array exists and has entries
      let mediaHeaderHtml = '';
      if (art.images && art.images.length > 0) {
        mediaHeaderHtml = `
          <div class="blog-carousel-container" id="carousel-${art.id}">
            ${art.images.map((imgUrl, idx) => `
              <img src="${imgUrl}" alt="${art.title}" class="blog-carousel-slide ${idx === 0 ? 'active' : ''}">
            `).join('')}
            ${art.images.length > 1 ? `
              <div class="blog-carousel-nav">
                ${art.images.map((_, idx) => `
                  <span class="blog-carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.switchBlogSlide('${art.id}', ${idx})"></span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        // Executive Text & Badge Header when no images provided yet
        mediaHeaderHtml = `
          <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge badge-gold" style="font-size:0.8rem; margin-bottom:0.4rem; display:inline-block;">${art.category || 'Haber'}</span>
              <div style="color:#94a3b8; font-size:0.78rem;">✍️ ${art.author || 'Lojistik Editörü'}</div>
            </div>
            <div style="font-size:2.2rem; opacity:0.8;">📰</div>
          </div>
        `;
      }

      return `
        <article class="glass-card blog-card" style="display:flex; flex-direction:column;">
          ${mediaHeaderHtml}
          <div class="blog-meta">
            <span class="badge badge-gold">${art.category || 'Blog'}</span>
            <span>📅 ${art.date}</span>
            <span>⏱️ ${art.readTime || '5 Dk Okuma'}</span>
          </div>
          <h3 class="blog-title" style="margin-top:0.5rem; line-height:1.35;">${art.title}</h3>
          <p class="blog-excerpt">${art.metaDesc || stripHtml(art.content).substring(0, 130) + '...'}</p>
          <button class="btn btn-secondary" style="margin-top:auto;" onclick="window.readFullArticle('${art.id}')">
            Detaylı Haber &rarr;
          </button>
        </article>
      `;
    }).join('');

    // Start auto-slider timer for any active carousels
    filtered.forEach(art => {
      if (art.images && art.images.length > 1) {
        startCarouselAutoRotate(art.id, art.images.length);
      }
    });
  }

  window.readFullArticle = function (id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    const modalBody = document.getElementById('article-modal-body');

    let headerMediaHtml = '';
    if (art.images && art.images.length > 0) {
      headerMediaHtml = `
        <div class="blog-carousel-container" id="carousel-modal-${art.id}" style="height: 380px; margin-bottom: 2rem;">
          ${art.images.map((imgUrl, idx) => `
            <img src="${imgUrl}" alt="${art.title}" class="blog-carousel-slide ${idx === 0 ? 'active' : ''}">
          `).join('')}
          ${art.images.length > 1 ? `
            <div class="blog-carousel-nav">
              ${art.images.map((_, idx) => `
                <span class="blog-carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.switchBlogSlide('modal-${art.id}', ${idx})"></span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      headerMediaHtml = `
        <div class="blog-news-header-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <span class="badge badge-gold" style="font-size:0.9rem;">${art.category}</span>
            <span style="color:#94a3b8; font-size:0.85rem;">📅 ${art.date}</span>
          </div>
          <h1 style="font-size: 2.2rem; margin-bottom: 0.75rem; color:#ffffff; line-height:1.25;">${art.title}</h1>
          <div style="color:#cbd5e1; font-size:0.9rem; display:flex; gap:1.5rem;">
            <span>✍️ <strong>Yazar:</strong> ${art.author}</span>
            <span>⏱️ <strong>Okuma Süresi:</strong> ${art.readTime || '5 Dk'}</span>
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = `
      ${headerMediaHtml}
      <div style="font-size: 1.08rem; line-height: 1.85; color: #1e293b;">
        ${art.content}
      </div>
      <div style="margin-top: 2.5rem; padding: 1.25rem; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:1.5rem;">📌</span>
        <div>
          <strong style="color:#0f172a; font-size:0.92rem;">SEO Etiketleri & Konu Başlıkları:</strong>
          <p style="font-size: 0.88rem; color: #64748b; margin:0.2rem 0 0 0;">${art.keywords || 'Almanya TIR şoförlüğü, vize, Kod 95 Türkçe'}</p>
        </div>
      </div>
    `;

    if (art.images && art.images.length > 1) {
      startCarouselAutoRotate(`modal-${art.id}`, art.images.length);
    }

    window.openModal('article-read-modal');
  };

  function renderAdminArticlesTable() {
    const tbody = document.getElementById('admin-articles-tbody');
    if (!tbody) return;

    tbody.innerHTML = articles.map(art => `
      <tr>
        <td><strong>${art.title}</strong><br><small style="color:var(--text-dim);">${art.slug}</small></td>
        <td><span class="badge badge-cyan">${art.category}</span></td>
        <td>${art.date}</td>
        <td>
          <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" onclick="window.editArticleDirect('${art.id}')">✏️ Düzenle</button>
          <button class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem; color:var(--accent-red);" onclick="window.deleteArticle('${art.id}')">🗑️ Sil</button>
        </td>
      </tr>
    `).join('');
  }

  window.selectPresetImage = function (url) {
    const input = document.getElementById('art-image');
    if (input) input.value = url;
  };

  window.saveArticleForm = function (event) {
    event.preventDefault();
    const id = document.getElementById('art-id').value;
    const title = document.getElementById('art-title').value.trim();
    const category = document.getElementById('art-category').value;
    const keywords = document.getElementById('art-keywords').value.trim();
    const metaDesc = document.getElementById('art-meta-desc').value.trim();
    const author = document.getElementById('art-author').value.trim() || 'Lojistik Editörü Serkan';
    const image = document.getElementById('art-image').value.trim() || 'assets/hero_tir_autobahn_1788119161647.png';
    const content = document.getElementById('editor-area').innerHTML;

    if (!title || !content) {
      alert('Lütfen başlık ve içerik alanlarını doldurunuz!');
      return;
    }

    const slug = title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    if (id) {
      const index = articles.findIndex(a => a.id === id);
      if (index !== -1) {
        articles[index] = { ...articles[index], title, slug, category, keywords, metaDesc, author, image, content };
      }
    } else {
      const newArticle = {
        id: 'art-' + Date.now(),
        title,
        slug,
        category,
        keywords,
        metaDesc,
        author,
        date: new Date().toISOString().split('T')[0],
        readTime: '4 Dk Okuma',
        image,
        content
      };
      articles.unshift(newArticle);
    }

    saveAllStorage();
    renderBlogGrid();
    renderAdminArticlesTable();
    window.resetSimpleArticleForm();
    alert('✅ SEO Blog Yazınız Başarıyla Yayınlandı!');
  };

  window.resetSimpleArticleForm = function () {
    document.getElementById('art-id').value = '';
    document.getElementById('art-title').value = '';
    document.getElementById('art-keywords').value = '';
    document.getElementById('art-meta-desc').value = '';
    document.getElementById('art-image').value = '';
    document.getElementById('editor-area').innerHTML = '<p>Yazı içeriğinizi buraya yazın veya Yapay Zeka butonuna basın...</p>';
  };

  window.editArticleDirect = function (id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    document.getElementById('art-id').value = art.id;
    document.getElementById('art-title').value = art.title;
    document.getElementById('art-category').value = art.category;
    document.getElementById('art-keywords').value = art.keywords || '';
    document.getElementById('art-meta-desc').value = art.metaDesc || '';
    document.getElementById('art-author').value = art.author || '';
    document.getElementById('art-image').value = art.image || '';
    document.getElementById('editor-area').innerHTML = art.content;

    document.getElementById('simple-post-card-box').scrollIntoView({ behavior: 'smooth' });
  };

  window.deleteArticle = function (id) {
    if (confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) {
      articles = articles.filter(a => a.id !== id);
      saveAllStorage();
      renderBlogGrid();
      renderAdminArticlesTable();
    }
  };

  // AI GEMINI ASSISTANT
  window.generateAIArticle = async function () {
    const topicInput = document.getElementById('art-title').value.trim();
    if (!topicInput) {
      alert('Lütfen önce "Blog Yazı Başlığı" alanına bir konu yazın!');
      return;
    }

    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const statusBtn = document.getElementById('ai-gen-btn');
    statusBtn.disabled = true;
    statusBtn.innerHTML = '⏳ Yapay Zeka Makaleyi Yazıyor...';

    try {
      if (apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sen profesyonel bir SEO ve Lojistik editörüsün. "almanyatirsoforlugu.com" blogu için şu konuda Türkiye'deki şoförleri hedefleyen SEO uyumlu zengin bir HTML blog makalesi yaz: "${topicInput}". Başlıklar için <h2> ve <h3>, listeler için <ul> <li> kullan. Yanıt sadece HTML içeriği olsun.`
              }]
            }]
          })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
          const generatedHtml = data.candidates[0].content.parts[0].text.replace(/```html|```/g, '');
          document.getElementById('editor-area').innerHTML = generatedHtml;
          alert('✨ Gemini Yapay Zeka Blog Makalesi Başarıyla Oluşturuldu!');
        } else {
          throw new Error('API yanıt vermedi, şablon motoruna geçiliyor.');
        }
      } else {
        setTimeout(() => {
          const aiDraft = `<h2>${topicInput} Hakkında Kapsamlı SEO Rehberi</h2>
<p>Almanya'da lojistik sektöründe çalışmak isteyen Türk sürücüler için <strong>${topicInput}</strong> konusu büyük önem taşımaktadır. Bu rehberimizde 2026 yılı güncel mevzuatına göre detayları inceliyoruz.</p>

<h3>Önemli Şartlar ve Başvuru Adımları</h3>
<ul>
  <li><strong>Gerekli Sürücü Belgesi:</strong> C1, C, CE sınıfı ehliyetler ve geçerli sürücü kartı.</li>
  <li><strong>Mesleki Yeterlilik (Kod 95):</strong> AB standartlarında 95 Kodu belgesi (EU Code 95).</li>
  <li><strong>Vize Randevusu ve Belgeler:</strong> İddak veya konsolosluk onaylı iş teklifi mektubu.</li>
</ul>

<h3>Net Kazanç ve Avantajlar</h3>
<p>Almanya'da ortalama TIR şoförü maaşları brüt 3.200 € - 4.000 € seviyesindedir. Ek olarak verilen günlük 28 € ila 34 € arasındaki Spesen (harcırah) ile net ele geçen gelir oldukça tatmin edicidir.</p>`;

          document.getElementById('editor-area').innerHTML = aiDraft;
          document.getElementById('art-keywords').value = `${topicInput}, Almanya TIR şoförlüğü, vize, Kod 95`;
          document.getElementById('art-meta-desc').value = `${topicInput} hakkında 2026 yılı güncel detaylar, başvuru şartları ve maaş rehberi.`;
          alert('✨ Yapay Zeka SEO Blog Taslağı Oluşturuldu!');
        }, 800);
      }
    } catch (err) {
      alert('Yapay Zeka makalesi oluşturulurken bir hata oluştu: ' + err.message);
    } finally {
      statusBtn.disabled = false;
      statusBtn.innerHTML = '✨ Başlığı Yazdım -> Yapay Zeka İçeriği Otomatik Oluştursun';
    }
  };

  // SALARY CALCULATOR
  function initCalculators() {
    const grossSlider = document.getElementById('calc-gross');
    const grossVal = document.getElementById('calc-gross-val');

    if (grossSlider && grossVal) {
      grossSlider.addEventListener('input', function () {
        grossVal.textContent = Number(this.value).toLocaleString() + ' €';
        calculateSalary();
      });
    }

    const taxClass = document.getElementById('calc-tax-class');
    const spesenSelect = document.getElementById('calc-spesen');

    if (taxClass) taxClass.addEventListener('change', calculateSalary);
    if (spesenSelect) spesenSelect.addEventListener('change', calculateSalary);

    calculateSalary();
  }

  function calculateSalary() {
    const gross = Number(document.getElementById('calc-gross')?.value || 3300);
    const taxClass = document.getElementById('calc-tax-class')?.value || '1';
    const spesenDaily = Number(document.getElementById('calc-spesen')?.value || 28);

    let taxRate = 0.28;
    if (taxClass === '3') taxRate = 0.18;
    if (taxClass === '4') taxRate = 0.26;
    if (taxClass === '5') taxRate = 0.36;

    const netBase = gross * (1 - taxRate);
    const monthlySpesen = spesenDaily * 22;
    const totalNetEuro = Math.round(netBase + monthlySpesen);
    
    const rate = siteSettings.euroRate || DEFAULT_EURO_RATE;
    const totalNetTL = Math.round(totalNetEuro * rate);

    const euroElem = document.getElementById('res-net-euro');
    const tlElem = document.getElementById('res-net-tl');

    if (euroElem) euroElem.textContent = `${totalNetEuro.toLocaleString()} € / Ay`;
    if (tlElem) tlElem.textContent = `(~${totalNetTL.toLocaleString()} TL / Ay Net Ele Geçen)`;
  }

  // WIZARD ELIGIBILITY CHECKER
  window.checkEligibility = function () {
    const c1 = document.getElementById('wiz-ce')?.checked;
    const c2 = document.getElementById('wiz-kod95')?.checked;
    const c3 = document.getElementById('wiz-src5')?.checked;
    const c4 = document.getElementById('wiz-german')?.checked;
    const c5 = document.getElementById('wiz-exp')?.checked;

    let score = 0;
    if (c1) score += 30;
    if (c2) score += 25;
    if (c3) score += 15;
    if (c4) score += 15;
    if (c5) score += 15;

    const resBox = document.getElementById('wiz-result-box');
    let message = '';
    let color = '';

    if (score >= 70) {
      color = 'var(--accent-emerald)';
      message = `🎉 <strong>Tebrikler! Uygunluk Puanınız: %${score}</strong><br>Almanya'da TIR şoförü olarak hemen işe başlamaya son derece hazırsınız. Vize başvurunuz yüksek ihtimalle hızlı onaylanacaktır.`;
    } else if (score >= 40) {
      color = 'var(--accent-gold)';
      message = `👍 <strong>Ortalama Düzey! Uygunluk Puanınız: %${score}</strong><br>Temel niteliklere sahipsiniz. Kod 95 veya Almanca A1 belgenizi tamamlayarak %100 uyumluluğa ulaşabilirsiniz.`;
    } else {
      color = 'var(--accent-red)';
      message = `⚠️ <strong>Hazırlık Gerekiyor. Uygunluk Puanınız: %${score}</strong><br>CE Sınıfı ehliyet ve Kod 95 eğitiminizi tamamlamanızı tavsiye ederiz. Danışmanlarımız size yol gösterebilir.`;
    }

    if (resBox) {
      resBox.style.display = 'block';
      resBox.style.borderColor = color;
      resBox.innerHTML = `<div style="color: ${color}; font-weight:600;">${message}</div>`;
    }
  };

  // MOBILE APP DOWNLOAD SIMULATOR
  window.downloadMobileApp = function (platform) {
    alert(`📲 Almanya TIR Şoförlüğü Mobil Uygulaması (${platform}) indirme bağlantısı oluşturuluyor. Uygulama beta sürümüyle doğrudan telefonunuza yüklenecektir!`);
  };

  // EVENT LISTENERS
  function initEventListeners() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const cmd = this.getAttribute('data-cmd');
        const val = this.getAttribute('data-val') || null;
        document.execCommand(cmd, false, val);
      });
    });
  }

  // API KEY STORAGE
  function checkApiKeySetup() {
    const key = localStorage.getItem('gemini_api_key');
    const input = document.getElementById('setting-gemini-key');
    if (input && key) input.value = key;
  }

  window.saveApiKey = function () {
    const key = document.getElementById('setting-gemini-key').value.trim();
    localStorage.setItem('gemini_api_key', key);
    alert('Gemini API Anahtarınız başarıyla kaydedildi!');
  };

  // HELPER
  function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
})();
