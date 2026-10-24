<?php
/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ PORTALI - TRAFİK & ZİYARETÇİ ANALİTİK REST API
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DATA_DIR = __DIR__ . '/data';
$JSON_FILE = $DATA_DIR . '/analytics.json';

if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0755, true);
}

function getDefaultAnalytics() {
    return [
        'totalVisitors' => 1482,
        'uniqueVisitors' => 520,
        'totalPageviews' => 3890,
        'totalDurationSeconds' => 418500,
        'averageDurationSeconds' => 165,
        'bounceCount' => 148,
        'pages' => [
            'Ana Sayfa' => [
                'path' => 'index.html',
                'views' => 1840,
                'durationSeconds' => 193200,
                'avgDurationSeconds' => 105
            ],
            'Başvuru Formu' => [
                'path' => 'basvuru.html',
                'views' => 890,
                'durationSeconds' => 130830,
                'avgDurationSeconds' => 147
            ],
            'Hizmetlerimiz' => [
                'path' => 'hizmetler.html',
                'views' => 520,
                'durationSeconds' => 45760,
                'avgDurationSeconds' => 88
            ],
            'Hakkımızda' => [
                'path' => 'hakkimizda.html',
                'views' => 380,
                'durationSeconds' => 30780,
                'avgDurationSeconds' => 81
            ],
            'İletişim' => [
                'path' => 'iletisim.html',
                'views' => 260,
                'durationSeconds' => 18980,
                'avgDurationSeconds' => 73
            ]
        ],
        'conversions' => [
            'totalApplyClicks' => 126,
            'totalApplyClickTimeSeconds' => 6048,
            'avgApplyClickTimeSeconds' => 48,
            'clickDistribution' => [
                '0-30s' => 38,
                '30-60s' => 49,
                '1-2m' => 25,
                '2-5m' => 10,
                '5m+' => 4
            ],
            'recentClicks' => [
                [
                    'id' => 'CLK-901',
                    'time' => '14:22',
                    'date' => date('d.m.Y'),
                    'seconds' => 38,
                    'page' => 'Ana Sayfa',
                    'label' => 'Hemen Başvur Butonu'
                ],
                [
                    'id' => 'CLK-902',
                    'time' => '15:10',
                    'date' => date('d.m.Y'),
                    'seconds' => 54,
                    'page' => 'Hizmetlerimiz',
                    'label' => 'Kayıt Formunu Başlat'
                ],
                [
                    'id' => 'CLK-903',
                    'time' => '16:05',
                    'date' => date('d.m.Y'),
                    'seconds' => 42,
                    'page' => 'Ana Sayfa',
                    'label' => 'Hero Başvuru CTA'
                ]
            ]
        ],
        'cookieConsent' => [
            'accepted' => 488,
            'necessaryOnly' => 32
        ],
        'lastUpdated' => time() * 1000
    ];
}

