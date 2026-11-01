<?php
/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - HABERLER & İÇERİK YÖNETİMİ (CMS) REST API
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DATA_DIR = __DIR__ . '/data';
$JSON_FILE = $DATA_DIR . '/news.json';

if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0755, true);
}
if (!file_exists($JSON_FILE)) {
    file_put_contents($JSON_FILE, json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function readNewsFile($file) {
    if (!file_exists($file)) return [];
    $fp = fopen($file, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

function writeNewsFile($file, $data) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode(array_values($data), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = readNewsFile($JSON_FILE);
    echo json_encode([
        'success' => true,
        'data' => $items,
        'count' => count($items)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST' || $method === 'PUT') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz JSON verisi']);
        exit;
    }

    // Tam liste senkronizasyonu gönderildiyse
    if (isset($input['action']) && $input['action'] === 'sync_all' && isset($input['articles']) && is_array($input['articles'])) {
        writeNewsFile($JSON_FILE, $input['articles']);
        echo json_encode(['success' => true, 'message' => 'Haber listesi senkronize edildi', 'data' => $input['articles']]);
        exit;
    }

    // Tekil haber ekleme veya güncelleme
    $items = readNewsFile($JSON_FILE);
    $id = isset($input['id']) ? $input['id'] : ('news-' . time());
    $input['id'] = $id;

    $found = false;
    foreach ($items as $idx => $existing) {
        if (isset($existing['id']) && $existing['id'] === $id) {
            $items[$idx] = array_merge($existing, $input);
            $found = true;
            break;
        }
    }
    if (!$found) {
        array_unshift($items, $input);
    }

    writeNewsFile($JSON_FILE, $items);
    echo json_encode(['success' => true, 'message' => 'Haber kaydedildi', 'data' => $items], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? $_GET['id'] : '';
    if (!$id) {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true);
        if (is_array($input) && isset($input['id'])) {
            $id = $input['id'];
        }
    }
    $items = readNewsFile($JSON_FILE);
    $filtered = array_values(array_filter($items, function($item) use ($id) {
        return !isset($item['id']) || $item['id'] !== $id;
    }));
    writeNewsFile($JSON_FILE, $filtered);
    echo json_encode(['success' => true, 'message' => 'Haber silindi', 'data' => $filtered], JSON_UNESCAPED_UNICODE);
    exit;
}
