<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['image' => null]);
    exit;
}
$ctx = stream_context_create(['http' => [
    'timeout' => 5,
    'user_agent' => 'Mozilla/5.0 (compatible; MotPsyBot/1.0)',
    'follow_location' => true,
]]);
$html = @file_get_contents($url, false, $ctx);
if (!$html) { echo json_encode(['image' => null]); exit; }
preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']/i', $html, $m);
if (!$m) preg_match('/<meta[^>]+content=["\'](.*?)["\'"][^>]+property=["\']og:image["\']/i', $html, $m);
if (!$m) preg_match('/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\'](.*?)["\']/i', $html, $m);
if (!$m) preg_match('/<meta[^>]+content=["\'](.*?)["\'"][^>]+name=["\']twitter:image["\']/i', $html, $m);
echo json_encode(['image' => isset($m[1]) ? htmlspecialchars_decode($m[1]) : null]);
