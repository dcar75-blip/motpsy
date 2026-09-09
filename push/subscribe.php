<?php
header('Content-Type: application/json');
$DB = '/home/debian/motpsy-push/subscriptions.db';
$CRENEAUX = ['matin', 'midi', 'soir'];

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$sub = isset($data['subscription']) ? $data['subscription'] : null;
$creneau = isset($data['creneau']) ? $data['creneau'] : 'matin';
if (!in_array($creneau, $CRENEAUX, true)) $creneau = 'matin';

if (!$sub || empty($sub['endpoint']) || empty($sub['keys']['p256dh']) || empty($sub['keys']['auth'])) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid subscription']);
  exit;
}

try {
  $db = new PDO('sqlite:' . $DB);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $stmt = $db->prepare('INSERT INTO subs (endpoint, p256dh, auth, created, creneau)
    VALUES (:e, :p, :a, :c, :cr)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh=:p, auth=:a, creneau=:cr');
  $stmt->execute([
    ':e' => $sub['endpoint'],
    ':p' => $sub['keys']['p256dh'],
    ':a' => $sub['keys']['auth'],
    ':c' => gmdate('c'),
    ':cr' => $creneau
  ]);
  echo json_encode(['ok' => true, 'creneau' => $creneau]);
} catch (Exception $ex) {
  http_response_code(500);
  echo json_encode(['error' => 'db']);
}