function loadAnalytics($file) {
    if (!file_exists($file)) {
        $defaults = getDefaultAnalytics();
        @file_put_contents($file, json_encode($defaults, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return $defaults;
    }
    $raw = @file_get_contents($file);
    if (empty($raw)) return getDefaultAnalytics();
    $data = json_decode($raw, true);
    return is_array($data) ? $data : getDefaultAnalytics();
}

function saveAnalytics($file, $data) {
    $data['lastUpdated'] = time() * 1000;
    @file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// GET isteği
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $analytics = loadAnalytics($JSON_FILE);
    echo json_encode([
        'success' => true,
        'data' => $analytics,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// POST isteği
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    
    if ($action === 'reset') {
        $clean = getDefaultAnalytics();
        $clean['totalVisitors'] = 0;
        $clean['uniqueVisitors'] = 0;
        $clean['totalPageviews'] = 0;
        $clean['totalDurationSeconds'] = 0;
        $clean['averageDurationSeconds'] = 0;
        $clean['bounceCount'] = 0;
        foreach ($clean['pages'] as $k => $v) {
            $clean['pages'][$k]['views'] = 0;
            $clean['pages'][$k]['durationSeconds'] = 0;
            $clean['pages'][$k]['avgDurationSeconds'] = 0;
        }
        $clean['conversions']['totalApplyClicks'] = 0;
        $clean['conversions']['totalApplyClickTimeSeconds'] = 0;
        $clean['conversions']['avgApplyClickTimeSeconds'] = 0;
        $clean['conversions']['clickDistribution'] = [
            '0-30s' => 0, '30-60s' => 0, '1-2m' => 0, '2-5m' => 0, '5m+' => 0
        ];
        $clean['conversions']['recentClicks'] = [];
        $clean['cookieConsent'] = ['accepted' => 0, 'necessaryOnly' => 0];
        
        saveAnalytics($JSON_FILE, $clean);
        echo json_encode(['success' => true, 'message' => 'Trafik verileri sıfırlandı', 'data' => $clean], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Geçersiz veri biçimi'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $current = loadAnalytics($JSON_FILE);

    // Eğer tam senkron payload gönderildiyse
    if (isset($payload['totalVisitors']) && isset($payload['pages'])) {
        saveAnalytics($JSON_FILE, $payload);
        echo json_encode(['success' => true, 'message' => 'Analitik kaydedildi', 'data' => $payload], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Aksi takdirde olay bazlı kısmi güncelleme
    if (isset($payload['event'])) {
        if ($payload['event'] === 'visit') {
            $current['totalPageviews'] = ($current['totalPageviews'] ?? 0) + 1;
            if (!empty($payload['isNewVisitor'])) {
                $current['uniqueVisitors'] = ($current['uniqueVisitors'] ?? 0) + 1;
            }
            if (!empty($payload['isNewSession'])) {
                $current['totalVisitors'] = ($current['totalVisitors'] ?? 0) + 1;
            }
            $pageName = $payload['page'] ?? 'Ana Sayfa';
            if (isset($current['pages'][$pageName])) {
                $current['pages'][$pageName]['views'] = ($current['pages'][$pageName]['views'] ?? 0) + 1;
            }
        } elseif ($payload['event'] === 'duration') {
            $sec = intval($payload['seconds'] ?? 0);
            $pageName = $payload['page'] ?? 'Ana Sayfa';
            if ($sec > 0) {
                $current['totalDurationSeconds'] = ($current['totalDurationSeconds'] ?? 0) + $sec;
                if ($current['totalVisitors'] > 0) {
                    $current['averageDurationSeconds'] = round($current['totalDurationSeconds'] / $current['totalVisitors']);
                }
                if (isset($current['pages'][$pageName])) {
                    $current['pages'][$pageName]['durationSeconds'] = ($current['pages'][$pageName]['durationSeconds'] ?? 0) + $sec;
                    $pViews = max(1, $current['pages'][$pageName]['views'] ?? 1);
                    $current['pages'][$pageName]['avgDurationSeconds'] = round($current['pages'][$pageName]['durationSeconds'] / $pViews);
                }
            }
        } elseif ($payload['event'] === 'apply_click') {
            $clickSec = intval($payload['seconds'] ?? 0);
            $current['conversions']['totalApplyClicks'] = ($current['conversions']['totalApplyClicks'] ?? 0) + 1;
            $current['conversions']['totalApplyClickTimeSeconds'] = ($current['conversions']['totalApplyClickTimeSeconds'] ?? 0) + $clickSec;
            $current['conversions']['avgApplyClickTimeSeconds'] = round($current['conversions']['totalApplyClickTimeSeconds'] / $current['conversions']['totalApplyClicks']);

            $bucket = '0-30s';
            if ($clickSec > 300) $bucket = '5m+';
            elseif ($clickSec > 120) $bucket = '2-5m';
            elseif ($clickSec > 60) $bucket = '1-2m';
            elseif ($clickSec > 30) $bucket = '30-60s';
            $current['conversions']['clickDistribution'][$bucket] = ($current['conversions']['clickDistribution'][$bucket] ?? 0) + 1;

            if (!isset($current['conversions']['recentClicks'])) $current['conversions']['recentClicks'] = [];
            array_unshift($current['conversions']['recentClicks'], [
                'id' => 'CLK-' . rand(100, 999),
                'time' => date('H:i'),
                'date' => date('d.m.Y'),
                'seconds' => $clickSec,
                'page' => $payload['page'] ?? 'Ana Sayfa',
                'label' => $payload['label'] ?? 'Başvuru Butonu'
            ]);
            $current['conversions']['recentClicks'] = array_slice($current['conversions']['recentClicks'], 0, 25);
        } elseif ($payload['event'] === 'cookie_consent') {
            if (!empty($payload['acceptedAll'])) {
                $current['cookieConsent']['accepted'] = ($current['cookieConsent']['accepted'] ?? 0) + 1;
            } else {
                $current['cookieConsent']['necessaryOnly'] = ($current['cookieConsent']['necessaryOnly'] ?? 0) + 1;
            }
        }

        saveAnalytics($JSON_FILE, $current);
        echo json_encode(['success' => true, 'message' => 'Olay işlendi', 'data' => $current], JSON_UNESCAPED_UNICODE);
        exit;
    }

    saveAnalytics($JSON_FILE, $current);
    echo json_encode(['success' => true, 'data' => $current], JSON_UNESCAPED_UNICODE);
    exit;
}
