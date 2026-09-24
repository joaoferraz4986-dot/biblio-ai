<?php $pageTitle = 'Sacola';
require __DIR__ . '/../app/views/includes/header.php';
$cart = $_SESSION['cart'] ?? [];
$items = [];
$total = 0;
foreach ($cart as $id => $quantity) {
    $product = findProduct($id);
    if ($product) {
        $product['quantity'] = $quantity;
        $product['subtotal'] = $product['price'] * $quantity;
        $total += $product['subtotal'];
        $items[] = $product;
    }
} ?>
<section class="page-intro compact"><p class="eyebrow">Sua seleção</p><h1>Sacola.</h1><p><?= count($items) ?> item(ns) esperando por você.</p></section>
<?php if (!$items) :
    ?><div class="empty-state"><div class="empty-mark">○</div><h2>Sua sacola está vazia.</h2><p>Encontre algo com história para levar com você.</p><a class="button dark" href="/shop.php">Explorar peças ↗</a></div><?php
else :
    ?><div class="cart-layout"><div class="cart-items"><?php foreach ($items as $item) :
    ?><div class="cart-row"><img src="<?= htmlspecialchars($item['image']) ?>" alt=""><div class="cart-row-info"><p><?= htmlspecialchars($item['category']) ?></p><h3><?= htmlspecialchars($item['name']) ?></h3><span>Quantidade: <?= $item['quantity'] ?></span></div><strong><?= money($item['subtotal']) ?></strong><form action="/actions.php" method="post"><input type="hidden" name="action" value="remove_cart"><input type="hidden" name="id" value="<?= $item['id'] ?>"><button class="remove" type="submit">×</button></form></div><?php
    endforeach; ?></div><aside class="summary"><p class="eyebrow">Resumo do pedido</p><div><span>Subtotal</span><strong><?= money($total) ?></strong></div><div><span>Frete</span><strong>Calculado no checkout</strong></div><hr><div class="summary-total"><span>Total</span><strong><?= money($total) ?></strong></div><form action="/actions.php" method="post"><input type="hidden" name="action" value="checkout"><button class="button dark full" type="submit">Finalizar pedido ↗</button></form><small>Você será direcionado para uma confirmação demonstrativa.</small></aside></div><?php
endif; ?>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
