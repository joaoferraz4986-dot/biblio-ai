<?php $pageTitle = 'Desejos';
require __DIR__ . '/../app/views/includes/header.php';
$items = [];
foreach (($_SESSION['wishlist'] ?? []) as $id) {
    $product = findProduct($id);
    if ($product) {
        $items[] = $product;
    }
} ?>
<section class="page-intro compact"><p class="eyebrow">Salvos para depois</p><h1>Lista de desejos.</h1><p>Peças que você quer manter por perto.</p></section>
<?php if (!$items) :
    ?><div class="empty-state"><div class="empty-mark">♡</div><h2>Nenhum desejo ainda.</h2><p>Salve peças enquanto explora a coleção.</p><a class="button dark" href="/shop.php">Ver catálogo ↗</a></div><?php
else :
    ?><div class="product-grid catalog-grid"><?php foreach ($items as $product) :
    ?><article class="product-card"><a href="/product.php?id=<?= $product['id'] ?>" class="product-image"><img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>"></a><div class="product-info"><div><p><?= htmlspecialchars($product['category']) ?></p><h3><?= htmlspecialchars($product['name']) ?></h3></div><strong><?= money($product['price']) ?></strong></div><form action="/actions.php" method="post"><input type="hidden" name="action" value="add_cart"><input type="hidden" name="id" value="<?= $product['id'] ?>"><button class="add-line" type="submit">Adicionar à sacola <span>+</span></button></form></article><?php
    endforeach; ?></div><?php
endif; ?>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
