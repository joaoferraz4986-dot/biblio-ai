<?php $pageTitle = 'Buscar';
require __DIR__ . '/../app/views/includes/header.php';
$query = trim($_GET['q'] ?? '');
$products = $query ? array_values(array_filter(allProducts(), fn($p) => stripos($p['name'] . ' ' . $p['category'] . ' ' . $p['description'], $query) !== false)) : []; ?>
<section class="search-page"><p class="eyebrow">Pesquisa no arquivo</p><h1>O que você procura?</h1><form class="big-search"><input autofocus type="search" name="q" value="<?= htmlspecialchars($query) ?>" placeholder="Digite nome, categoria ou palavra-chave"><button type="submit">Buscar ↗</button></form><?php if ($query) :
    ?><div class="catalog-count"><?= count($products) ?> resultado(s) para “<?= htmlspecialchars($query) ?>”</div><div class="product-grid catalog-grid"><?php foreach ($products as $product) :
    ?><article class="product-card"><a href="/product.php?id=<?= $product['id'] ?>" class="product-image"><img src="<?= htmlspecialchars($product['image']) ?>" alt=""></a><div class="product-info"><div><p><?= htmlspecialchars($product['category']) ?></p><h3><?= htmlspecialchars($product['name']) ?></h3></div><strong><?= money($product['price']) ?></strong></div></article><?php
    endforeach; ?></div><?php
                                                                                                                                                                           endif; ?></section>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
