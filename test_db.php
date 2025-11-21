<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "База данных подключена успешно! Пользователей: " . $result['count'];
} catch(PDOException $e) {
    echo "Ошибка: " . $e->getMessage();
}
?>