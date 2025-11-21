<?php
// config.php
$host = 'localhost';
$dbname = 'curs';  // Изменили на новое название БД
$username = 'root';
$password = '';    // По умолчанию в XAMPP пароль пустой

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Ошибка подключения: " . $e->getMessage());
}
?>