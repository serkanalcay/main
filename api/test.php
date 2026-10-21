<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$dataDir = __DIR__ . '/data';
$isWritable = is_writable(__DIR__) || (is_dir($dataDir) && is_writable($dataDir));

echo json_encode([
    'status' => 'OK',
    'message' => 'Avrupa Tır Şoförü Hosting API Başarıyla Çalışıyor',
    'php_version' => PHP_VERSION,
    'write_permission' => $isWritable ? 'EVET (Yazılabilir)' : 'HAYIR (İzin Gerekli: 755 veya 777)',
    'time' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Bilinmiyor',
    'endpoint' => 'api/applications.php'
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
