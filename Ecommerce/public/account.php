<?php $pageTitle = 'Conta';
require __DIR__ . '/../app/views/includes/header.php';
$profile = $_SESSION['profile'] ?? ['name' => 'Ana Martins','email' => 'ana@exemplo.com','image' => '']; ?>
<section class="page-intro compact"><p class="eyebrow">Área pessoal</p><h1>Conta e configurações.</h1><p>Cuide dos seus dados e personalize seu espaço.</p></section>
<?php if (isset($_GET['saved'])) :
    ?><div class="notice">Perfil atualizado com sucesso.</div><?php
endif; ?><?php if (isset($_GET['order'])) :
    ?><div class="notice">Pedido recebido. Obrigado por escolher com calma.</div><?php
endif; ?><div class="settings-layout"><aside class="settings-nav"><a class="selected" href="/account.php">Perfil</a><a href="/wishlist.php">Meus desejos</a><a href="/cart.php">Pedidos e sacola</a><a href="/about.php">Preferências</a></aside><form class="settings-form" action="/actions.php" method="post"><input type="hidden" name="action" value="save_profile"><div class="profile-preview"><div class="profile-avatar"><?= strtoupper(substr($profile['name'], 0, 1)) ?></div><div><h3><?= htmlspecialchars($profile['name']) ?></h3><p>Cliente desde 2026</p></div></div><label>Nome completo<input type="text" name="name" value="<?= htmlspecialchars($profile['name']) ?>"></label><label>E-mail<input type="email" name="email" value="<?= htmlspecialchars($profile['email']) ?>"></label><label>Imagem do perfil<input type="url" name="image" value="<?= htmlspecialchars($profile['image']) ?>" placeholder="https://..."><small>Você pode colar a URL de uma imagem hospedada.</small></label><div class="form-section"><p class="eyebrow">Preferências</p><label class="check"><input type="checkbox" checked> Receber novidades da curadoria</label><label class="check"><input type="checkbox" checked> Avisar quando um desejo voltar ao estoque</label></div><button class="button dark" type="submit">Salvar alterações ↗</button></form></div>
<?php require __DIR__ . '/../app/views/includes/footer.php'; ?>
