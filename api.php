<?php
// api.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$action = $_GET['action'] ?? '';

// Логируем запросы для отладки
error_log("API Action: " . $action);

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
        echo json_encode(['error' => 'Unknown action: ' . $action]);
}

// Регистрация нового пользователя
function registerUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';
    $phone = $data['phone'] ?? '';
    
    error_log("Register attempt for: " . $email);
    
    // Проверяем, нет ли уже пользователя с таким email
    try {
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
    } catch (PDOException $e) {
        error_log("Database error in register: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
    }
}

// Вход пользователя
function login($pdo) {
    $email = $_GET['email'] ?? '';
    $password = $_GET['password'] ?? '';
    
    error_log("Login attempt for: " . $email);
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && $user['password'] === $password) {
            unset($user['password']); // Не возвращаем пароль
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Неверный email или пароль']);
        }
    } catch (PDOException $e) {
        error_log("Database error in login: " . $e->getMessage());
        echo json_encode(['success' => false, 'error' => 'Ошибка базы данных']);
    }
}

// Получение курсов
function getCourses($pdo) {
    $direction = $_GET['direction'] ?? '';
    $format = $_GET['format'] ?? '';
    
    try {
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
    } catch (PDOException $e) {
        error_log("Database error in getCourses: " . $e->getMessage());
        echo json_encode([]);
    }
}

// Запись на курс
function registerForCourse($pdo) {
    $studentId = $_GET['studentId'] ?? '';
    $courseId = $_GET['courseId'] ?? '';
    
    error_log("Course registration: student=$studentId, course=$courseId");
    
    if (empty($studentId) || empty($courseId)) {
        echo json_encode(['success' => false, 'message' => 'Не указан ID студента или курса']);
        return;
    }
    
    try {
        // Проверяем, не записан ли уже
        $stmt = $pdo->prepare("SELECT * FROM registrations WHERE student_id = ? AND course_id = ?");
        $stmt->execute([$studentId, $courseId]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Вы уже записаны на этот курс']);
            return;
        }
        
        // Проверяем существование студента
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'student'");
        $stmt->execute([$studentId]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Студент не найден']);
            return;
        }
        
        // Проверяем существование курса
        $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ?");
        $stmt->execute([$courseId]);
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Курс не найден']);
            return;
        }
        
        // Добавляем запись
        $stmt = $pdo->prepare("INSERT INTO registrations (student_id, course_id) VALUES (?, ?)");
        if ($stmt->execute([$studentId, $courseId])) {
            // Обновляем счетчик студентов на курсе
            $stmt = $pdo->prepare("UPDATE courses SET students = students + 1 WHERE id = ?");
            $stmt->execute([$courseId]);
            
            echo json_encode(['success' => true, 'message' => 'Вы успешно записались на курс!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Ошибка записи на курс']);
        }
    } catch (PDOException $e) {
        error_log("Database error in registerForCourse: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
    }
}

// Получение курсов пользователя
function getUserCourses($pdo) {
    $studentId = $_GET['studentId'] ?? '';
    
    if (empty($studentId)) {
        echo json_encode([]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT c.*, r.registration_date, r.progress 
            FROM courses c 
            INNER JOIN registrations r ON c.id = r.course_id 
            WHERE r.student_id = ?
        ");
        $stmt->execute([$studentId]);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($courses);
    } catch (PDOException $e) {
        error_log("Database error in getUserCourses: " . $e->getMessage());
        echo json_encode([]);
    }
}
?>
