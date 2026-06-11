<?php
/**
 * contact.php — endpoint du formulaire de contact (portfolio Adam Laarais).
 *
 * Reçoit le POST du formulaire, valide, filtre le spam (honeypot), puis
 * envoie l'e-mail. Répond en JSON : { ok: true } ou { ok: false, error, fields }.
 *
 * ⚙️  ACTIVATION DE L'ENVOI RÉEL
 *   1. Héberger sur un serveur PHP avec mail() fonctionnel (ou PHPMailer/SMTP).
 *   2. Passer $MAIL_ENABLED à true ci-dessous.
 *   Tant que c'est false, l'endpoint renvoie 501 → le front bascule
 *   proprement sur le fallback mailto: (l'UX reste fonctionnelle).
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$MAIL_ENABLED = false;                 // ← passer à true une fois mail() configuré
$TO = 'laaraisadam22@gmail.com';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'method']);
    exit;
}

// Honeypot : champ "website" caché. Rempli = bot → on accepte en silence.
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$nom     = trim($_POST['nom'] ?? '');
$prenom  = trim($_POST['prenom'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];
if ($nom === '')                                       $errors[] = 'nom';
if ($prenom === '')                                    $errors[] = 'prenom';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        $errors[] = 'email';
if ($message === '')                                   $errors[] = 'message';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'validation', 'fields' => $errors]);
    exit;
}

// Anti-injection d'en-têtes via le champ email.
$email = str_replace(["\r", "\n", "%0a", "%0d"], '', $email);

$subject = "Portfolio — message de $prenom $nom";
$body    = "Nom : $nom $prenom\nEmail : $email\n\nMessage :\n$message\n";
$headers = "From: Portfolio <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n"
         . "Reply-To: $email\r\n"
         . "Content-Type: text/plain; charset=utf-8\r\n";

if ($MAIL_ENABLED) {
    $sent = mail($TO, $subject, $body, $headers);
    if ($sent) {
        echo json_encode(['ok' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'send']);
    }
    exit;
}

/* ---- Alternative SMTP (PHPMailer) — décommenter et configurer si besoin :
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
$m = new PHPMailer(true);
$m->isSMTP();
$m->Host = 'smtp.exemple.com';
$m->SMTPAuth = true;
$m->Username = 'user';
$m->Password = 'pass';
$m->Port = 587;
$m->setFrom('no-reply@adamlaarais.fr', 'Portfolio');
$m->addAddress($TO);
$m->addReplyTo($email, "$prenom $nom");
$m->Subject = $subject;
$m->Body = $body;
$m->send();
echo json_encode(['ok' => true]); exit;
---- */

// Envoi désactivé → le front bascule sur le fallback mailto.
http_response_code(501);
echo json_encode(['ok' => false, 'error' => 'not_configured']);
