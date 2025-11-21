// === ФУНКЦИИ ДЛЯ РАБОТЫ С КУРСАМИ ===

// Загрузить курсы с сервера
function loadCourses(filters = {}) {
    console.log('Загружаем курсы...', filters);
    
    showLoading(true);
    hideNoCourses();
    
    let url = `${API_URL}?action=getCourses`;
    
    if (filters.direction) {
        url += `&direction=${encodeURIComponent(filters.direction)}`;
    }
    if (filters.format) {
        url += `&format=${encodeURIComponent(filters.format)}`;
    }
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки курсов');
            }
            return response.json();
        })
        .then(courses => {
            showLoading(false);
            console.log('Загружено курсов:', courses.length);
            
            // Применяем поиск если есть
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                courses = courses.filter(course => 
                    course.title.toLowerCase().includes(searchTerm) ||
                    course.description.toLowerCase().includes(searchTerm) ||
                    course.instructor.toLowerCase().includes(searchTerm)
                );
            }
            
            displayCourses(courses);
        })
        .catch(error => {
            showLoading(false);
            console.error('Ошибка загрузки курсов:', error);
            // Демо-данные при ошибке
            loadDemoCourses(filters);
        });
}

// Демо-данные для fallback
function loadDemoCourses(filters = {}) {
    const demoCourses = [
        {
            id: 1,
            title: "Введение в программирование на Python",
            description: "Основы программирования для начинающих",
            instructor: "Иван Петров",
            direction: "IT",
            format: "online",
            schedule: "Пн, Ср 14:00-16:00",
            duration: "8 недель"
        },
        {
            id: 2,
            title: "Веб-дизайн для начинающих",
            description: "Создание современных веб-интерфейсов",
            instructor: "Мария Сидорова", 
            direction: "Дизайн",
            format: "offline",
            schedule: "Вт, Чт 10:00-12:00",
            duration: "6 недель"
        },
        {
            id: 3,
            title: "Основы маркетинга",
            description: "Основные принципы современного маркетинга",
            instructor: "Анна Козлова",
            direction: "Маркетинг", 
            format: "hybrid",
            schedule: "Пт 16:00-18:00",
            duration: "4 недели"
        },
        {
            id: 4,
            title: "Базы данных SQL",
            description: "Работа с реляционными базами данных",
            instructor: "Дмитрий Иванов",
            direction: "IT",
            format: "online",
            schedule: "Вт, Чт 18:00-20:00",
            duration: "6 недель"
        },
        {
            id: 5,
            title: "Графический дизайн",
            description: "Создание визуального контента",
            instructor: "Ольга Петрова",
            direction: "Дизайн",
            format: "offline",
            schedule: "Ср, Пт 14:00-16:00",
            duration: "8 недель"
        }
    ];
    
    let filteredCourses = demoCourses;
    
    if (filters.direction) {
        filteredCourses = filteredCourses.filter(course => course.direction === filters.direction);
    }
    
    if (filters.format) {
        filteredCourses = filteredCourses.filter(course => course.format === filters.format);
    }
    
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredCourses = filteredCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm)
        );
    }
    
    setTimeout(() => {
        showLoading(false);
        displayCourses(filteredCourses);
    }, 1000);
}

