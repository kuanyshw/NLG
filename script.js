// NLG FITNESS SCRIPT
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initPreloader();
    initTheme();
    initPlugins();
    updateUI();
    renderAchievements();
    handleRouting();
    initFlappy();
    initCatcher();
    initMemory();
    loadReviews();
    
    // Добавление обработчика на нажатие Enter в формах
    const authInputs = document.querySelectorAll('#authModal input');
    authInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitAuth();
        });
    });

    const calcInputs = document.querySelectorAll('#tool-calc input');
    calcInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') calculateBody();
        });
    });

    const aiInputs = document.querySelectorAll('#tool-ai input, #tool-ai select');
    aiInputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                generateProgram();
            }
        });
    });
});

// === CUSTOM CURSOR ===
function initCursor() {
    const dot = document.getElementById('cursorDot');
    const outline = document.getElementById('cursorOutline');
    if(!dot || !outline) return;

    window.addEventListener('mousemove', (e) => {
        dot.style.top = e.clientY + 'px';
        dot.style.left = e.clientX + 'px';
        outline.style.top = e.clientY + 'px';
        outline.style.left = e.clientX + 'px';
    });

    const interactables = document.querySelectorAll('a, button, select, input, .tool-tab, .game-container, .clicker-area, .memory-card');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.width = '60px';
            outline.style.height = '60px';
            outline.style.backgroundColor = 'rgba(0, 195, 255, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.width = '40px';
            outline.style.height = '40px';
            outline.style.backgroundColor = 'transparent';
        });
    });
}

// === STATE MANAGEMENT (LocalStorage) ===
let currentUser = JSON.parse(localStorage.getItem('nlg_user')) || null;
let usersDB = JSON.parse(localStorage.getItem('nlg_usersDB')) || [];
let ordersDB = JSON.parse(localStorage.getItem('nlg_ordersDB')) || [];
let messagesDB = JSON.parse(localStorage.getItem('nlg_messagesDB')) || [];
let cart = JSON.parse(localStorage.getItem('nlg_cart')) || [];
let gameStats = JSON.parse(localStorage.getItem('nlg_game')) || { clicks: 0, reward: 0 };
let currentProgram = JSON.parse(localStorage.getItem('nlg_program')) || null;
let reviewsDB = JSON.parse(localStorage.getItem('nlg_reviewsDB')) || [];

function saveState() {
    if (currentUser) {
        localStorage.setItem('nlg_user', JSON.stringify(currentUser));
        const idx = usersDB.findIndex(u => u.email === currentUser.email);
        if(idx !== -1) usersDB[idx] = currentUser;
        else usersDB.push(currentUser);
        localStorage.setItem('nlg_usersDB', JSON.stringify(usersDB));
    }
    localStorage.setItem('nlg_cart', JSON.stringify(cart));
    localStorage.setItem('nlg_game', JSON.stringify(gameStats));
    localStorage.setItem('nlg_program', JSON.stringify(currentProgram));
    localStorage.setItem('nlg_ordersDB', JSON.stringify(ordersDB));
    localStorage.setItem('nlg_messagesDB', JSON.stringify(messagesDB));
    localStorage.setItem('nlg_reviewsDB', JSON.stringify(reviewsDB));
    updateUI();
}

// === PRELOADER ===
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderText = document.getElementById('loaderText');
    const loaderLogo = document.querySelector('.loader-logo');
    
    if(!preloader) return;

    if (window.gsap) {
        gsap.to(loaderLogo, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
        gsap.to(loaderBar, { width: '100%', duration: 2, ease: 'power2.inOut', onUpdate: function() {
            const progress = Math.round(this.progress() * 100);
            if(progress < 30) loaderText.innerText = "Инициализация систем...";
            else if(progress < 70) loaderText.innerText = "Загрузка нейросетей...";
            else loaderText.innerText = "Добро пожаловать в NLG FITNESS";
        }, onComplete: () => {
            gsap.to(preloader, { opacity: 0, duration: 0.5, onComplete: () => preloader.style.display = 'none' });
        }});
    } else {
        setTimeout(() => { preloader.style.display = 'none'; }, 1000);
    }
}

// === PLUGINS ===
function initPlugins() {
    // VanillaTilt
    if (window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
        });
    }

    // Particles.js
    if(window.particlesJS) {
        particlesJS("particles-js", {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#00c3ff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#00c3ff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
            },
            retina_detect: true
        });
    }

    // Intersection Observer for scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0) scale(1)';
                
                // Start counters
                if(entry.target.classList.contains('stats-counter')) {
                    const counters = entry.target.querySelectorAll('.counter');
                    counters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000;
                        const increment = target / (duration / 16);
                        
                        let current = 0;
                        const updateCounter = () => {
                            current += increment;
                            if(current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target + (target >= 1000 ? '+' : '');
                            }
                        };
                        updateCounter();
                    });
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));

    // Optional: add reveal class dynamically to some elements for better UX
    const sectionsToReveal = document.querySelectorAll('.section-title, .shop-subtitle, .tool-tab, .feature-box, .gaming-section .game-container, .contact-info');
    sectionsToReveal.forEach(el => {
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            observer.observe(el);
        }
    });
}

// === THEME ===
function initTheme() {
    if(localStorage.getItem('nlg_theme') === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('themeIcon').classList.replace('fa-moon', 'fa-sun');
    }
}
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const icon = document.getElementById('themeIcon');
    if(isLight) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('nlg_theme', 'light');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('nlg_theme', 'dark');
    }
}

// === MENU ===
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// === ROUTING (SPA) ===
function handleRouting() {
    const hash = window.location.hash || '#home';
    
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active-link');
    });

    // Show target page
    const targetPage = document.querySelector(hash);
    if (targetPage) {
        targetPage.classList.add('active');
        
        if (hash === '#progress') {
            renderProgress();
        }

        // Re-trigger animations
        const reveals = targetPage.querySelectorAll('.reveal');
        reveals.forEach((el, index) => {
            el.classList.remove('active');
            // Force reflow
            void el.offsetWidth;
            setTimeout(() => {
                el.classList.add('active');
            }, index * 100);
        });
    } else {
        const home = document.getElementById('home');
        if (home) home.classList.add('active');
    }

    // Highlight nav link
    const activeLink = document.querySelector(`.nav-links a[href="${hash}"]`);
    if (activeLink) activeLink.classList.add('active-link');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);

