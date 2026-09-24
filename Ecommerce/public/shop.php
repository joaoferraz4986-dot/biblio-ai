<?php
$pageTitle = 'Comprar';
require __DIR__ . '/../app/views/includes/header.php';
$products = allProducts();
$category = $_GET['category'] ?? '';
$query = trim($_GET['q'] ?? '');
$sort = $_GET['sort'] ?? '';

if ($category) {
    $products = array_values(array_filter($products, fn($product) => strcasecmp($product['category'], $category) === 0));
}
if ($query) {
    $products = array_values(array_filter($products, fn($product) => stripos($product['name'] . ' ' . $product['category'], $query) !== false));
}
if ($sort === 'low') {
    usort($products, fn($a, $b) => $a['price'] <=> $b['price']);
}
if ($sort === 'high') {
    usort($products, fn($a, $b) => $b['price'] <=> $a['price']);
}
?>
<section class="page-intro">
    <p class="eyebrow">Catálogo completo</p>
    <h1>Escolha com calma.</h1>
    <p>Roupas, acessórios e objetos selecionados para acompanhar muitos anos.</p>
</section>
<div class="shop-toolbar">
    <div class="filter-links">
        <a class="<?= !$category ? 'selected' : '' ?>" href="/shop.php">Tudo</a>
        <a class="<?= $category === 'Casacos' ? 'selected' : '' ?>" href="/shop.php?category=Casacos">Casacos</a>
        <a class="<?= $category === 'Acessórios' ? 'selected' : '' ?>" href="/shop.php?category=Acessórios">Acessórios</a>
        <a class="<?= $category === 'Calçados' ? 'selected' : '' ?>" href="/shop.php?category=Calçados">Calçados</a>
        <a class="<?= $category === 'Essenciais' ? 'selected' : '' ?>" href="/shop.php?category=Essenciais">Essenciais</a>
    </div>
    <form>
        <input type="hidden" name="category" value="<?= htmlspecialchars($category) ?>">
        <select name="sort" onchange="this.form.submit()">
            <option value="">Ordenar por</option>
            <option value="low" <?= $sort === 'low' ? 'selected' : '' ?>>Menor preço</option>
            <option value="high" <?= $sort === 'high' ? 'selected' : '' ?>>Maior preço</option>
        </select>
    </form>
</div>
<div class="catalog-count">
    <?= count($products) ?> peças encontradas
    <span><?= $query ? 'para “' . htmlspecialchars($query) . '”' : '' ?></span>
</div>
<div class="product-grid catalog-grid">
    <?php foreach ($products as $product): ?>
        <?php require __DIR__ . '/../app/views/includes/product-card.php'; ?>
    <?php endforeach; ?>
</div>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
