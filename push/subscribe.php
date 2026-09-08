<?php
header('Content-Type: application/json');
$DB = '/home/debian/motpsy-push/subscriptions.db';

$raw = file_get_contents('php://input');
$sub = json_decode($raw, true);
if (!$sub || empty($sub['endpoint']) || empty($sub['keys']['p256dh']) || empty($sub['keys']['auth'])) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid subscription']);
  exit;
}

try {
  $db = new PDO('sqlite:' . $DB);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->exec('CREATE TABLE IF NOT EXISTS subs (
    endpoint TEXT PRIMARY KEY,
    p256dh   TEXT NOT NULL,
    auth     TEXT NOT NULL,
    created  TEXT NOT NULL
  )');
  $stmt = $db->prepare('INSERT INTO subs (endpoint, p256dh, auth, created)
    VALUES (:e, :p, :a, :c)
    ON CONFLICT(endpoint) DO UPDATE SET p256dh=:p, auth=:a');
  $stmt->execute([
    ':e' => $sub['endpoint'],
    ':p' => $sub['keys']['p256dh'],
    ':a' => $sub['keys']['auth'],
    ':c' => gmdate('c')
  ]);
  echo json_encode(['ok' => true]);
} catch (Exception $ex) {
  http_response_code(500);
  echo json_encode(['error' => 'db']);
}