// === AUTH ===
let currentAuthTab = 'login';
function openAuth(type) {
    if(currentUser) return showToast('Вы уже авторизованы!', 'error');
    document.getElementById('authModal').classList.add('show');
    document.getElementById('authModal').style.display = 'flex';
    switchAuthTab(type);
}
function closeAuth() {
    document.getElementById('authModal').classList.remove('show');
    setTimeout(() => document.getElementById('authModal').style.display = 'none', 300);
}
function switchAuthTab(type) {
    currentAuthTab = type;
    document.getElementById('tabLogin').classList.toggle('active-tab', type === 'login');
    document.getElementById('tabRegister').classList.toggle('active-tab', type === 'register');
    document.getElementById('authNameField').style.display = type === 'register' ? 'block' : 'none';
    document.getElementById('authSubmitBtn').innerText = type === 'register' ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 'ВОЙТИ';
}
function submitAuth() {
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPass').value.trim();
    const name = document.getElementById('authName').value.trim();

    if(!email || !pass) return showToast('Заполните все поля!', 'error');

    if(currentAuthTab === 'register') {
        if(!name) return showToast('Введите имя!', 'error');
        if(usersDB.find(u => u.email === email)) return showToast('Пользователь уже существует!', 'error');
        
        currentUser = {
            name, email, pass, coins: 100, xp: 0, level: 1,
            workouts: 0, achievements: [], avatar: 'https://via.placeholder.com/120',
            subscription: null, subExp: null, role: 'user', lastCheckIn: null, progress: []
        };
        if(email === 'admin@nlg.kz') currentUser.role = 'admin';
        usersDB.push(currentUser);
        showToast('Регистрация успешна! +100 🪙', 'success');
    } else {
        const user = usersDB.find(u => u.email === email && u.pass === pass);
        if(!user) return showToast('Неверный логин или пароль!', 'error');
        currentUser = user;
        if (!currentUser.progress) currentUser.progress = [];
        showToast(`Добро пожаловать, ${currentUser.name}!`, 'success');
    }
    
    saveState();
    closeAuth();
}
function logout() {
    currentUser = null;
    currentProgram = null;
    cart = [];
    
    localStorage.removeItem('nlg_user');
    localStorage.removeItem('nlg_program');
    localStorage.removeItem('nlg_cart');
    
    // Reset AI form and result UI
    document.getElementById('aiResult').style.display = 'none';
    document.getElementById('aiEquipment').value = '';
    document.getElementById('resGoal').innerText = '';
    document.getElementById('resTags').innerHTML = '';
    document.getElementById('programGrid').innerHTML = '';
    
    // Reset Calculator form and result UI
    document.getElementById('calcWeight').value = '';
    document.getElementById('calcHeight').value = '';
    document.getElementById('calcAge').value = '';
    document.getElementById('resBMI').innerText = '0';
    document.getElementById('resMaint').innerText = '0';
    document.getElementById('resCut').innerText = '0';
    document.getElementById('resBulk').innerText = '0';

    updateUI();
    showToast('Вы вышли из системы', 'success');
}

// === UI UPDATE ===
function updateUI() {
    const userPanel = document.getElementById('userPanel');
    const authBtnContainer = document.getElementById('authBtnContainer');
    const mobileAuthLink = document.getElementById('mobileAuthLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    
    if(currentUser) {
        userPanel.style.display = 'flex';
        authBtnContainer.style.display = 'none';
        mobileAuthLink.style.display = 'none';
        mobileProfileLink.style.display = 'block';
        
        document.getElementById('displayUserName').innerText = currentUser.name;
        document.getElementById('userCoins').innerText = currentUser.coins;
        document.getElementById('headerAvatar').src = currentUser.avatar;
        document.getElementById('btnCheckIn').style.display = 'flex';
        document.getElementById('btnMyProg').style.display = currentProgram ? 'flex' : 'none';
        
        if(currentUser.role === 'admin') document.querySelector('.admin-trigger').style.display = 'inline-block';
        else document.querySelector('.admin-trigger').style.display = 'none';
    } else {
        userPanel.style.display = 'none';
        authBtnContainer.style.display = 'flex';
        mobileAuthLink.style.display = 'block';
        mobileProfileLink.style.display = 'none';
        document.querySelector('.admin-trigger').style.display = 'none';
    }
    
    document.getElementById('cartCount').innerText = cart.length;
    document.getElementById('cartCount').style.display = cart.length > 0 ? 'block' : 'none';
    
    // Game stats
    document.getElementById('gameClicks').innerText = gameStats.clicks;
    document.getElementById('gameReward').innerText = gameStats.reward;
}

// === MODALS ===
function showModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}
function hideModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function openQR() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    document.getElementById('qrUserName').innerText = currentUser.name;
    const subStatus = document.getElementById('qrSubStatus');
    if(currentUser.subscription) {
        subStatus.innerText = `ПРОПУСК АКТИВЕН (${currentUser.subscription})`;
        subStatus.style.color = 'var(--success)';
        document.getElementById('qrImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentUser.email}&color=00ff88`;
    } else {
        subStatus.innerText = 'НЕТ АКТИВНОГО АБОНЕМЕНТА';
        subStatus.style.color = 'var(--danger)';
        document.getElementById('qrImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=no_sub&color=ff4444`;
    }
    showModal('qrModal');
}
function closeQR() { hideModal('qrModal'); }

function openMyProgram() {
    if(!currentProgram) return showToast('У вас нет активной программы!', 'error');
    const container = document.getElementById('savedProgramContent');
    
    let htmlContent = `<h3 style="color:#fff; text-align:center; margin-bottom:15px;">ЦЕЛЬ: <span style="color:var(--neon);">${currentProgram.goal}</span></h3>`;
    
    // Поддержка текстового формата (нового)
    if (currentProgram.type === 'text') {
        const formattedHtml = currentProgram.content
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>")
            .replace(/=== ВАРИАНТ 1: Оптимальная Программа ===/g, match => `<h3 style="color:var(--gold); margin-top:10px; margin-bottom:10px; border-bottom:2px solid var(--gold); padding-bottom:5px; font-size: 1.3rem;"><i class="fas fa-crown"></i> ИНДИВИДУАЛЬНАЯ ПРОГРАММА</h3>`)
            .replace(/День \d+ — [^\n<]+/g, match => {
                const isRest = match.toLowerCase().includes('отдых');
                const color = isRest ? 'var(--success)' : 'var(--primary)';
                const icon = isRest ? 'fa-bed' : 'fa-dumbbell';
                return `<h4 style="color:${color}; margin-top:25px; border-bottom:1px solid #333; padding-bottom:5px; font-size: 1.1rem;"><i class="fas ${icon}"></i> ${match}</h4>`;
            })
            .replace(/ПЛАН ТРЕНИРОВОК НА НЕДЕЛЮ/g, match => `<strong style="color:#fff; display:block; margin-top:10px; font-size:1.1rem;">${match}</strong>`)
            .replace(/Разминка:|Основная часть:|Заминка:|Дополнительно:|Рекомендации по питанию и восстановлению:|Требования:/g, match => `<strong style="color:var(--neon); display:block; margin-top:15px; font-size: 1.05rem;">${match}</strong>`);
            
        htmlContent += `<div class="program-card" style="line-height:1.6; font-size:0.95rem; color:#ddd; background:rgba(0,0,0,0.3);">
            ${formattedHtml}
        </div>`;
    }
    // Поддержка старой многодневной JSON структуры
    else if (currentProgram.days) {
        currentProgram.days.forEach(day => {
            htmlContent += `<div class="program-card" style="margin-bottom:15px; background:rgba(0,0,0,0.3);">
                <h4 style="color:var(--primary); font-size:1rem;">${day.dayName}</h4>
                <ul class="program-list">
                    ${day.exercises.map(e => `<li><span class="ex-name">${e.name}</span><span style="color:var(--gold); font-weight:bold;">${e.sets}</span></li>`).join('')}
                </ul>
            </div>`;
        });
    } 
    // Поддержка старой однодневной JSON структуры
    else if (currentProgram.exercises) {
        htmlContent += `<div class="program-card">
            <ul class="program-list">
                ${currentProgram.exercises.map(e => `<li><span class="ex-name">${e.name}</span><span>${e.sets}</span></li>`).join('')}
            </ul>
        </div>`;
    }
    
    container.innerHTML = htmlContent;
    showModal('programModal');
}
function closeProgram() { hideModal('programModal'); }

function openAttendance() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    document.getElementById('attType').innerText = currentUser.subscription || 'НЕТ';
    document.getElementById('attExp').innerText = currentUser.subExp || '—';
    
    const grid = document.getElementById('attendanceGrid');
    grid.innerHTML = '';
    const today = new Date().getDate();
    for(let i=1; i<=30; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day';
        div.innerText = i;
        if(i < today && Math.random() > 0.5) div.classList.add('visited'); // Mock history
        else if(i === today && currentUser.lastCheckIn === new Date().toDateString()) div.classList.add('visited');
        grid.appendChild(div);
    }
    showModal('attendanceModal');
}
function closeAttendance() { hideModal('attendanceModal'); }

