<?php

require_once __DIR__ . '/../../config/config.php';
$pageTitle = $pageTitle ?? "Egregora's Market";
?>
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($pageTitle) ?> · Egregora's Market</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/main.css">
</head>
<body>
<div class="site-shell">
<aside class="sidebar">
<a class="brand" href="/index.php"><span>EM</span><strong>Egregora<br>Market</strong></a>
<div class="side-rule"></div>
<nav class="main-nav" aria-label="Navegação principal">
<a href="/index.php" class="<?= basename($_SERVER['PHP_SELF']) === 'index.php' ? 'active' : '' ?>"><span>01</span>Descobrir</a>
<a href="/shop.php" class="<?= basename($_SERVER['PHP_SELF']) === 'shop.php' ? 'active' : '' ?>"><span>02</span>Comprar</a>
<a href="/wishlist.php" class="<?= basename($_SERVER['PHP_SELF']) === 'wishlist.php' ? 'active' : '' ?>"><span>03</span>Desejos <em><?= count($_SESSION['wishlist'] ?? []) ?></em></a>
<a href="/cart.php" class="<?= basename($_SERVER['PHP_SELF']) === 'cart.php' ? 'active' : '' ?>"><span>04</span>Sacola <em><?= cartCount() ?></em></a>
</nav>
<div class="sidebar-bottom"><a href="/account.php">Configurações</a><a href="/admin/products.php">Catálogo</a><a href="/admin/suppliers.php">Fornecedores</a></div>
</aside>
<main class="main-content">
<header class="topbar"><div class="breadcrumbs">EGREGORA'S MARKET <span>/</span> <?= strtoupper($pageTitle) ?></div><div class="top-actions"><a href="/search.php">Buscar</a><a href="/account.php" class="avatar"><?= strtoupper(substr($_SESSION['profile']['name'] ?? 'A', 0, 1)) ?></a></div></header>
