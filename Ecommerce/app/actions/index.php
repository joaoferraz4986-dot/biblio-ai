<?php

require_once __DIR__ . '/../config/config.php';
$action = $_POST['action'] ?? '';
$_SESSION['cart'] = $_SESSION['cart'] ?? [];
$_SESSION['wishlist'] = $_SESSION['wishlist'] ?? [];
if ($action === 'add_cart') {
    $id = (int)$_POST['id'];
    $quantity = max(1, (int)($_POST['quantity'] ?? 1));
    if (findProduct($id)) {
        $_SESSION['cart'][$id] = ($_SESSION['cart'][$id] ?? 0) + $quantity;
    } header('Location: cart.php');
    exit;
} if ($action === 'remove_cart') {
    unset($_SESSION['cart'][(int)$_POST['id']]);
    header('Location: cart.php');
    exit;
} if ($action === 'toggle_wishlist') {
    $id = (int)$_POST['id'];
    if (in_array($id, $_SESSION['wishlist'])) {
        $_SESSION['wishlist'] = array_values(array_diff($_SESSION['wishlist'], [$id]));
    } else {
        $_SESSION['wishlist'][] = $id;
    }
    header('Location: ' . ($_SERVER['HTTP_REFERER'] ?? 'wishlist.php'));
    exit;
} if ($action === 'save_profile') {
    $_SESSION['profile'] = ['name' => trim($_POST['name'] ?: 'Ana Martins'),'email' => trim($_POST['email'] ?: 'ana@exemplo.com'),'image' => trim($_POST['image'] ?? '')];
    header('Location: account.php?saved=1');
    exit;
} if ($action === 'create_supplier' && $pdo) {
    $stmt = $pdo->prepare('INSERT INTO supplier (name, contact_email, phone) VALUES (?, ?, ?)');
    $stmt->execute([trim($_POST['name']), trim($_POST['email']), trim($_POST['phone'])]);
    header('Location: admin/suppliers.php?created=1');
    exit;
} if ($action === 'create_product' && $pdo) {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('INSERT INTO product (seller_id, supplier_id, category_id, name, description, price, quantity, sku) VALUES (1, ?, ?, ?, ?, ?, ?, ?)');
    $sku = 'VM-' . strtoupper(substr(sha1(uniqid('', true)), 0, 8));
    $stmt->execute([($_POST['supplier_id'] ?: null), (int)$_POST['category_id'], trim($_POST['name']), trim($_POST['description']), (float)$_POST['price'], max(0, (int)$_POST['quantity']), $sku]);
    $productId = (int)$pdo->lastInsertId();
    $stock = $pdo->prepare('INSERT INTO stock (product_id, supplier_id, quantity, min_quantity) VALUES (?, ?, ?, 2)');
    $stock->execute([$productId, ($_POST['supplier_id'] ?: null), max(0, (int)$_POST['quantity'])]);
    $pdo->commit();
    header('Location: admin/products.php?created=1');
    exit;
} if ($action === 'checkout') {
    $_SESSION['cart'] = [];
    header('Location: account.php?order=1');
    exit;
} header('Location: index.php');