function openProfile() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    document.getElementById('profileName').innerText = currentUser.name;
    document.getElementById('profileEmail').innerText = currentUser.email;
    document.getElementById('profileAvatar').src = currentUser.avatar;
    document.getElementById('profileLevel').innerText = currentUser.level;
    document.getElementById('profileXP').innerText = `${currentUser.xp} / ${currentUser.level * 100} XP`;
    document.getElementById('profileXpBar').style.width = `${(currentUser.xp / (currentUser.level * 100)) * 100}%`;
    document.getElementById('statCoins').innerText = currentUser.coins;
    document.getElementById('statWorkouts').innerText = currentUser.workouts;
    document.getElementById('statAchs').innerText = currentUser.achievements.length;
    renderAchievements();
    showModal('profileModal');
}
function closeProfile() { hideModal('profileModal'); }

function uploadAvatar(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.avatar = e.target.result;
            saveState();
            document.getElementById('profileAvatar').src = currentUser.avatar;
            document.getElementById('headerAvatar').src = currentUser.avatar;
            showToast('Аватар обновлен!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function openAdmin() {
    if(!currentUser || currentUser.role !== 'admin') return showToast('Доступ запрещен!', 'error');
    
    const usersBody = document.getElementById('dbUsersBody');
    usersBody.innerHTML = usersDB.map(u => `<tr><td style="padding:10px;">${u.name}</td><td>${u.email}</td><td>${u.coins}</td><td>${u.subscription || '-'}</td></tr>`).join('');
    
    const ordersBody = document.getElementById('dbOrdersBody');
    ordersBody.innerHTML = ordersDB.map(o => `<tr><td style="padding:10px;">${o.date}</td><td>${o.user}</td><td>${o.sum} ₸</td><td>${o.items}</td></tr>`).join('');
    
    const msgBody = document.getElementById('dbMessagesBody');
    msgBody.innerHTML = messagesDB.map(m => `<tr><td style="padding:10px;">${m.date}</td><td>${m.name}</td><td>${m.phone}</td><td>${m.text}</td></tr>`).join('');

    showModal('adminModal');
}
function closeAdmin() { hideModal('adminModal'); }

function clearOrders() {
    ordersDB = [];
    saveState();
    openAdmin();
    showToast('История заказов очищена', 'success');
}

// === SMART FIT ===
function switchTool(tool) {
    document.getElementById('tabBtn-ai').classList.toggle('active', tool === 'ai');
    document.getElementById('tabBtn-calc').classList.toggle('active', tool === 'calc');
    document.getElementById('tool-ai').classList.toggle('active', tool === 'ai');
    document.getElementById('tool-calc').classList.toggle('active', tool === 'calc');
}

async function generateProgram() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    if(currentUser.coins < 50) return showToast('Недостаточно монет! Заработайте их в игре или на тренировках.', 'error');
    
    currentUser.coins -= 50;
    addXP(20);
    saveState();
    
    document.getElementById('aiLoading').style.display = 'block';
    document.getElementById('aiResult').style.display = 'none';
    
    // Всегда показываем анимацию качка
    document.querySelectorAll('.loader-variant').forEach(el => el.style.display = 'none');
    document.getElementById('loader1').style.display = 'flex';
    
    // Simulate loading bar animation while waiting for API
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += 5;
            document.getElementById('aiProgressBar').style.width = progress + '%';
        }
    }, 200);

    const goalSelect = document.getElementById('aiGoal');
    const levelSelect = document.getElementById('aiLevel');
    const daysSelect = document.getElementById('aiDays');
    const locSelect = document.getElementById('aiLocation');
    const durSelect = document.getElementById('aiDuration');
    const equipInput = document.getElementById('aiEquipment').value || "Не указано";
    
    const goal = goalSelect.options[goalSelect.selectedIndex].text;
    const level = levelSelect.options[levelSelect.selectedIndex].text;
    const days = daysSelect.options[daysSelect.selectedIndex].text;
    const location = locSelect.options[locSelect.selectedIndex].text;
    const duration = durSelect.options[durSelect.selectedIndex].text;

    const promptText = `Роль: Ты профессиональный элитный фитнес-тренер. Твоя задача — составить ИДЕАЛЬНЫЙ и максимально детализированный план тренировок.

Входные данные:
Уровень: ${level}
Цель: ${goal}
Место: ${location}
Оборудование: ${equipInput}
Дней в неделю: ${days}
Длительность: ${duration}

Формат ответа строго следующий (без оберток Markdown и лишнего текста):

=== ВАРИАНТ 1: Оптимальная Программа ===
ПЛАН ТРЕНИРОВОК НА НЕДЕЛЮ

День 1 — [Фокус, например: Грудь и Трицепс]
Разминка:
- [Упражнение 1] — [Время/Кол-во]
- [Упражнение 2] — [Время/Кол-во]
Основная часть:
1. [Упражнение 1] — [Подходы] × [Повторения] (Отдых: [Время])
2. [Упражнение 2] — [Подходы] × [Повторения] (Отдых: [Время])
Заминка:
- [Упражнение] — [Время]

(Повтори структуру для всех ${days} дней тренировок. Укажи дни отдыха между ними, например "День 2 — Отдых и Восстановление")

Дополнительно:
Рекомендации по питанию и восстановлению:
- 🍎 Питание: [2-3 конкретных совета под цель пользователя]
- 💤 Сон: [Совет по отдыху]
- 💧 Вода: [Рекомендация по гидратации]

Требования:
- Упражнения должны быть адекватными для заявленного уровня и места.
- Делай текст максимально структурированным, используй эмодзи для наглядности.`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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',
                'HTTP-Referer': window.location.href,
                'X-Title': 'NLG FITNESS'
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", content: "Ты профессиональный фитнес-тренер. Выводи ответ строго в запрошенном текстовом формате, без markdown оберток." },
                    { role: "user", content: promptText }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errInfo = await response.text();
            throw new Error(`API Error: ${errInfo}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error(`Invalid API response format: ${JSON.stringify(data)}`);
        }
        
        const textData = data.choices[0].message.content;

        clearInterval(progressInterval);
        document.getElementById('aiProgressBar').style.width = '100%';
        
        setTimeout(() => {
            showAIResultText(goal, level, textData);
        }, 500);

    } catch (error) {
        console.error("AI Generation Error:", error);
        clearInterval(progressInterval);
        showToast(`Ошибка: ${error.message}. Использую резервную базу.`, 'error');
        
        // Резервный текстовый ответ
        const fallbackText = `ПЛАН ТРЕНИРОВОК НА НЕДЕЛЮ\n\nДень 1 — Фуллбоди (База)\n\nРазминка:\n- Кардио — 5-10 мин\n\nОсновная часть:\n1. Приседания со штангой — 4 × 10-12 — 90 сек\n2. Жим лежа — 4 × 8-10 — 90 сек\n3. Тяга верхнего блока — 3 × 10-12 — 60 сек\n4. Скручивания — 3 × 20 — 45 сек\n\nЗаминка:\n- Растяжка — 5 мин\n\nДополнительно:\n\nРекомендации:\n- Пейте больше воды.\n- Спите не менее 7-8 часов.`;
        document.getElementById('aiProgressBar').style.width = '100%';
        setTimeout(() => showAIResultText(goal, level, fallbackText), 500);
    }
}

function showAIResultText(goal, level, textData) {
    document.getElementById('aiLoading').style.display = 'none';
    document.getElementById('aiResult').style.display = 'block';
    
    document.getElementById('resGoal').innerText = goal;
    document.getElementById('resTags').innerHTML = `<span style="background:var(--primary); padding:3px 8px; border-radius:4px; color:#fff;">${level}</span>`;
    
    currentProgram = { goal, type: 'text', content: textData };
    
    // Преобразуем текстовый ответ в HTML с поддержкой вариантов
    const formattedHtml = textData
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Экранирование
        .replace(/\n/g, "<br>")
        .replace(/=== ВАРИАНТ 1: Оптимальная Программа ===/g, match => `<h3 style="color:var(--gold); margin-top:10px; margin-bottom:10px; border-bottom:2px solid var(--gold); padding-bottom:5px; font-size: 1.3rem;"><i class="fas fa-crown"></i> ИНДИВИДУАЛЬНАЯ ПРОГРАММА</h3>`)
        .replace(/День \d+ — [^\n<]+/g, match => {
            const isRest = match.toLowerCase().includes('отдых');
            const color = isRest ? 'var(--success)' : 'var(--primary)';
            const icon = isRest ? 'fa-bed' : 'fa-dumbbell';
            return `<h4 style="color:${color}; margin-top:25px; border-bottom:1px solid #333; padding-bottom:5px; font-size: 1.1rem;"><i class="fas ${icon}"></i> ${match}</h4>`;
        })
        .replace(/ПЛАН ТРЕНИРОВОК НА НЕДЕЛЮ/g, match => `<strong style="color:#fff; display:block; margin-top:10px; font-size:1.1rem;">${match}</strong>`)
        .replace(/Разминка:|Основная часть:|Заминка:|Дополнительно:|Рекомендации по питанию и восстановлению:|Требования:/g, match => `<strong style="color:var(--neon); display:block; margin-top:15px; font-size: 1.05rem;">${match}</strong>`);
    
    document.getElementById('programGrid').innerHTML = `<div class="program-card" style="line-height:1.6; font-size:0.95rem; color:#ddd;">
        ${formattedHtml}
    </div>`;
    
    // Прячем старый блок питания, так как советы теперь внутри текста
    document.querySelector('.nutrition-tip').style.display = 'none';
        
    showToast('AI-программа успешно сгенерирована! -50 🪙', 'success');
}

function saveProgram() {
    saveState();
    document.getElementById('btnMyProg').style.display = 'flex';
    showToast('Программа сохранена в профиль!', 'success');
    addAchievement('Первый План', 'fa-file-alt');
}

function calculateBody() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    if(currentUser.coins < 50) return showToast('Недостаточно монет!', 'error');
    
    const weight = parseFloat(document.getElementById('calcWeight').value);
    const height = parseFloat(document.getElementById('calcHeight').value);
    const age = parseInt(document.getElementById('calcAge').value);
    const gender = document.getElementById('calcGender').value;
    
    if(!weight || !height || !age) return showToast('Заполните все поля!', 'error');
    
    // Hide result and show loading
    document.getElementById('calcResult').style.display = 'none';
    const calcLoading = document.getElementById('calcLoading');
    calcLoading.style.display = 'flex';
    
    // Deduct coins and save immediately so user doesn't double click
    currentUser.coins -= 50;
    saveState();
    
    setTimeout(() => {
        calcLoading.style.display = 'none';
        
        addXP(15);
        
        const bmi = (weight / Math.pow(height/100, 2)).toFixed(1);
        document.getElementById('resBMI').innerText = bmi;
        
        let bmr = gender === 'male' ? 
            88.362 * weight + 4.799 * height - 5.677 * age + 88.362 :
            447.593 * weight + 3.098 * height - 4.330 * age + 447.593;
            
        const maint = Math.round(bmr * 1.55);
        document.getElementById('resMaint').innerText = maint + ' ккал';
        document.getElementById('resCut').innerText = (maint - 500) + ' ккал';
        document.getElementById('resBulk').innerText = (maint + 300) + ' ккал';
        
        document.getElementById('calcResult').style.display = 'block';
        showToast('Расчет выполнен! -50 🪙', 'success');
        saveState(); // save XP
    }, 2500);
}

// === MINI GAME ===

function toggleGameFullscreen(btn) {
    const container = btn.closest('.game-container');
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('.game-container').forEach(container => {
        const btn = container.querySelector('.fs-btn');
        if (!btn) return;
        if (document.fullscreenElement === container) {
            btn.classList.replace('fa-expand', 'fa-compress');
        } else {
            btn.classList.replace('fa-compress', 'fa-expand');
        }
    });
});

// 1. Dumbbell Clicker
function gameClick(e) {
    if(!currentUser) return showToast('Авторизуйтесь для сохранения прогресса!', 'error');
    
    const icon = document.getElementById('clickerIcon');
    icon.style.transform = 'scale(0.9)';
    setTimeout(() => icon.style.transform = 'scale(1)', 100);
    
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.animation = 'clickPulse 0.5s ease-out forwards';
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    
    gameStats.clicks++;
    if(gameStats.clicks % 100 === 0) {
        gameStats.reward += 10;
        showToast('Бонус: +10 🪙 доступны для снятия!', 'gold');
    }
    
    document.getElementById('gameClicks').innerText = gameStats.clicks;
    document.getElementById('gameReward').innerText = gameStats.reward;
    saveState();
}

function claimGameReward() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    if(gameStats.reward <= 0) return showToast('У вас нет награды для снятия!', 'error');
    
    currentUser.coins += gameStats.reward;
    addXP(gameStats.reward * 2);
    showToast(`Вы забрали ${gameStats.reward} 🪙 !`, 'gold');
    
    gameStats.reward = 0;
    saveState();
}

// 2. Flappy Gym
let flappyCanvas, fCtx;
let bird = { x: 50, y: 150, velocity: 0, gravity: 0.25, jump: -5.5 };
let pipes = [];
let flappyScore = 0;
let flappyGameLoop;
let isFlappyPlaying = false;

function initFlappy() {
    flappyCanvas = document.getElementById('flappyCanvas');
    if(!flappyCanvas) return;
    fCtx = flappyCanvas.getContext('2d');
    
    const jumpAction = (e) => {
        if(isFlappyPlaying) {
            if(e.type === 'keydown' && e.code !== 'Space') return;
            e.preventDefault();
            bird.velocity = bird.jump;
        }
    };
    
    document.addEventListener('keydown', jumpAction);
    flappyCanvas.addEventListener('mousedown', jumpAction);
    flappyCanvas.addEventListener('touchstart', jumpAction, {passive: false});
}

function startFlappy() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    
    // Auto-fullscreen
    const btn = document.querySelector('#flappyCanvas').closest('.game-container').querySelector('.fs-btn');
    if (!document.fullscreenElement && btn) toggleGameFullscreen(btn);

    bird.y = 150; bird.velocity = 0; pipes = []; flappyScore = 0;
    isFlappyPlaying = true;
    document.getElementById('flappyStartScreen').style.display = 'none';
    if(flappyGameLoop) cancelAnimationFrame(flappyGameLoop);
    flappyLoop();
}

function flappyLoop() {
    if(!isFlappyPlaying) return;
    fCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Draw Bird (Bodybuilder Emoji with rotation)
    fCtx.save();
    fCtx.translate(bird.x, bird.y);
    fCtx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.velocity * 0.1))));
    fCtx.font = '35px Arial';
    fCtx.textAlign = 'center';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('🏋️‍♂️', 0, 0);
    fCtx.restore();

    if(pipes.length === 0 || pipes[pipes.length-1].x < 200) {
        let gap = 130;
        let pipeY = Math.random() * (flappyCanvas.height - gap - 60) + 30;
        pipes.push({ x: flappyCanvas.width, topHeight: pipeY, bottomY: pipeY + gap, passed: false });
    }

    for(let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= 2; 
        
        fCtx.fillStyle = '#444'; 
        fCtx.fillRect(p.x + 10, 0, 15, p.topHeight);
        fCtx.fillRect(p.x + 10, p.bottomY, 15, flappyCanvas.height - p.bottomY);
        
        fCtx.fillStyle = '#ff4444';
        fCtx.fillRect(p.x, p.topHeight - 20, 35, 20);
        fCtx.fillRect(p.x, p.bottomY, 35, 20);

        // Collision (adjusted for emoji)
        if(bird.x + 10 > p.x && bird.x - 10 < p.x + 35 &&
          (bird.y - 15 < p.topHeight || bird.y + 15 > p.bottomY)) {
            gameOverFlappy();
        }
        
        if(bird.y > flappyCanvas.height || bird.y < 0) gameOverFlappy();

        if(p.x < bird.x && !p.passed) {
            p.passed = true;
            flappyScore++;
            if(flappyScore % 5 === 0) {
                currentUser.coins += 5;
                addXP(10);
                showToast('+5 🪙 в Flappy Gym!', 'gold');
            }
        }
        if(p.x < -40) pipes.splice(i, 1);
    }

    fCtx.fillStyle = '#fff';
    fCtx.font = 'bold 24px Montserrat';
    fCtx.textAlign = 'left';
    fCtx.fillText('Счет: ' + flappyScore, 10, 30);

    flappyGameLoop = requestAnimationFrame(flappyLoop);
}

function gameOverFlappy() {
    isFlappyPlaying = false;
    cancelAnimationFrame(flappyGameLoop);
    const screen = document.getElementById('flappyStartScreen');
    screen.style.display = 'flex';
    screen.innerHTML = `<h3 style="color:var(--danger); font-size:2rem; margin-bottom:10px;">УПАЛ!</h3><p style="color:#fff; font-size:1.2rem; margin-bottom:20px;">Счет: ${flappyScore}</p><button class="btn-neon" onclick="startFlappy()">ИГРАТЬ СНОВА</button>`;
    saveState();
}

// 3. Protein Catcher
let cCanvas, cCtx;
let catcher = { x: 175, y: 300, width: 50, height: 40 };
let drops = [];
let catcherScore = 0;
let catcherLoopId;
let isCatcherPlaying = false;

function initCatcher() {
    cCanvas = document.getElementById('catcherCanvas');
    if(!cCanvas) return;
    cCtx = cCanvas.getContext('2d');
    
    const moveCatcher = (e) => {
        if(!isCatcherPlaying) return;
        e.preventDefault();
        const rect = cCanvas.getBoundingClientRect();
        const scaleX = cCanvas.width / rect.width; // Учет масштабирования
        
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        catcher.x = (clientX - rect.left) * scaleX - catcher.width/2;
        
        if(catcher.x < 0) catcher.x = 0;
        if(catcher.x > cCanvas.width - catcher.width) catcher.x = cCanvas.width - catcher.width;
    };
    
    cCanvas.addEventListener('mousemove', moveCatcher);
    cCanvas.addEventListener('touchmove', moveCatcher, {passive: false});
}

function startCatcher() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    
    // Auto-fullscreen
    const btn = document.querySelector('#catcherCanvas').closest('.game-container').querySelector('.fs-btn');
    if (!document.fullscreenElement && btn) toggleGameFullscreen(btn);

    catcherScore = 0; drops = []; isCatcherPlaying = true;
    document.getElementById('catcherStartScreen').style.display = 'none';
    if(catcherLoopId) cancelAnimationFrame(catcherLoopId);
    catcherLoop();
}

function catcherLoop() {
    if(!isCatcherPlaying) return;
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);

    // Draw Catcher
    cCtx.font = '40px Arial';
    cCtx.textAlign = 'center';
    cCtx.fillText('🧺', catcher.x + catcher.width/2, catcher.y + 30);

    if(Math.random() < 0.03) {
        let isBad = Math.random() < 0.3;
        drops.push({
            x: Math.random() * (cCanvas.width - 30) + 15,
            y: -30,
            speed: Math.random() * 2 + 2 + (catcherScore * 0.05),
            isBad: isBad,
            icon: isBad ? '🍔' : '🥤' // junk food vs protein
        });
    }

    for(let i = drops.length - 1; i >= 0; i--) {
        let d = drops[i];
        d.y += d.speed;
        
        cCtx.font = '30px Arial';
        cCtx.fillText(d.icon, d.x, d.y);

        // Catch
        if(d.y + 15 > catcher.y && d.y - 15 < catcher.y + catcher.height &&
           d.x + 15 > catcher.x && d.x - 15 < catcher.x + catcher.width) {
            if(d.isBad) {
                gameOverCatcher();
                return;
            } else {
                catcherScore++;
                if(catcherScore % 20 === 0) {
                    currentUser.coins += 10;
                    addXP(20);
                    showToast('+10 🪙 за протеин!', 'gold');
                }
            }
            drops.splice(i, 1);
            continue;
        }
        
        if(d.y > cCanvas.height + 30) {
            if(!d.isBad) {
                gameOverCatcher();
                return;
            }
            drops.splice(i, 1);
        }
    }

    cCtx.fillStyle = '#fff';
    cCtx.font = 'bold 20px Montserrat';
    cCtx.textAlign = 'left';
    cCtx.fillText('Счет: ' + catcherScore, 10, 30);

    catcherLoopId = requestAnimationFrame(catcherLoop);
}

function gameOverCatcher() {
    isCatcherPlaying = false;
    cancelAnimationFrame(catcherLoopId);
    const screen = document.getElementById('catcherStartScreen');
    screen.style.display = 'flex';
    screen.innerHTML = `<h3 style="color:var(--danger); font-size:2rem; margin-bottom:10px;">УРОНИЛ!</h3><p style="color:#fff; font-size:1.2rem; margin-bottom:20px;">Счет: ${catcherScore}</p><button class="btn-neon" onclick="startCatcher()">ИГРАТЬ СНОВА</button>`;
    saveState();
}

// 4. Gym Memory
const memoryIcons = ['💪', '🥤', '🍎', '🥇', '🥊', '👟'];
let memoryCards = [];
let flippedCards = [];
let memoryMatches = 0;

function initMemory() {
    // Nothing to init on load
}

function startMemory() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    
    // Auto-fullscreen
    const btn = document.getElementById('memoryGrid').closest('.game-container').querySelector('.fs-btn');
    if (!document.fullscreenElement && btn) toggleGameFullscreen(btn);

    document.getElementById('memoryStartScreen').style.display = 'none';
    
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';
    memoryCards = [...memoryIcons, ...memoryIcons].sort(() => Math.random() - 0.5);
    flippedCards = [];
    memoryMatches = 0;

    memoryCards.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.icon = icon;
        card.dataset.index = i;
        card.innerHTML = `<span>${icon}</span>`;
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if(flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    
    card.classList.add('flipped');
    flippedCards.push(card);

    if(flippedCards.length === 2) {
        setTimeout(checkMemoryMatch, 800);
    }
}

function checkMemoryMatch() {
    const [c1, c2] = flippedCards;
    if(c1.dataset.icon === c2.dataset.icon) {
        c1.classList.replace('flipped', 'matched');
        c2.classList.replace('flipped', 'matched');
        memoryMatches++;
        if(memoryMatches === memoryIcons.length) {
            currentUser.coins += 15;
            addXP(30);
            showToast('+15 🪙 за идеальную память!', 'gold');
            setTimeout(() => {
                document.getElementById('memoryStartScreen').style.display = 'flex';
                document.getElementById('memoryStartScreen').innerHTML = `<h3 style="color:var(--success); font-size:2rem; margin-bottom:10px;">ПОБЕДА!</h3><button class="btn-neon" onclick="startMemory()">ИГРАТЬ СНОВА</button>`;
                saveState();
            }, 1000);
        }
    } else {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
    }
    flippedCards = [];
}

// === CHECK-IN ===
function checkIn() {
    if(!currentUser) return;
    if(currentUser.lastCheckIn === new Date().toDateString()) {
        return showToast('Вы уже отмечались сегодня!', 'error');
    }
    
    currentUser.workouts = (currentUser.workouts || 0) + 1;
    currentUser.coins += 15;
    currentUser.lastCheckIn = new Date().toDateString();
    addXP(30);
    showToast('Тренировка засчитана! +15 🪙', 'success');
    
    if(currentUser.workouts === 1) addAchievement('Первый шаг', 'fa-walking');
    if(currentUser.workouts === 10) addAchievement('Железная Воля', 'fa-dumbbell');
    
    saveState();
}

// === SHOP & CART ===
function addToCart(name, price) {
    cart.push({ name, price });
    saveState();
    showToast(`${name} добавлено в корзину!`, 'success');
}
function openCart() {
    const container = document.getElementById('cartItemsContainer');
    if(cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">Корзина пуста</p>';
        document.getElementById('cartTotalSum').innerText = '0';
    } else {
        container.innerHTML = cart.map((item, i) => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #333; color:#fff;">
                <span>${item.name}</span>
                <span>${item.price} ₸ <i class="fas fa-times" style="color:var(--danger); cursor:pointer; margin-left:10px;" onclick="removeFromCart(${i})"></i></span>
            </div>
        `).join('');
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cartTotalSum').innerText = total;
    }
    showModal('cartModal');
}
function closeCart() { hideModal('cartModal'); }

