<?php
$product = $product ?? [];
$showAction = $showAction ?? true;
?>
<article class="product-card">
    <a href="/product.php?id=<?= (int) $product['id'] ?>" class="product-image">
        <img src="<?= htmlspecialchars($product['image']) ?>" alt="<?= htmlspecialchars($product['name']) ?>">
        <?php if (!empty($product['tag'])): ?>
            <span><?= htmlspecialchars($product['tag']) ?></span>
        <?php endif; ?>
    </a>
    <div class="product-info">
        <div>
            <p><?= htmlspecialchars($product['category']) ?></p>
            <h3><?= htmlspecialchars($product['name']) ?></h3>
        </div>
        <strong><?= money($product['price']) ?></strong>
    </div>
    <?php if ($showAction): ?>
        <form action="/actions.php" method="post">
            <input type="hidden" name="action" value="add_cart">
            <input type="hidden" name="id" value="<?= (int) $product['id'] ?>">
            <button class="add-line" type="submit">
                Adicionar à sacola
                <span>+</span>
            </button>
        </form>
    <?php endif; ?>
</article>
