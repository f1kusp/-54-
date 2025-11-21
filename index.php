<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Курсы на виду - Колледж связи №54</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Шапка сайта -->
    <header>
        <nav class="navbar">
            <a href="index.php" class="nav-brand">Курсы Колледжа связи №54</a>
            <div class="nav-links">
                <a href="index.php">Все курсы</a>
                <a href="login.php" id="loginLink">Войти</a>
                <a href="register.php" id="registerLink">Регистрация</a>
                <a href="profile.php" id="profileLink" style="display:none;">Мои курсы</a>
                <a href="admin.php" id="adminLink" style="display:none;">Админ-панель</a>
                <a href="#" id="logoutLink" style="display:none;" onclick="logout()">Выйти</a>
                <span id="userName" style="display:none; margin-left: 15px;"></span>
            </div>
        </nav>
    </header>

    <!-- Основное содержимое -->
    <main class="container">
        <!-- Герой-секция -->
        <section class="hero">
            <h1>Добро пожаловать на платформу курсов!</h1>
            <p>Выбирайте из списка курсов по разным направлениям</p>
            <div class="college-name">Колледж связи №54</div>
        </section>

        <!-- Фильтры -->
        <div class="filters">
            <h3>Фильтры:</h3>
            <select id="directionFilter">
                <option value="">Все направления</option>
                <option value="IT">IT</option>
                <option value="Дизайн">Дизайн</option>
                <option value="Маркетинг">Маркетинг</option>
            </select>
            
            <select id="formatFilter">
                <option value="">Все форматы</option>
                <option value="online">Онлайн</option>
                <option value="offline">Очно</option>
                <option value="hybrid">Гибридный</option>
            </select>
            
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Поиск по названию курса...">
                <button onclick="searchCourses()">Найти</button>
            </div>
            
            <button onclick="applyFilters()">Применить фильтры</button>
            <button onclick="clearFilters()">Сбросить</button>
        </div>

        <!-- Блок загрузки -->
        <div id="loading" class="loading">
            Загружаем курсы...
        </div>

        <!-- Сетка курсов -->
        <div id="coursesList" class="courses-grid">
            <!-- Здесь появятся курсы автоматически -->
        </div>

        <!-- Сообщение если нет курсов -->
        <div id="noCourses" class="no-courses" style="display: none;">
            <h3>Курсы не найдены</h3>
            <p>Попробуйте изменить фильтры</p>
        </div>
    </main>

    <!-- Подвал -->
    <footer class="footer">
        <p>© 2025 Колледж связи №54. Все права защищены.</p>
    </footer>

    <!-- Подключаем JavaScript -->
    <script src="auth.js"></script>
    <script src="courses.js"></script>
</body>
</html>