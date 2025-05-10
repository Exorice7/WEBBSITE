document.addEventListener('DOMContentLoaded', () => {
    // Регистрация GSAP плагина, если он используется
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initMarqueeAnimation();
    }

    // Нужно дублировать элементы span для бесконечного скролла
    ensureMarqueeContent();
});

// Функция для инициализации анимации с GSAP
function initMarqueeAnimation() {
    // Добавляем анимацию появления через GSAP
    gsap.fromTo('.marquee-container', 
        {
            opacity: 0,
            y: 50
        }, 
        {
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '.marquee-container',
                start: 'top bottom',
                end: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        }
    );

    // Выделяем каждое слово внутри span
    const marqueeSpans = document.querySelectorAll('.marquee span');
    marqueeSpans.forEach(span => {
        const words = span.textContent.split('•').filter(word => word.trim() !== '');
        let formattedContent = '';
        words.forEach((word, index) => {
            formattedContent += `<span class="word">${word.trim()}</span>`;
            if (index < words.length - 1) formattedContent += '<span class="separator">•</span>';
        });
        span.innerHTML = formattedContent + '<span class="separator">•</span>';
    });

    // Удалены обработчики событий mouseover и mouseout
}

// Функция для обеспечения достаточного количества элементов для бесконечного скролла
function ensureMarqueeContent() {
    const marquee = document.querySelector('.marquee');
    const container = document.querySelector('.marquee-container');
    
    if (marquee && container) {
        // Проверяем, достаточно ли контента для скролла
        const marqueeWidth = marquee.scrollWidth / 2; // Делим на 2, т.к. у нас уже дублированный контент
        const containerWidth = container.clientWidth;
        
        // Если не достаточно контента, добавляем еще элементов
        if (marqueeWidth < containerWidth * 2) {
            const originalSpans = document.querySelectorAll('.marquee span');
            const spanCount = originalSpans.length;
            
            // Добавляем копии элементов, чтобы заполнить необходимое пространство
            for (let i = 0; i < spanCount; i++) {
                const clone = originalSpans[i].cloneNode(true);
                marquee.appendChild(clone);
            }
        }
    }
}

// Автоматически подстраиваем анимацию при изменении размера окна
window.addEventListener('resize', () => {
    ensureMarqueeContent();
});