// This function needs to be attached to the global window object to be called from the HTML onclick
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveState();
    openCart();
}

function checkout() {
    if(cart.length === 0) return showToast('Корзина пуста!', 'error');
    if(!currentUser) {
        closeCart();
        return showToast('Сначала авторизуйтесь!', 'error');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('kaspiTotal').innerText = total + ' ₸';
    
    closeCart();
    showModal('kaspiModal');
}

function processKaspiPayment() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Check if buying subscription
    const sub = cart.find(item => item.name.includes('Абонемент'));
    if(sub) {
        currentUser.subscription = sub.name;
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + (sub.name.includes('Годовой') ? 12 : 1));
        currentUser.subExp = expDate.toLocaleDateString();
    }
    
    ordersDB.push({
        date: new Date().toLocaleDateString(),
        user: currentUser.name,
        sum: total,
        items: cart.map(i => i.name).join(', ')
    });
    
    addXP(Math.round(total / 100)); // 1 XP for every 100 tg
    currentUser.coins += Math.round(total / 1000); // cashback
    addAchievement('Покупатель', 'fa-shopping-bag');
    
    cart = [];
    saveState();
    hideModal('kaspiModal');
    showToast('Оплата Kaspi успешно прошла! Начислен кэшбэк 🪙', 'success');
}

