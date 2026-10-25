<?php
/* ==========================================================================
   AVRUPA TIR ŞOFÖRÜ - E-POSTA BİLDİRİM & ŞİFRE SERVİSİ
   Gönderen: info@avrupatirsoforu.com
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getJsonBody() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

function respondJson($success, $message, $extra = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $extra,
        'time'    => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$input = getJsonBody();
if (!$input) {
    $input = $_POST;
}

if (empty($input) || empty($input['action'])) {
    respondJson(false, 'Geçersiz işlem veya eksik parametre', null, 400);
}

$action = $input['action'];
$fromEmail = 'info@avrupatirsoforu.com';
$fromName = 'Avrupa Tır Şoförü İstihdam Portali';

// ==========================================================================
// 1. SÜRÜCÜYE GEÇİCİ ŞİFRE & HESAP BİLGİSİ GÖNDERME
// ==========================================================================
if ($action === 'send_credentials') {
    $toEmail = trim($input['email'] ?? '');
    $candidateName = trim($input['fullName'] ?? 'Değerli Adayımız');
    $tempPassword = trim($input['tempPassword'] ?? '');
    $consultantName = trim($input['consultantName'] ?? 'Serkan Alçay');

    if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        respondJson(false, 'Geçerli bir e-posta adresi belirtilmedi', null, 400);
    }
    if (empty($tempPassword)) {
        respondJson(false, 'Geçici şifre oluşturulmadı', null, 400);
    }

    $subject = "Sürücü Portalına Hoş Geldiniz - Geçici Şifreniz | avrupatirsoforu.com";
    $loginUrl = "https://avrupatirsoforu.com/surucu-paneli.html";

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='tr'>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9ff; margin:0; padding:20px; color:#0b1c30; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #131b2e; padding: 28px 24px; text-align: center; border-bottom: 3px solid #fea619; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
        .header span { color: #fea619; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greet { font-size: 17px; font-weight: 700; color: #0b1c30; margin-bottom: 12px; }
        .lead { font-size: 15px; color: #45464d; line-height: 1.6; margin-bottom: 24px; }
        .info-box { background: #eff4ff; border: 1px solid #dce9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #c6c6cd; font-size: 14px; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #45464d; font-weight: 600; }
        .value { color: #0b1c30; font-weight: 700; font-family: monospace; font-size: 15px; }
        .btn-wrap { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: #fea619; color: #020617 !important; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 2px 8px rgba(254,166,25,0.4); }
        .footer { background: #f8fafe; padding: 20px 28px; font-size: 12px; color: #76777d; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <span>avrupatirsoforu.com</span>
          <h1>Sürücü Adayı Portali Giriş Bilgileri</h1>
        </div>
        <div class='content'>
          <div class='greet'>Sayın " . htmlspecialchars($candidateName, ENT_QUOTES, 'UTF-8') . ",</div>
          <p class='lead'>
            Avrupa ağır vasıta şoför istihdamı için başvurunuz ekibimiz tarafından incelenmiş ve sürücü portalı hesabınız başarıyla tanımlanmıştır. Atanan uzman danışmanınız: <strong>" . htmlspecialchars($consultantName, ENT_QUOTES, 'UTF-8') . "</strong>.
          </p>
          <div class='info-box'>
            <div class='info-row'>
              <span class='label'>Giriş E-posta:</span>
              <span class='value'>" . htmlspecialchars($toEmail, ENT_QUOTES, 'UTF-8') . "</span>
            </div>
            <div class='info-row'>
              <span class='label'>Geçici Şifreniz:</span>
              <span class='value' style='color:#b45309; background:#fffbeb; padding:2px 8px; border-radius:4px;'>" . htmlspecialchars($tempPassword, ENT_QUOTES, 'UTF-8') . "</span>
            </div>
            <div class='info-row'>
              <span class='label'>Panel Durumu:</span>
              <span class='value' style='color:#059669;'>Aktif</span>
            </div>
          </div>
          <p class='lead' style='font-size:13px; color:#76777d;'>
            * Güvenliğiniz için ilk girişinizi yaptıktan sonra paneldeki <strong>'Genel Bakış / Profilim'</strong> alanından şifrenizi değiştirmeniz tavsiye edilir.
          </p>
          <div class='btn-wrap'>
            <a href='" . $loginUrl . "' class='btn'>Sürücü Paneline Giriş Yap</a>
          </div>
        </div>
        <div class='footer'>
          Bu e-posta <strong>avrupatirsoforu.com</strong> tarafından otomatik olarak iletilmiştir.<br>
          İletişim: info@avrupatirsoforu.com | Destek Masası
        </div>
      </div>
    </body>
    </html>
    ";

    $headers = [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=UTF-8",
        "From: " . $fromName . " <" . $fromEmail . ">",
        "Reply-To: " . $fromEmail,
        "X-Mailer: PHP/" . phpversion()
    ];

    $mailSent = @mail($toEmail, $subject, $htmlBody, implode("\r\n", $headers));

    respondJson(true, 'Giriş bilgileri adayın e-posta adresine başarıyla iletildi.', [
        'email' => $toEmail,
        'mailSent' => $mailSent
    ]);
}

// ==========================================================================
// 2. ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDERME
// ==========================================================================
if ($action === 'send_password_reset') {
    $toEmail = trim($input['email'] ?? '');
    $candidateName = trim($input['fullName'] ?? 'Değerli Sürücümüz');
    $resetToken = trim($input['token'] ?? '');

    if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        respondJson(false, 'Geçerli bir e-posta adresi belirtilmedi', null, 400);
    }
    if (empty($resetToken)) {
        $resetToken = bin2hex(random_bytes(16));
    }

    $subject = "Şifre Sıfırlama Talebi | avrupatirsoforu.com";
    $resetUrl = "https://avrupatirsoforu.com/sifre-sifirla.html?email=" . urlencode($toEmail) . "&token=" . urlencode($resetToken);

    $htmlBody = "
    <!DOCTYPE html>
    <html lang='tr'>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9ff; margin:0; padding:20px; color:#0b1c30; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #131b2e; padding: 28px 24px; text-align: center; border-bottom: 3px solid #fea619; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; }
        .header span { color: #fea619; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greet { font-size: 17px; font-weight: 700; color: #0b1c30; margin-bottom: 12px; }
        .lead { font-size: 15px; color: #45464d; line-height: 1.6; margin-bottom: 24px; }
        .btn-wrap { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: #fea619; color: #020617 !important; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; box-shadow: 0 2px 8px rgba(254,166,25,0.4); }
        .link-text { word-break: break-all; font-size: 12px; color: #684000; background: #f8fafe; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafe; padding: 20px 28px; font-size: 12px; color: #76777d; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class='card'>
        <div class='header'>
          <span>avrupatirsoforu.com</span>
          <h1>Şifre Sıfırlama Talebi</h1>
        </div>
        <div class='content'>
          <div class='greet'>Sayın " . htmlspecialchars($candidateName, ENT_QUOTES, 'UTF-8') . ",</div>
          <p class='lead'>
            Sürücü portalı hesabınız için bir şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi hemen belirleyebilirsiniz.
          </p>
          <div class='btn-wrap'>
            <a href='" . $resetUrl . "' class='btn'>Şifremi Sıfırla</a>
          </div>
          <p class='lead' style='font-size:13px; color:#76777d;'>
            Eğer butona tıklayamıyorsanız aşağıdaki bağlantıyı tarayıcınıza yapıştırabilirsiniz:<br>
            <div class='link-text'>" . htmlspecialchars($resetUrl, ENT_QUOTES, 'UTF-8') . "</div>
          </p>
          <p class='lead' style='font-size:12px; color:#93000a;'>
            * Bu sıfırlama talebini siz yapmadıysanız lütfen bu e-postayı dikkate almayınız. Mevcut şifreniz değişmeyecektir.
          </p>
        </div>
        <div class='footer'>
          Bu e-posta <strong>avrupatirsoforu.com</strong> tarafından otomatik olarak iletilmiştir.<br>
          İletişim: info@avrupatirsoforu.com
        </div>
      </div>
    </body>
    </html>
    ";

    $headers = [
        "MIME-Version: 1.0",
        "Content-type: text/html; charset=UTF-8",
        "From: " . $fromName . " <" . $fromEmail . ">",
        "Reply-To: " . $fromEmail,
        "X-Mailer: PHP/" . phpversion()
    ];

    $mailSent = @mail($toEmail, $subject, $htmlBody, implode("\r\n", $headers));

    respondJson(true, 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', [
        'email' => $toEmail,
        'token' => $resetToken,
        'mailSent' => $mailSent
    ]);
}

respondJson(false, 'Bilinmeyen işlem türü', null, 400);
