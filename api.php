<?php
// api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'login':
        login($pdo);
        break;
    case 'register':
        registerUser($pdo);
        break;
    case 'getCourses':
        getCourses($pdo);
        break;
    case 'registerCourse':
        registerForCourse($pdo);
        break;
    case 'getUserCourses':
        getUserCourses($pdo);
        break;
    default:
        echo json_encode(['error' => 'Unknown action']);
}

// Регистрация нового пользователя
function registerUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    
    // Проверяем, нет ли уже пользователя с таким email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Пользователь с таким email уже существует']);
        return;
    }
    
    // Добавляем нового пользователя
    $stmt = $pdo->prepare("INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, 'student')");
    
    if ($stmt->execute([$email, $password, $name, $phone])) {
        $userId = $pdo->lastInsertId();
        
        // Возвращаем данные пользователя (без пароля)
        $stmt = $pdo->prepare("SELECT id, email, name, phone, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'message' => 'Регистрация успешна', 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка регистрации']);
    }
}

// Вход пользователя
function login($pdo) {
    $email = $_GET['email'] ?? '';
    $password = $_GET['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && $user['password'] === $password) {
        unset($user['password']); // Не возвращаем пароль
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Неверный email или пароль']);
    }
}

// Получение курсов
function getCourses($pdo) {
    $direction = $_GET['direction'] ?? '';
    $format = $_GET['format'] ?? '';
    
    $sql = "SELECT * FROM courses WHERE 1=1";
    $params = [];
    
    if ($direction) {
        $sql .= " AND direction = ?";
        $params[] = $direction;
    }
    
    if ($format) {
        $sql .= " AND format = ?";
        $params[] = $format;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($courses);
}

// Запись на курс
function registerForCourse($pdo) {
    $studentId = $_GET['studentId'] ?? '';
    $courseId = $_GET['courseId'] ?? '';
    
    // Проверяем, не записан ли уже
    $stmt = $pdo->prepare("SELECT * FROM registrations WHERE student_id = ? AND course_id = ?");
    $stmt->execute([$studentId, $courseId]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Вы уже записаны на этот курс']);
        return;
    }
    
    // Добавляем запись
    $stmt = $pdo->prepare("INSERT INTO registrations (student_id, course_id) VALUES (?, ?)");
    if ($stmt->execute([$studentId, $courseId])) {
        echo json_encode(['success' => true, 'message' => 'Вы успешно записались на курс!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка записи на курс']);
    }
}

// Получение курсов пользователя
function getUserCourses($pdo) {
    $studentId = $_GET['studentId'] ?? '';
    
    $stmt = $pdo->prepare("
        SELECT c.*, r.registration_date, r.progress 
        FROM courses c 
        INNER JOIN registrations r ON c.id = r.course_id 
        WHERE r.student_id = ?
    ");
    $stmt->execute([$studentId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($courses);
}
?>