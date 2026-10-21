<?php
/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - KENDİ HOSTING VERİTABANI REST API
   ========================================================================== */

// 1. CORS & GÜVENLİK BAŞLIKLARI
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Preflight OPTIONS isteği kontrolü
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. VERİTABANI MODU SEÇİMİ (MySQL VEYA JSON DOSYA VERİTABANI)
// Varsayılan olarak kurulum gerektirmeyen güvenli JSON dosya veritabanı aktiftir.
// Eğer cPanel/Plesk MySQL kullanmak isterseniz aşağıdaki bilgileri doldurmanız yeterlidir:
$USE_MYSQL = false; // MySQL kullanmak için true yapınız

$DB_HOST = 'localhost';
$DB_NAME = 'ats_veritabani';
$DB_USER = 'ats_kullanici';
$DB_PASS = 'ats_parola';

// JSON Dosya Veritabanı Yolu
$DATA_DIR = __DIR__ . '/data';
$JSON_FILE = $DATA_DIR . '/applications.json';

// Veri klasörünü ve dosyasını otomatik oluştur
if (!$USE_MYSQL) {
    if (!is_dir($DATA_DIR)) {
        @mkdir($DATA_DIR, 0755, true);
    }
    if (!file_exists($JSON_FILE)) {
        file_put_contents($JSON_FILE, json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
}

// 3. YARDIMCI FONKSİYONLAR
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function respond($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data,
        'count'   => is_array($data) ? count($data) : 0,
        'time'    => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 4. JSON DOSYA VERİTABANI İŞLEMLERİ (File-Locking ile Çoklu Gönderim Korumalı)
function fileDbReadAll($file) {
    if (!file_exists($file)) return [];
    $fp = fopen($file, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $json = json_decode($content, true);
    return is_array($json) ? $json : [];
}

function fileDbSaveAll($file, $items) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

// 5. MYSQL VERİTABANI BAĞLANTISI (İsteğe Bağlı)
function getPdoConnection($host, $name, $user, $pass) {
    try {
        $dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        // Tablo yoksa otomatik oluştur
        $pdo->exec("CREATE TABLE IF NOT EXISTS `ats_applications` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `reference_number` VARCHAR(64) NOT NULL,
            `type` VARCHAR(32) NOT NULL DEFAULT 'detailed',
            `application_type` VARCHAR(32) NOT NULL DEFAULT 'detailed',
            `full_name` VARCHAR(191) NOT NULL,
            `phone` VARCHAR(64) NOT NULL,
            `email` VARCHAR(191) NULL DEFAULT '',
            `city` VARCHAR(100) NULL DEFAULT '',
            `license_classes` TEXT NULL,
            `experience_years` VARCHAR(32) NULL DEFAULT '',
            `status` VARCHAR(64) NOT NULL DEFAULT 'Yeni Başvuru',
            `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
            `in_pool` TINYINT(1) NOT NULL DEFAULT 0,
            `approval_date` VARCHAR(32) NULL DEFAULT '',
            `raw_json` LONGTEXT NULL,
            `created_at` VARCHAR(64) NOT NULL,
            `timestamp` BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
        return $pdo;
    } catch (Exception $e) {
        return null;
    }
}

// ==========================================================================
// 6. HTTP İSTEK YÖNLENDİRME (ROUTING)
// ==========================================================================

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------
// GET: TÜM BAŞVURULARI LİSTELE
// -------------------------------------------------------------
if ($method === 'GET') {
    if ($USE_MYSQL) {
        $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
        if (!$pdo) respond(false, 'MySQL bağlantısı kurulamadı', [], 500);
        $stmt = $pdo->query("SELECT * FROM ats_applications ORDER BY `timestamp` DESC");
        $rows = $stmt->fetchAll();
        $apps = [];
        foreach ($rows as $r) {
            if (!empty($r['raw_json'])) {
                $decoded = json_decode($r['raw_json'], true);
                if ($decoded) { $apps[] = $decoded; continue; }
            }
            $apps[] = $r;
        }
        respond(true, 'Başvurular başarıyla listelendi (MySQL)', $apps);
    } else {
        $apps = fileDbReadAll($JSON_FILE);
        respond(true, 'Başvurular başarıyla listelendi (Hosting JSON DB)', $apps);
    }
}

// -------------------------------------------------------------
// POST: YENİ BAŞVURU KAYDET
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = getJsonInput();
    if (!$input) {
        // Form POST fallback (application/x-www-form-urlencoded veya multipart/form-data)
        $input = $_POST;
    }

    if (empty($input)) {
        respond(false, 'Geçersiz veya boş başvuru verisi', null, 400);
    }

    // Benzersiz Kayıt Numarası Oluştur
    $appId = !empty($input['id']) ? $input['id'] : (!empty($input['referenceNumber']) ? $input['referenceNumber'] : ('ATS-' . rand(100000, 999999)));
    $input['id'] = $appId;
    $input['referenceNumber'] = $appId;

    if (empty($input['createdAt'])) {
        $input['createdAt'] = date('d.m.Y H:i');
    }
    if (empty($input['timestamp'])) {
        $input['timestamp'] = round(microtime(true) * 1000);
    }
    if (empty($input['status'])) {
        $input['status'] = 'Yeni Başvuru';
    }

    if ($USE_MYSQL) {
        $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
        if (!$pdo) respond(false, 'MySQL bağlantısı kurulamadı', null, 500);

        $stmt = $pdo->prepare("REPLACE INTO ats_applications 
            (id, reference_number, `type`, application_type, full_name, phone, email, city, status, is_approved, in_pool, approval_date, raw_json, created_at, `timestamp`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $appId,
            $appId,
            $input['type'] ?? 'detailed',
            $input['applicationType'] ?? 'detailed',
            $input['fullName'] ?? 'Aday',
            $input['phone'] ?? '',
            $input['email'] ?? '',
            $input['city'] ?? '',
            $input['status'] ?? 'Yeni Başvuru',
            !empty($input['isApproved']) ? 1 : 0,
            !empty($input['inPool']) ? 1 : 0,
            $input['approvalDate'] ?? '',
            json_encode($input, JSON_UNESCAPED_UNICODE),
            $input['createdAt'],
            $input['timestamp']
        ]);
        respond(true, 'Yeni başvuru MySQL veritabanına başarıyla kaydedildi', $input, 201);
    } else {
        $items = fileDbReadAll($JSON_FILE);
        // Mevcut kayıt varsa güncelle, yoksa en başa ekle
        $found = false;
        foreach ($items as $k => $item) {
            if (($item['id'] ?? '') === $appId || ($item['referenceNumber'] ?? '') === $appId) {
                $items[$k] = $input;
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($items, $input);
        }
        fileDbSaveAll($JSON_FILE, $items);
        respond(true, 'Yeni başvuru hosting veritabanına kaydedildi', $input, 201);
    }
}

// -------------------------------------------------------------
// PUT: MEVCUT BAŞVURUYU GÜNCELLE (Statü Değişikliği / Not / Onay)
// -------------------------------------------------------------
if ($method === 'PUT') {
    $input = getJsonInput();
    if (!$input || empty($input['id'])) {
        respond(false, 'Güncellenecek aday ID belirtilmedi', null, 400);
    }

    $appId = $input['id'];

    if ($USE_MYSQL) {
        $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
        if (!$pdo) respond(false, 'MySQL bağlantısı kurulamadı', null, 500);

        $stmt = $pdo->prepare("SELECT raw_json FROM ats_applications WHERE id = ?");
        $stmt->execute([$appId]);
        $row = $stmt->fetch();
        $existing = $row ? json_decode($row['raw_json'], true) : [];
        $merged = array_merge($existing, $input);

        $upStmt = $pdo->prepare("UPDATE ats_applications SET 
            `status` = ?, is_approved = ?, in_pool = ?, approval_date = ?, raw_json = ? WHERE id = ?");
        $upStmt->execute([
            $merged['status'] ?? 'Yeni Başvuru',
            !empty($merged['isApproved']) ? 1 : 0,
            !empty($merged['inPool']) ? 1 : 0,
            $merged['approvalDate'] ?? '',
            json_encode($merged, JSON_UNESCAPED_UNICODE),
            $appId
        ]);
        respond(true, 'Aday durumu başarıyla güncellendi (MySQL)', $merged);
    } else {
        $items = fileDbReadAll($JSON_FILE);
        $updated = false;
        foreach ($items as $k => $item) {
            if (($item['id'] ?? '') === $appId || ($item['referenceNumber'] ?? '') === $appId) {
                $items[$k] = array_merge($item, $input);
                $updated = true;
                break;
            }
        }
        if ($updated) {
            fileDbSaveAll($JSON_FILE, $items);
            respond(true, 'Aday durumu hosting üzerinde güncellendi', $input);
        } else {
            respond(false, 'Güncellenecek aday kaydı bulunamadı', null, 404);
        }
    }
}

// -------------------------------------------------------------
// DELETE: BAŞVURU SİL / ARŞİVLE
// -------------------------------------------------------------
if ($method === 'DELETE') {
    $appId = $_GET['id'] ?? null;
    if (!$appId) {
        $input = getJsonInput();
        $appId = $input['id'] ?? null;
    }

    if (!$appId) {
        respond(false, 'Silinecek aday ID belirtilmedi', null, 400);
    }

    if ($USE_MYSQL) {
        $pdo = getPdoConnection($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);
        if (!$pdo) respond(false, 'MySQL bağlantısı kurulamadı', null, 500);
        $stmt = $pdo->prepare("DELETE FROM ats_applications WHERE id = ?");
        $stmt->execute([$appId]);
        respond(true, 'Aday kaydı veritabanından silindi (MySQL)', ['id' => $appId]);
    } else {
        $items = fileDbReadAll($JSON_FILE);
        $filtered = array_filter($items, function($item) use ($appId) {
            return ($item['id'] ?? '') !== $appId && ($item['referenceNumber'] ?? '') !== $appId;
        });
        fileDbSaveAll($JSON_FILE, $filtered);
        respond(true, 'Aday kaydı hosting veritabanından silindi', ['id' => $appId]);
    }
}

respond(false, 'Desteklenmeyen istek metodu', null, 405);
