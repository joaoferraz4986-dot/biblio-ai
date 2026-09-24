<?php

require_once __DIR__ . '/config.php';
function adminCategories()
{
    global $pdo;
    if ($pdo) {
        return $pdo->query('SELECT id, name FROM category ORDER BY name')->fetchAll();
    } return [['id' => 1,'name' => 'Casacos'],['id' => 2,'name' => 'Acessórios'],['id' => 3,'name' => 'Calçados'],['id' => 4,'name' => 'Essenciais'],['id' => 5,'name' => 'Bolsas']];
}
function suppliers()
{
    global $pdo;
    if ($pdo) {
        return $pdo->query('SELECT s.id, s.name, s.contact_email, s.phone, s.status, COUNT(p.id) AS products FROM supplier s LEFT JOIN product p ON p.supplier_id=s.id GROUP BY s.id ORDER BY s.name')->fetchAll();
    } return [];
}
function adminProducts()
{
    global $pdo;
    if ($pdo) {
        return $pdo->query('SELECT p.id, p.name, p.price, p.quantity, p.sku, c.name AS category, s.name AS supplier FROM product p LEFT JOIN category c ON c.id=p.category_id LEFT JOIN supplier s ON s.id=p.supplier_id ORDER BY p.created_at DESC')->fetchAll();
    } return allProducts();
}
