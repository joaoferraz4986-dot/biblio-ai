<?php require_once __DIR__ . '/../app/config/config.php';
$product = findProduct((int)($_GET['id'] ?? 1));
if (!$product) {
    http_response_code(404);
    exit('Produto não encontrado');
} $pageTitle = $product['name'];
require __DIR__ . '/../app/views/includes/header.php'; ?>
<section class="product-detail"><div class="detail-image"><img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>"></div><div class="detail-copy"><p class="eyebrow"><?= htmlspecialchars($product['category']) ?> · edição VM</p><h1><?= htmlspecialchars($product['name']) ?></h1><div class="detail-price"><?= money($product['price']) ?></div><p class="detail-description"><?= htmlspecialchars($product['description']) ?></p><div class="detail-meta"><span>Entrega em todo o Brasil</span><span>Troca em até 30 dias</span><span>Pagamento seguro</span></div><form action="/actions.php" method="post" class="buy-form"><input type="hidden" name="action" value="add_cart"><input type="hidden" name="id" value="<?= $product['id'] ?>"><label>Quantidade <input type="number" name="quantity" min="1" value="1"></label><button class="button dark" type="submit">Adicionar à sacola <span>↗</span></button></form><form action="/actions.php" method="post"><input type="hidden" name="action" value="toggle_wishlist"><input type="hidden" name="id" value="<?= $product['id'] ?>"><button class="wishlist-button" type="submit">♡ Salvar nos desejos</button></form></div></section>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
