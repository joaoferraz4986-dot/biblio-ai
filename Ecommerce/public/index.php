<?php
$pageTitle = 'Descobrir';
require __DIR__ . '/../app/views/includes/header.php';
$products = allProducts();
?>
<section class="hero-grid">
    <div class="hero-copy">
        <p class="eyebrow">Coleção 04 — outono / inverno</p>
        <h1>O tempo<br><i>bem vestido.</i></h1>
        <p class="lead">Uma seleção de peças duráveis, objetos com história e essenciais que não seguem temporada.</p>
        <a class="button dark" href="/shop.php">Ver a coleção <span>↗</span></a>
    </div>
    <div class="hero-image">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85" alt="Editorial de moda vintage">
        <div class="image-caption">Arquivo VM · 1978—2026</div>
    </div>
</section>
<section class="marquee">
    <span>VESTIR BEM É ESCOLHER COM CALMA</span>
    <span>VESTIR BEM É ESCOLHER COM CALMA</span>
</section>
<section class="section-block">
    <div class="section-heading">
        <div>
            <p class="eyebrow">Escolha por capítulo</p>
            <h2>Comece por aqui</h2>
        </div>
        <a class="text-link" href="/shop.php">Ver tudo ↗</a>
    </div>
    <div class="category-grid">
        <a href="/shop.php?category=Casacos"><strong>01</strong><span>Casacos</span><small>Camadas essenciais</small></a>
        <a href="/shop.php?category=Acessórios"><strong>02</strong><span>Acessórios</span><small>Detalhes que contam</small></a>
        <a href="/shop.php?category=Calçados"><strong>03</strong><span>Calçados</span><small>Passos com história</small></a>
        <a href="/shop.php?category=Essenciais"><strong>04</strong><span>Essenciais</span><small>A base de tudo</small></a>
    </div>
</section>
<section class="section-block">
    <div class="section-heading">
        <div>
            <p class="eyebrow">Curadoria da semana</p>
            <h2>Peças em destaque</h2>
        </div>
        <a class="text-link" href="/shop.php">Explorar catálogo ↗</a>
    </div>
    <div class="product-grid">
        <?php foreach (array_slice($products, 0, 4) as $product): ?>
            <?php require __DIR__ . '/../app/views/includes/product-card.php'; ?>
        <?php endforeach; ?>
    </div>
</section>
<section class="manifesto">
    <div class="manifesto-mark">EM</div>
    <div>
        <p class="eyebrow">Nosso ponto de vista</p>
        <h2>Menos tendência.<br><i>Mais identidade.</i></h2>
        <p>Garimpamos roupas e objetos que melhoram com o uso. Nada de excesso, nada descartável: somente aquilo que merece espaço na sua história.</p>
        <a class="text-link" href="/about.php">Conheça o manifesto ↗</a>
    </div>
</section>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
