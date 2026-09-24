<?php

session_start();

$envFile = __DIR__ . '/../../.env';
if (is_readable($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($value !== '' && (($value[0] ?? '') === '"' || ($value[0] ?? '') === "'")) {
            $value = trim($value, "\"'");
        }
        if (getenv($key) === false) {
            putenv($key . '=' . $value);
        }
    }
}

$host = getenv('MYSQL_HOST') ?: '127.0.0.1';
$port = getenv('MYSQL_PORT') ?: '3306';
$db = getenv('MYSQL_DATABASE') ?: 'e_commerce_php';
$user = getenv('MYSQL_USER') ?: 'root';
$pass = getenv('MYSQL_PASSWORD') ?: '';

try {
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (Throwable $error) {
    $pdo = null;
}

$demoProducts = [
    ['id' => 1,'name' => 'Jaqueta Heritage', 'category' => 'Casacos', 'price' => 389.90, 'old_price' => 459.90, 'image' => 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85', 'tag' => 'Mais vendido', 'description' => 'Algodão encorpado, corte clássico e acabamento pensado para atravessar temporadas.'],
    ['id' => 2,'name' => 'Óculos Clubmaster', 'category' => 'Acessórios', 'price' => 189.90, 'old_price' => 0, 'image' => 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', 'tag' => 'Novo', 'description' => 'Armação preta com lentes escuras e uma silhueta inspirada nos anos 60.'],
    ['id' => 3,'name' => 'Tênis 1978', 'category' => 'Calçados', 'price' => 299.90, 'old_price' => 349.90, 'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', 'tag' => '-15%', 'description' => 'Couro e sola de borracha para um visual honesto, confortável e atemporal.'],
    ['id' => 4,'name' => 'Relógio Manual', 'category' => 'Acessórios', 'price' => 429.90, 'old_price' => 0, 'image' => 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85', 'tag' => 'Edição limitada', 'description' => 'Mostrador limpo, pulseira em couro e mecanismo que celebra o tempo sem pressa.'],
    ['id' => 5,'name' => 'Camiseta Union', 'category' => 'Essenciais', 'price' => 119.90, 'old_price' => 149.90, 'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85', 'tag' => 'Clássico', 'description' => 'Malha premium de gramatura média, gola firme e caimento levemente solto.'],
    ['id' => 6,'name' => 'Bolsa Workwear', 'category' => 'Bolsas', 'price' => 269.90, 'old_price' => 0, 'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', 'tag' => 'Últimas unidades', 'description' => 'Canvas resistente, ferragens envelhecidas e espaço para a rotina inteira.']
];

function money($value)
{
    return 'R$ ' . number_format($value, 2, ',', '.');
}
function cartCount()
{
    return array_sum($_SESSION['cart'] ?? []);
}
function findProduct($id)
{
    global $demoProducts, $pdo;
    if ($pdo) {
        $stmt = $pdo->prepare('SELECT p.id, p.name, c.name AS category, p.price, p.description, pi.image_path AS image FROM product p LEFT JOIN category c ON c.id = p.category_id LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1 WHERE p.id = ? LIMIT 1');
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if ($product) {
            return $product;
        }
    } foreach ($demoProducts as $product) {
        if ((int)$product['id'] === (int)$id) {
            return $product;
        }
    } return null;
}
function allProducts()
{
    global $demoProducts, $pdo;
    if ($pdo) {
        $rows = $pdo->query('SELECT p.id, p.name, c.name AS category, p.price, p.description, pi.image_path AS image FROM product p LEFT JOIN category c ON c.id = p.category_id LEFT JOIN product_image pi ON pi.product_id = p.id AND pi.is_primary = 1 WHERE p.status = \'ACTIVE\' ORDER BY p.created_at DESC')->fetchAll();
        if ($rows) {
            return $rows;
        }
    } return $demoProducts;
}