// === CONTACTS & REVIEWS ===
function sendMessage() {
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const text = document.getElementById('contactText').value;
    
    if(!name || !phone || !text) return showToast('Заполните все поля!', 'error');
    
    messagesDB.push({ date: new Date().toLocaleDateString(), name, phone, text });
    saveState();
    showToast('Заявка отправлена! Мы свяжемся с вами.', 'success');
    
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactText').value = '';
}

let reviewRating = 5;
function openReviewModal() { showModal('reviewModal'); }
function closeReviewModal() { hideModal('reviewModal'); }
function setRating(stars) {
    reviewRating = stars;
    const icons = document.querySelectorAll('.stars-select i');
    icons.forEach((icon, i) => {
        icon.style.color = i < stars ? 'var(--gold)' : '#555';
    });
}
async function submitReview() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    const text = document.getElementById('reviewText').value;
    if(!text) return showToast('Напишите текст отзыва!', 'error');
    
    const newReviewData = {
        name: currentUser.name,
        avatar: currentUser.avatar,
        rating: reviewRating,
        text: text
    };
    
    try {
        const response = await fetch("http://localhost:3000/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReviewData)
        });
        
        if (!response.ok) throw new Error("Network error");
        
        reviewsDB.push(newReviewData);
        
        const slider = document.getElementById('reviewsSlider');
        const starsHtml = Array(5).fill(0).map((_, i) => `<i class="fas fa-star" style="color: ${i < reviewRating ? 'var(--gold)' : '#555'}"></i>`).join('');
        
        const newReview = document.createElement('div');
        newReview.className = 'review-card glass-panel tilt-card';
        newReview.innerHTML = `
            <div class="review-header">
                <img src="${currentUser.avatar}" alt="User">
                <div>
                    <h4>${currentUser.name}</h4>
                    <div class="stars">${starsHtml}</div>
                </div>
            </div>
            <p>"${text}"</p>
        `;
        
        slider.prepend(newReview);
        if(window.VanillaTilt) {
            VanillaTilt.init(newReview, { max: 15, speed: 400 });
        }
        
        addXP(50);
        addAchievement('Голос Народа', 'fa-bullhorn');
        showToast('Спасибо за отзыв! +50 XP', 'success');
        closeReviewModal();
        document.getElementById('reviewText').value = '';
        
        saveState();
    } catch (err) {
        showToast('Ошибка при сохранении отзыва', 'error');
    }
}

