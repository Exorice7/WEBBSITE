// Barba.js - Page Transitions Manager
// Этот файл управляет плавными переходами между страницами

let isFirstLoad = true;

// Функция для скрытия прелоадера на последующих переходах
const hidePreloaderOnSubsequentLoads = () => {
  const preloader = document.querySelector('.preloader');
  if (preloader && !isFirstLoad) {
    preloader.style.display = 'none';
  }
};

// Функция для инициализации Barba.js
const initBarba = () => {
  barba.init({
    debug: false,
    preventRunning: true,
    timeout: 5000,
    transitions: [
      {
        name: 'default-transition',
        
        // Функция, которая выполняется перед началом перехода
        async leave(data) {
          const done = this.async();
          
          // Скрываем прелоадер для последующих загрузок
          hidePreloaderOnSubsequentLoads();
          
          // Скролл вверх перед переходом
          window.scrollTo(0, 0);
          
          // Анимация выхода со страницы
          const transitionOverlay = document.querySelector('.transition-overlay');
          document.body.classList.add('transition-active');
          
          const exitTimeline = gsap.timeline({
            onComplete: () => {
              done();
            }
          });
          
          exitTimeline
            // Плавное появление overlay с круговым эффектом
            .to(transitionOverlay, {
              clipPath: 'circle(150% at 50% 50%)',
              duration: 0.8,
              ease: 'expo.inOut'
            })
            // Анимация текста внутри overlay
            .to(transitionOverlay, {
              '--before-opacity': 1,
              duration: 0.4,
              ease: 'power2.out',
              onStart: () => {
                gsap.to(transitionOverlay, {
                  onUpdate: function() {
                    const progress = this.progress();
                    transitionOverlay.style.setProperty('--before-opacity', progress);
                    transitionOverlay.style.setProperty('--before-scale', 0.5 + progress * 0.5);
                    transitionOverlay.style.setProperty('--before-rotate', -90 + progress * 90);
                  }
                });
              }
            }, '-=0.4')
            // Затемнение текущего контента
            .to(data.current.container, {
              opacity: 0,
              y: -50,
              duration: 0.4,
              ease: 'power2.in'
            }, '-=0.6');
        },
        
        // Функция, которая выполняется после загрузки новой страницы
        async enter(data) {
          const done = this.async();
          
          // Устанавливаем флаг что это уже не первая загрузка
          isFirstLoad = false;
          
          // Скрываем прелоадер на всех последующих страницах
          const preloader = document.querySelector('.preloader');
          if (preloader) {
            preloader.style.display = 'none';
          }
          
          // Подготовка нового контента
          gsap.set(data.next.container, {
            opacity: 0,
            y: 50
          });
          
          // Реинициализация всех компонентов для новой страницы
          setTimeout(() => {
            reinitializePageComponents();
          }, 100);
          
          // Анимация входа на новую страницу
          const transitionOverlay = document.querySelector('.transition-overlay');
          const enterTimeline = gsap.timeline({
            onComplete: () => {
              document.body.classList.remove('transition-active');
              done();
            }
          });
          
          enterTimeline
            // Небольшая задержка для лучшего восприятия
            .to({}, { duration: 0.2 })
            // Появление нового контента
            .to(data.next.container, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'expo.out'
            })
            // Скрытие overlay с круговым эффектом
            .to(transitionOverlay, {
              clipPath: 'circle(0% at 50% 50%)',
              duration: 0.8,
              ease: 'expo.inOut',
              onStart: () => {
                gsap.to(transitionOverlay, {
                  onUpdate: function() {
                    const progress = 1 - this.progress();
                    transitionOverlay.style.setProperty('--before-opacity', progress);
                  }
                });
              }
            }, '-=0.6');
        },
        
        // Функция для синхронизации перехода
        async once(data) {
          // Это выполнится только при первой загрузке страницы
          // Ничего не делаем, позволяя обычной логике прелоадера работать
        }
      }
    ],
    
    // Хуки жизненного цикла Barba.js
    views: []
  });
  
  // Обработчик клика по ссылкам для предотвращения стандартного поведения
  barba.hooks.beforeLeave(() => {
    // Очищаем ScrollTrigger перед переходом
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  });
  
  barba.hooks.after(() => {
    // Скролл наверх после перехода
    window.scrollTo(0, 0);
  });
};