// Отобразить курсы на странице
function displayCourses(courses) {
    const container = document.getElementById('coursesList');
    const user = getCurrentUser();
    
    if (!courses || courses.length === 0) {
        showNoCourses('Курсы не найдены');
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = courses.map(course => `
        <div class="course-card">
            <h3>${course.title || 'Название курса'}</h3>
            
            <div class="course-meta">
                <span>Преподаватель: ${course.instructor || 'Не указан'}</span>
                <span class="course-format format-${course.format || 'online'}">
                    ${getFormatText(course.format)}
                </span>
            </div>
            
            <div class="course-description">
                ${course.description || 'Описание курса'}
            </div>
            
            <div class="course-details">
                <div class="course-meta">
                    <strong>Направление: ${course.direction || 'Не указано'}</strong>
                    ${course.duration ? `<span>Длительность: ${course.duration}</span>` : ''}
                </div>
            </div>
            
            <div class="course-schedule">
                <strong>Расписание:</strong> ${course.schedule || 'Не указано'}
            </div>
            
            <button class="register-btn" 
                    onclick="registerForCourse(${course.id})"
                    ${user && user.role === 'student' ? '' : 'disabled'}>
                ${getRegisterButtonText(user, course)}
            </button>
        </div>
    `).join('');
}

function getRegisterButtonText(user, course) {
    if (!user) {
        return 'Войдите для записи';
    }
    if (user.role !== 'student') {
        return 'Только для студентов';
    }
    
    // Проверяем, не записан ли уже студент на этот курс
    const registrations = getStudentRegistrations();
    const isRegistered = registrations.some(reg => 
        reg.studentId === user.id && reg.courseId === course.id
    );
    
    if (isRegistered) {
        return 'Вы уже записаны';
    }
    
    return 'Записаться на курс';
}

function getFormatText(format) {
    const formats = {
        'online': 'Онлайн',
        'offline': 'Очно', 
        'hybrid': 'Гибридный'
    };
    return formats[format] || format || 'Онлайн';
}

// Функции для работы с записями на курсы
const STORAGE_KEY = 'studentRegistrations';

function getStudentRegistrations() {
    const registrations = localStorage.getItem(STORAGE_KEY);
    return registrations ? JSON.parse(registrations) : [];
}

function saveStudentRegistrations(registrations) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

function registerStudentForCourse(studentId, courseId) {
    const registrations = getStudentRegistrations();
    
    // Проверяем, не записан ли уже студент на этот курс
    const existingRegistration = registrations.find(reg => 
        reg.studentId === studentId && reg.courseId === courseId
    );
    
    if (existingRegistration) {
        return { success: false, message: 'Вы уже записаны на этот курс' };
    }
    
    // Добавляем новую запись
    const newRegistration = {
        studentId: studentId,
        courseId: courseId,
        registrationDate: new Date().toISOString(),
        progress: "0%"
    };
    
    registrations.push(newRegistration);
    saveStudentRegistrations(registrations);
    
    return { success: true, message: 'Вы успешно записались на курс' };
}

function unregisterStudentFromCourse(studentId, courseId) {
    const registrations = getStudentRegistrations();
    
    // Удаляем запись о регистрации
    const updatedRegistrations = registrations.filter(reg => 
        !(reg.studentId === studentId && reg.courseId === courseId)
    );
    
    saveStudentRegistrations(updatedRegistrations);
    
    return { success: true, message: 'Вы отписались от курса' };
}

function registerForCourse(courseId) {
    const user = getCurrentUser();
    
    if (!user) {
        alert('Для записи на курс необходимо войти в систему');
        window.location.href = 'login.html';
        return;
    }
    
    if (user.role !== 'student') {
        alert('Только студенты могут записываться на курсы');
        return;
    }
    
    // Проверяем, не записан ли уже
    const registrations = getStudentRegistrations();
    const isRegistered = registrations.some(reg => 
        reg.studentId === user.id && reg.courseId === courseId
    );
    
    if (isRegistered) {
        alert('Вы уже записаны на этот курс');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите записаться на этот курс?')) {
        return;
    }
    
    console.log('Записываемся на курс:', courseId);
    showLoading(true);
    
    // Пытаемся отправить на сервер
    fetch(`${API_URL}?action=register&studentId=${user.id}&courseId=${courseId}`)
        .then(response => response.json())
        .then(result => {
            showLoading(false);
            if (result.success) {
                alert('Успешно записались на курс!');
                loadCourses(getCurrentFilters());
            } else {
                alert('Ошибка: ' + result.message);
            }
        })
        .catch(error => {
            showLoading(false);
            console.error('Ошибка записи:', error);
            // Демо-режим при ошибке - сохраняем в localStorage
            const demoResult = registerStudentForCourse(user.id, courseId);
            if (demoResult.success) {
                alert('Вы успешно записались на курс! (демо-режим)');
                loadCourses(getCurrentFilters());
            } else {
                alert('Ошибка: ' + demoResult.message);
            }
        });
}

function getCurrentFilters() {
    const direction = document.getElementById('directionFilter').value;
    const format = document.getElementById('formatFilter').value;
    const search = document.getElementById('searchInput').value;
    
    const filters = {};
    if (direction) filters.direction = direction;
    if (format) filters.format = format;
    if (search) filters.search = search;
    
    return filters;
}

function applyFilters() {
    const filters = getCurrentFilters();
    console.log('Применяем фильтры:', filters);
    loadCourses(filters);
}

function clearFilters() {
    document.getElementById('directionFilter').value = '';
    document.getElementById('formatFilter').value = '';
    document.getElementById('searchInput').value = '';
    loadCourses();
}

function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value;
    const filters = getCurrentFilters();
    
    if (searchTerm) {
        filters.search = searchTerm;
    }
    
    console.log('Поиск:', searchTerm);
    loadCourses(filters);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchCourses();
            }
        });
    }
}

function showNoCourses(message = 'Курсы не найдены') {
    const noCourses = document.getElementById('noCourses');
    if (noCourses) {
        noCourses.style.display = 'block';
        noCourses.innerHTML = `
            <h3>${message}</h3>
            <p>Попробуйте изменить фильтры</p>
        `;
    }
}

function hideNoCourses() {
    const noCourses = document.getElementById('noCourses');
    if (noCourses) {
        noCourses.style.display = 'none';
    }
}

function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Courses module loaded');
    setupSearch();
    loadCourses();
});