// === PROGRESS SECTION ===
let currentWorkoutId = null;
let progressChartInstance = null;

function renderProgress() {
    if (!currentUser) return;
    if (!currentUser.progress) currentUser.progress = [];

    // Сортировка по дате (новые сверху)
    currentUser.progress.sort((a, b) => new Date(b.date) - new Date(a.date));

    const list = document.getElementById('workoutsList');
    if (!list) return;
    list.innerHTML = '';

    let totalWorkouts = currentUser.progress.length;
    let totalWeight = 0;
    let uniqueExercises = new Set();

    currentUser.progress.forEach(w => {
        let workoutVolume = 0;
        w.exercises.forEach(e => {
            let vol = e.weight * e.reps * e.sets;
            workoutVolume += vol;
            totalWeight += vol;
            uniqueExercises.add(e.name);
        });

        const wCard = document.createElement('div');
        wCard.className = 'workout-card';
        wCard.innerHTML = `
            <div class="workout-header" onclick="toggleWorkoutBody('${w.id}')">
                <div>
                    <h3><i class="fas fa-calendar-check" style="color: var(--neon);"></i> ${w.name}</h3>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                        <i class="far fa-clock"></i> ${new Date(w.date).toLocaleDateString('ru-RU')}
                        ${w.notes ? `&nbsp;|&nbsp;<i class="fas fa-sticky-note"></i> ${w.notes}` : ''}
                    </div>
                </div>
                <div style="display:flex; gap: 15px; align-items:center;">
                    <span style="color: var(--gold); font-size: 0.9rem; font-weight: bold;">${workoutVolume} кг</span>
                    <button class="btn-icon" onclick="event.stopPropagation(); deleteWorkout('${w.id}')" title="Удалить тренировку">
                        <i class="fas fa-trash" style="color: var(--danger); font-size: 1rem;"></i>
                    </button>
                    <i class="fas fa-chevron-down toggle-icon" id="icon-${w.id}"></i>
                </div>
            </div>
            <div class="workout-body" id="body-${w.id}">
                <div class="exercises-container" id="ex-${w.id}">
                    ${w.exercises.length === 0 ? '<p style="color:#666; font-size:0.9rem; margin-bottom:10px;">Нет упражнений</p>' : ''}
                    ${w.exercises.map((e, idx) => `
                        <div class="exercise-item">
                            <div class="exercise-info">
                                <h4>${e.name}</h4>
                                <div class="exercise-details">
                                    <span><i class="fas fa-weight-hanging"></i> ${e.weight} кг</span>
                                    <span><i class="fas fa-redo"></i> ${e.reps} повт</span>
                                    <span><i class="fas fa-layer-group"></i> ${e.sets} подх</span>
                                </div>
                            </div>
                            <div class="exercise-actions">
                                <button onclick="deleteExercise('${w.id}', ${idx})" title="Удалить упражнение"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-outline" style="margin-top: 10px; font-size: 0.8rem; padding: 10px; border-radius: 8px;" onclick="openExerciseModal('${w.id}')">
                    + ДОБАВИТЬ УПРАЖНЕНИЕ
                </button>
            </div>
        `;
        list.appendChild(wCard);
    });

    document.getElementById('totalWorkoutsStat').innerText = totalWorkouts;
    document.getElementById('totalWeightStat').innerText = totalWeight > 1000 ? (totalWeight / 1000).toFixed(1) + ' т' : totalWeight + ' кг';

    // Обновляем селект для графиков
    const select = document.getElementById('chartExerciseSelect');
    if (select) {
        const currentSelection = select.value;
        select.innerHTML = '<option value="">Выберите упражнение</option>';
        Array.from(uniqueExercises).sort().forEach(ex => {
            select.innerHTML += `<option value="${ex}" ${currentSelection === ex ? 'selected' : ''}>${ex}</option>`;
        });
        updateChart();
    }
}

function toggleWorkoutBody(id) {
    const body = document.getElementById(`body-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    if (body.classList.contains('active')) {
        body.classList.remove('active');
        icon.classList.remove('rotated');
    } else {
        body.classList.add('active');
        icon.classList.add('rotated');
    }
}

function openWorkoutModal() {
    if(!currentUser) return showToast('Сначала авторизуйтесь!', 'error');
    document.getElementById('workoutName').value = '';
    document.getElementById('workoutNotes').value = '';
    document.getElementById('workoutDate').valueAsDate = new Date();
    showModal('workoutModal');
}
function closeWorkoutModal() { hideModal('workoutModal'); }

function saveWorkout() {
    const name = document.getElementById('workoutName').value.trim();
    const notes = document.getElementById('workoutNotes').value.trim();
    const date = document.getElementById('workoutDate').value;

    if(!name || !date) return showToast('Введите название и дату!', 'error');

    currentUser.progress.push({
        id: 'w_' + Date.now(),
        name,
        notes,
        date,
        exercises: []
    });

    saveState();
    closeWorkoutModal();
    renderProgress();
    showToast('Тренировка добавлена!', 'success');
}

function deleteWorkout(id) {
    if(!confirm('Точно удалить тренировку?')) return;
    currentUser.progress = currentUser.progress.filter(w => w.id !== id);
    saveState();
    renderProgress();
    showToast('Тренировка удалена!', 'success');
}

function openExerciseModal(workoutId) {
    currentWorkoutId = workoutId;
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseWeight').value = '';
    document.getElementById('exerciseSets').value = '';
    document.getElementById('exerciseReps').value = '';
    showModal('exerciseModal');
}
function closeExerciseModal() { hideModal('exerciseModal'); currentWorkoutId = null; }

function saveExercise() {
    const name = document.getElementById('exerciseName').value.trim();
    const weight = parseFloat(document.getElementById('exerciseWeight').value);
    const sets = parseInt(document.getElementById('exerciseSets').value);
    const reps = parseInt(document.getElementById('exerciseReps').value);

    if(!name || isNaN(weight) || isNaN(sets) || isNaN(reps)) return showToast('Заполните все поля корректно!', 'error');

    const workout = currentUser.progress.find(w => w.id === currentWorkoutId);
    if(workout) {
        workout.exercises.push({ name, weight, sets, reps });
        saveState();
        closeExerciseModal();
        renderProgress();
        
        // Open the body again
        const body = document.getElementById(`body-${currentWorkoutId}`);
        const icon = document.getElementById(`icon-${currentWorkoutId}`);
        if(body && !body.classList.contains('active')) {
            body.classList.add('active');
            icon.classList.add('rotated');
        }
        
        showToast('Упражнение добавлено!', 'success');
        addXP(10);
    }
}

function deleteExercise(workoutId, exIdx) {
    if(!confirm('Удалить упражнение?')) return;
    const workout = currentUser.progress.find(w => w.id === workoutId);
    if(workout) {
        workout.exercises.splice(exIdx, 1);
        saveState();
        renderProgress();
        
        const body = document.getElementById(`body-${workoutId}`);
        const icon = document.getElementById(`icon-${workoutId}`);
        if(body && !body.classList.contains('active')) {
            body.classList.add('active');
            icon.classList.add('rotated');
        }
    }
}

function updateChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const select = document.getElementById('chartExerciseSelect');
    const exerciseName = select.value;

    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    if (!exerciseName || !currentUser || !currentUser.progress) return;

    // Ищем максимальный вес для выбранного упражнения по дням
    const dataPoints = [];
    const sortedProgress = [...currentUser.progress].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedProgress.forEach(w => {
        const exercises = w.exercises.filter(e => e.name === exerciseName);
        if (exercises.length > 0) {
            const maxWeight = Math.max(...exercises.map(e => e.weight));
            dataPoints.push({
                date: new Date(w.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
                weight: maxWeight
            });
        }
    });

    if (dataPoints.length === 0) return;

    progressChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.map(d => d.date),
            datasets: [{
                label: `Макс. вес (${exerciseName})`,
                data: dataPoints.map(d => d.weight),
                borderColor: '#00c3ff',
                backgroundColor: 'rgba(0, 195, 255, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#ffaa00',
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Montserrat', size: 14 } } },
                tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { size: 14 }, bodyFont: { size: 14 }, padding: 10 }
            },
            scales: {
                x: { ticks: { color: '#aaa', font: { family: 'Montserrat' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { ticks: { color: '#aaa', font: { family: 'Montserrat' } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
            }
        }
    });
}

// === REVIEWS SECTION ===
async function loadReviews() {
    const slider = document.getElementById('reviewsSlider');
    if(!slider) return;
    
    try {
        const response = await fetch("http://localhost:3000/api/reviews");
        if (response.ok) {
            const dbReviews = await response.json();
            reviewsDB = dbReviews;
        }
    } catch (err) {
        console.error("Ошибка загрузки отзывов:", err);
    }
    
    reviewsDB.forEach(rev => {
        const starsHtml = Array(5).fill(0).map((_, i) => `<i class="fas fa-star" style="color: ${i < rev.rating ? 'var(--gold)' : '#555'}"></i>`).join('');
        const newReview = document.createElement('div');
        newReview.className = 'review-card glass-panel tilt-card';
        newReview.innerHTML = `
            <div class="review-header">
                <img src="${rev.avatar}" alt="User">
                <div>
                    <h4>${rev.name}</h4>
                    <div class="stars">${starsHtml}</div>
                </div>
            </div>
            <p>"${rev.text}"</p>
        `;
        slider.prepend(newReview);
        if(window.VanillaTilt) {
            VanillaTilt.init(newReview, { max: 15, speed: 400 });
        }
    });
}

// === MUSIC PLAYER ===
const tracks = [
    { name: "Demi Lovato - Cool for the Summer (Workout Remix)", src: "cool for the summer.mp3" },
    { name: "Justin Bieber ft. Chance The Rapper - Confident", src: "justin-bieber-feat.-chance-the-rapper-confident.mp3" }
];
let currentTrackIdx = 0;
let isPlaying = false;

function togglePlay() {
    const audio = document.getElementById('audio-player');
    const vinyl = document.getElementById('playerVinyl');
    const btn = document.getElementById('playBtn');
    
    if(!audio.src || audio.src === window.location.href) {
        audio.src = tracks[currentTrackIdx].src;
    }
    
    if(isPlaying) {
        audio.pause();
        vinyl.classList.remove('playing');
        btn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play().catch(e => console.log('Audio play error:', e));
        vinyl.classList.add('playing');
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('playerInfo').style.display = 'block';
        document.getElementById('currentTrackName').innerText = tracks[currentTrackIdx].name;
    }
    isPlaying = !isPlaying;
}

function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
    playCurrentTrack();
}

function prevTrack() {
    currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
    playCurrentTrack();
}

function playCurrentTrack() {
    const audio = document.getElementById('audio-player');
    audio.src = tracks[currentTrackIdx].src;
    if(isPlaying) {
        audio.play().catch(e => console.log('Audio play error:', e));
        document.getElementById('currentTrackName').innerText = tracks[currentTrackIdx].name;
    }
}

// Player Expansion
document.getElementById('miniPlayer').addEventListener('click', function() {
    const info = document.getElementById('playerInfo');
    if(info.style.display === 'none' || !info.style.display) {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
});

const audioProgress = document.getElementById('audioProgress');
const audioTime = document.getElementById('audioTime');
const audioEl = document.getElementById('audio-player');

audioEl.addEventListener('timeupdate', () => {
    if(!isNaN(audioEl.duration)) {
        const percent = (audioEl.currentTime / audioEl.duration) * 100;
        audioProgress.value = percent;
        
        let curMins = Math.floor(audioEl.currentTime / 60);
        let curSecs = Math.floor(audioEl.currentTime % 60);
        let durMins = Math.floor(audioEl.duration / 60);
        let durSecs = Math.floor(audioEl.duration % 60);
        
        audioTime.innerText = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs} / ${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;
    }
});

audioProgress.addEventListener('input', (e) => {
    if(!isNaN(audioEl.duration)) {
        audioEl.currentTime = (e.target.value / 100) * audioEl.duration;
    }
});

// === SYSTEM FUNCTIONS (XP, Achievements, Toasts) ===
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-coins';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInLeft 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function addXP(amount) {
    if(!currentUser) return;
    currentUser.xp += amount;
    const requiredXP = currentUser.level * 100;
    
    if(currentUser.xp >= requiredXP) {
        currentUser.level++;
        currentUser.xp -= requiredXP;
        showToast(`УРОВЕНЬ ПОВЫШЕН ДО ${currentUser.level}! 🎉`, 'gold');
        addAchievement('Левел Ап', 'fa-level-up-alt');
    }
    saveState();
}

function addAchievement(name, icon) {
    if(!currentUser) return;
    if(!currentUser.achievements) currentUser.achievements = [];
    if(!currentUser.achievements.find(a => a.name === name)) {
        currentUser.achievements.push({ name, icon });
        showToast(`Новое достижение: ${name}! 🏆`, 'gold');
        saveState();
    }
}

function renderAchievements() {
    if(!currentUser) return;
    const list = document.getElementById('achievementsList');
    if(!list) return;
    document.getElementById('achievementsCount').innerText = `${currentUser.achievements.length}/10`;
    
    if(currentUser.achievements.length === 0) {
        list.innerHTML = '<p style="color:#666; font-size:0.9rem; grid-column: 1/-1; text-align:center;">У вас пока нет достижений. Тренируйтесь, покупайте абонементы и проявляйте активность!</p>';
        return;
    }
    
    list.innerHTML = currentUser.achievements.map(a => `
        <div class="glass-panel" style="display:flex; align-items:center; gap:15px; padding:15px; border-radius:10px; background:rgba(255,215,0,0.05); border-color:rgba(255,215,0,0.2);">
            <div style="width:40px; height:40px; border-radius:50%; background:var(--gold); color:#000; display:flex; justify-content:center; align-items:center; font-size:1.2rem; box-shadow:0 0 10px var(--gold);">
                <i class="fas ${a.icon}"></i>
            </div>
            <div>
                <h4 style="color:#fff; font-size:0.95rem; margin-bottom:3px;">${a.name}</h4>
                <p style="color:var(--gold); font-size:0.75rem;">Открыто</p>
            </div>
        </div>
    `).join('');
}