// Функция для реинициализации компонентов страницы после перехода
const reinitializePageComponents = () => {
  // Убеждаемся что body видимый
  document.body.style.opacity = '1';
  
  // Реинициализация SplitType для текстовых анимаций
  const splitTexts = document.querySelectorAll('.split-text');
  splitTexts.forEach(text => {
    // Удаляем предыдущие split элементы
    const existingChars = text.querySelectorAll('.char, .word');
    existingChars.forEach(el => {
      if (el.parentNode) {
        const textContent = el.textContent;
        const textNode = document.createTextNode(textContent);
        el.parentNode.replaceChild(textNode, el);
      }
    });
    
    // Создаем новый split
    new SplitType(text, { types: 'chars, words', tagName: 'span' });
  });
  
  // Реинициализация ScrollTrigger
  ScrollTrigger.refresh();
  
  // Запускаем анимации для нового контента
  animatePageContent();
  
  // Реинициализация UI компонентов
  if (typeof UI !== 'undefined') {
    if (UI.initMagneticElements) UI.initMagneticElements();
    if (UI.initHoverEffects) UI.initHoverEffects();
    if (UI.initImageTilt) UI.initImageTilt();
  }
  
  // Реинициализация мобильного меню
  generateMobileMenu();
  
  // Для страницы контактов - инициализируем карту
  if (window.location.pathname.includes('contact.html') && typeof ymaps !== 'undefined') {
    initYandexMap();
  }
};

// Функция для анимации контента после перехода
const animatePageContent = () => {
  const mainTimeline = gsap.timeline();
  
  // Анимируем элементы hero секции
  mainTimeline
    .to('.hero-title .char', {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: {
        each: 0.02,
        from: "start"
      },
      duration: 1,
      ease: 'expo.out'
    }, 0.2)
    .to('.hero-subtitle .char', {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      stagger: 0.01,
      duration: 0.8,
      ease: 'power4.out'
    }, '-=0.8');
  
  // Анимация для статистики (если есть)
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    gsap.set('.hero-stats', { opacity: 0, y: 60 });
    gsap.set('.stat-item', { opacity: 0, y: 30 });
    
    mainTimeline
      .to('.hero-stats', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.6)'
      }, '-=0.4')
      .to('.stat-item', {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6');
  }
  
  // Анимация для контактов (если есть)
  const heroContacts = document.querySelector('.hero-contacts');
  if (heroContacts) {
    gsap.set('.hero-contacts', { opacity: 0, y: 60 });
    mainTimeline.to('.hero-contacts', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6');
  }
  
  // Анимация CTA кнопки
  mainTimeline
    .to('.hero-cta', {
      opacity: 1,
      scale: 1,
      rotate: 0,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.7')
    .to('.image-mask', {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      duration: 1.4,
      ease: 'expo.out'
    }, '-=1.2');
  
  // Инициализируем scroll анимации
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
};

// Вспомогательная функция для генерации мобильного меню
const generateMobileMenu = () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const mobileNavContainer = document.querySelector('.mobile-nav-links');
  
  if (!navLinks.length || !mobileNavContainer) return;
  
  mobileNavContainer.innerHTML = '';
  
  navLinks.forEach(link => {
    const isActive = link.classList.contains('active');
    const navId = link.getAttribute('data-nav-id') || '';
    const href = link.getAttribute('href');
    const text = link.textContent.trim();
    
    const mobileItem = document.createElement('li');
    mobileItem.innerHTML = `
      <a href="${href}" class="mobile-link${isActive ? ' active' : ''}">
        <span>${navId}</span>${text}
      </a>
    `;
    
    mobileNavContainer.appendChild(mobileItem);
  });
};

// Функция для инициализации Яндекс карты (для страницы контактов)
const initYandexMap = () => {
  const mapContainer = document.getElementById('yandex-map');
  if (!mapContainer || typeof ymaps === 'undefined') return;
  
  // Проверяем, инициализирована ли карта
  if (mapContainer.classList.contains('map-initialized')) return;
  
  ymaps.ready(() => {
    const myMap = new ymaps.Map('yandex-map', {
      center: [43.758, 44.045],
      zoom: 13,
      controls: ['zoomControl', 'fullscreenControl']
    });
    
    const myPlacemark = new ymaps.Placemark([43.758, 44.045], {
      balloonContent: 'ИП Прытков М.А.<br>Пролетарское, Прохладненский р-н, КБР'
    }, {
      preset: 'islands#brownCircleDotIcon'
    });
    
    myMap.geoObjects.add(myPlacemark);
    mapContainer.classList.add('map-initialized');
    
    // Анимация появления карты
    gsap.to('.map-frame', {
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1,
      duration: 1.2,
      ease: 'expo.out'
    });
  });
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем Barba.js только если страница поддерживает переходы
  if (typeof barba !== 'undefined') {
    initBarba();
  }
});

