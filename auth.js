// === КОНФИГУРАЦИЯ ===
const API_URL = 'http://localhost/courses-platform/api.php';

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЕМ ===
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function updateUI() {
    const user = getCurrentUser();
    const loginLink = document.getElementById('loginLink');
    const profileLink = document.getElementById('profileLink');
    const adminLink = document.getElementById('adminLink');
    const logoutLink = document.getElementById('logoutLink');
    const userName = document.getElementById('userName');
    const registerLink = document.getElementById('registerLink');

    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (userName) {
            userName.style.display = 'block';
            userName.textContent = `${user.name} (${user.role})`;
        }
        
        if (user.role === 'admin') {
            if (adminLink) adminLink.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';
        } else if (user.role === 'student') {
            if (adminLink) adminLink.style.display = 'none';
            if (profileLink) profileLink.style.display = 'block';
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userName) userName.style.display = 'none';
    }
}

function login(email, password) {
    console.log('Пытаемся войти с:', email);
    showLoading(true);
    
    fetch(`${API_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
        .then(response => response.json())
        .then(data => {
            showLoading(false);
            
            if (data.success) {
                setCurrentUser(data.user);
                updateUI();
                alert(`Добро пожаловать, ${data.user.name}!`);
                window.location.href = 'index.php';
            } else {
                alert('Ошибка: ' + data.error);
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Ошибка входа:', error);
            demoLogin(email, password);
        });
}

function registerUser(email, password, name, phone) {
    showLoading(true);
    
    fetch(`${API_URL}?action=register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            name: name,
            phone: phone
        })
    })
    .then(response => response.json())
    .then(data => {
        showLoading(false);
        
        if (data.success) {
            setCurrentUser(data.user);
            updateUI();
            alert('Регистрация успешна! Добро пожаловать!');
            window.location.href = 'index.php';
        } else {
            alert('Ошибка: ' + data.message);
        }
    })
    .catch(error => {
        showLoading(false);
        console.error('Ошибка регистрации:', error);
        alert('Ошибка регистрации. Проверьте подключение к серверу.');
    });
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentUser');
        updateUI();
        window.location.href = 'index.php';
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function demoLogin(email, password) {
    console.log('Демо-вход:', email);
    showLoading(true);
    
    setTimeout(() => {
        const user = demoAuthenticate(email, password);
        showLoading(false);
        
        if (user) {
            setCurrentUser(user);
            updateUI();
            alert(`Добро пожаловать, ${user.name}! (демо-режим)`);
            window.location.href = 'index.php';
        } else {
            alert('Ошибка: Неверный email или пароль');
        }
    }, 1000);
}

function demoAuthenticate(email, password) {
    const demoUsers = [
        {
            id: 1,
            email: "student@college.edu",
            password: "123",
            role: "student",
            name: "Алексей Студентов"
        },
        {
            id: 2,
            email: "admin@college.edu",
            password: "admin", 
            role: "admin",
            name: "Мария Админова"
        }
    ];
    
    return demoUsers.find(u => u.email === email && u.password === password);
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

function isStudent() {
    const user = getCurrentUser();
    return user && user.role === 'student';
}

function requireAuth(requiredRole = null) {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.php';
        return false;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        alert('У вас нет доступа к этой странице');
        window.location.href = 'index.php';
        return false;
    }
    
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    console.log('Auth module loaded. Current user:', getCurrentUser());
});