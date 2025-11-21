CREATE DATABASE IF NOT EXISTS curs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE curs;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    direction VARCHAR(64),
    format ENUM('online', 'offline', 'hybrid') DEFAULT 'online',
    duration VARCHAR(64),
    schedule VARCHAR(255),
    students INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS registrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress VARCHAR(32) DEFAULT '0%',
    UNIQUE KEY uniq_registration (student_id, course_id),
    CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (email, password, name, phone, role)
VALUES
    ('admin@college.edu', 'admin', 'Мария Админова', '+7 (900) 000-00-00', 'admin'),
    ('student@college.edu', '123', 'Алексей Студентов', '+7 (900) 111-11-11', 'student')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

INSERT INTO courses (title, description, instructor, direction, format, duration, schedule, students)
VALUES
    ('Введение в программирование на Python', 'Основы языка Python и базовые алгоритмы', 'Иван Петров', 'IT', 'online', '8 недель', 'Пн, Ср 14:00-16:00', 0),
    ('Веб-дизайн для начинающих', 'UI/UX основы и практические задания', 'Мария Сидорова', 'Дизайн', 'offline', '6 недель', 'Вт, Чт 10:00-12:00', 0),
    ('Основы маркетинга', 'Актуальные практики digital-маркетинга', 'Анна Козлова', 'Маркетинг', 'hybrid', '4 недели', 'Пт 16:00-18:00', 0),
    ('Базы данных SQL', 'Проектирование и оптимизация реляционных БД', 'Дмитрий Иванов', 'IT', 'online', '6 недель', 'Вт, Чт 18:00-20:00', 0),
    ('Графический дизайн', 'Работа с популярными графическими редакторами', 'Ольга Петрова', 'Дизайн', 'offline', '8 недель', 'Ср, Пт 14:00-16:00', 0)
ON DUPLICATE KEY UPDATE
    description = VALUES(description);

