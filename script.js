document.addEventListener('DOMContentLoaded', () => {

    // --- СОСТОЯНИЕ И НАСТРОЙКИ ---
    const state = {
        lowPerfMode: false,
        audioPlaying: false,
        particles: []
    };

    // DOM-элементы
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    const cursorGlow = document.getElementById('cursorGlow');
    const progressBar = document.getElementById('progressBar');
    const btnToggleFX = document.getElementById('toggleFX');
    const btnToggleAudio = document.getElementById('toggleAudio');
    const bgMusic = document.getElementById('bgMusic');
    const iconMute = btnToggleAudio.querySelector('.icon-mute');
    const iconAudio = btnToggleAudio.querySelector('.icon-audio');

    // --- 1. ОПРЕДЕЛЕНИЕ СЛАБОГО УСТРОЙСТВА ---
    function checkPerformance() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const lowHardware = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const savedPref = localStorage.getItem('medina_low_perf');

        if (savedPref !== null) {
            state.lowPerfMode = savedPref === 'true';
        } else if (isMobile || lowHardware) {
            state.lowPerfMode = true;
        }

        applyPerformanceSettings();
    }

    function applyPerformanceSettings() {
        if (state.lowPerfMode) {
            document.body.classList.add('low-perf');
            cursorGlow.style.display = 'none';
        } else {
            document.body.classList.remove('low-perf');
            cursorGlow.style.display = 'block';
        }
        initParticles();
    }

    btnToggleFX.addEventListener('click', () => {
        state.lowPerfMode = !state.lowPerfMode;
        localStorage.setItem('medina_low_perf', state.lowPerfMode);
        applyPerformanceSettings();
    });

    // --- 2. МЯГКИЕ ЧАСТИЦЫ НА ФОНЕ ---
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = -(Math.random() * 0.3 + 0.1);
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            if (this.y < 0 || this.opacity <= 0) {
                this.reset();
                this.y = canvas.height + 10;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(226, 201, 146, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        state.particles = [];
        const count = state.lowPerfMode ? 20 : 60;
        for (let i = 0; i < count; i++) {
            state.particles.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        state.particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // --- 3. ИНТЕРАКТИВНЫЙ КУРСОР И PARALLAX ---
    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            if (!state.lowPerfMode) {
                cursorGlow.style.left = `${e.clientX}px`;
                cursorGlow.style.top = `${e.clientY}px`;
            }
        });
    }

    // --- 4. АУДИОКОНТРОЛЛЕР ---
    btnToggleAudio.addEventListener('click', () => {
        if (state.audioPlaying) {
            bgMusic.pause();
            iconMute.classList.remove('hidden');
            iconAudio.classList.add('hidden');
        } else {
            bgMusic.play().then(() => {
                iconMute.classList.add('hidden');
                iconAudio.classList.remove('hidden');
            }).catch(() => {});
        }
        state.audioPlaying = !state.audioPlaying;
    });

    // --- 5. RIPPLE ЭФФЕКТ ДЛЯ КНОПОК ---
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const circle = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;

            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple-element');

            const ripple = this.querySelector('.ripple-element');
            if (ripple) ripple.remove();

            this.appendChild(circle);
        });
    });

    // --- 6. ПЕРЕХОД С ПЕРВОГО ЭКРАНА ---
    const btnStart = document.getElementById('btnStart');
    const storyContent = document.getElementById('storyContent');

    btnStart.addEventListener('click', () => {
        document.getElementById('screen1').style.opacity = '0';
        
        setTimeout(() => {
            document.getElementById('screen1').style.display = 'none';
            storyContent.classList.remove('hidden-story');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setupScrollObserver();
        }, 800);
    });

    // --- 7. SCROLL REVEAL & PROGRESS BAR ---
    function setupScrollObserver() {
        const screens = document.querySelectorAll('.reveal-screen');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.25 });

        screens.forEach(screen => observer.observe(screen));
    }

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    // --- 8. РАСКРЫТИЕ ИНТЕРАКТИВНЫХ КАРТОЧЕК ---
    const cardUnfold = document.getElementById('cardUnfold');
    if (cardUnfold) {
        cardUnfold.addEventListener('click', () => {
            cardUnfold.classList.toggle('expanded');
        });
    }

    // Мини-карточки (Раздел 5)
    document.querySelectorAll('.mini-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });

    // Показать дополнительное сообщение (Раздел 7)
    const btnMore = document.getElementById('btnMore');
    const moreMessage = document.getElementById('moreMessage');

    if (btnMore) {
        btnMore.addEventListener('click', () => {
            moreMessage.classList.remove('hidden');
            btnMore.style.display = 'none';
        });
    }

    // --- 9. ЗАКРЫТИЕ ПИСЬМА И ФИНАЛ ---
    const btnCloseLetter = document.getElementById('btnCloseLetter');
    const farewellScreen = document.getElementById('farewellScreen');
    const btnReturn = document.getElementById('btnReturn');

    if (btnCloseLetter) {
        btnCloseLetter.addEventListener('click', () => {
            farewellScreen.classList.remove('hidden');
            setTimeout(() => {
                farewellScreen.classList.add('show');
            }, 50);
        });
    }

    if (btnReturn) {
        btnReturn.addEventListener('click', () => {
            farewellScreen.classList.remove('show');
            setTimeout(() => {
                farewellScreen.classList.add('hidden');
            }, 1500);
        });
    }

    // Инициализация проверки быстродействия
    checkPerformance();
});