<?php
header('Content-Type: application/json');
$DB = '/home/debian/motpsy-push/subscriptions.db';

$raw = file_get_contents('php://input');
$sub = json_decode($raw, true);
if (!$sub || empty($sub['endpoint'])) {
  http_response_code(400);
  echo json_encode(['error' => 'invalid']);
  exit;
}
try {
  $db = new PDO('sqlite:' . $DB);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $stmt = $db->prepare('DELETE FROM subs WHERE endpoint = :e');
  $stmt->execute([':e' => $sub['endpoint']]);
  echo json_encode(['ok' => true]);
} catch (Exception $ex) {
  http_response_code(500);
  echo json_encode(['error' => 'db']);
}
