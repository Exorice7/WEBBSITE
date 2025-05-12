document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    const Animations = {};
    const UI = {};
    
    const initPage = () => {
      const preloader = document.querySelector('.preloader');
      const preloaderContent = document.querySelector('.preloader-content');
      const preloaderLogo = document.querySelector('.logo-preloader');
      const preloaderQuote = document.querySelector('.preloader-quote');
      const preloaderQuoteText = document.querySelector('.preloader-quote p');
      const preloaderProgress = document.querySelector('.preloader-progress');
      const preloaderBar = document.querySelector('.preloader-bar');
      
      const splitTexts = document.querySelectorAll('.split-text');
      splitTexts.forEach(text => {
        new SplitType(text, { types: 'chars, words', tagName: 'span' });
      });
      
      if (preloaderQuoteText) {
        new SplitType(preloaderQuoteText, { types: 'chars', tagName: 'span' });
      }
      
      if (preloaderLogo) {
        new SplitType(preloaderLogo, { types: 'chars', tagName: 'span' });
        gsap.set(preloaderLogo.querySelectorAll('.char'), { 
          opacity: 0, 
          y: 15
        });
      }
      
      gsap.set(preloaderQuote, { opacity: 1 });
      gsap.set(preloaderQuoteText, { opacity: 1 });
      gsap.set(preloaderQuoteText.querySelectorAll('.char'), { 
        opacity: 0, 
        y: 20 
      });
      
      const preloaderTimeline = gsap.timeline({
        onComplete: () => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power3.out",
            onComplete: () => {
              initAnimations();
              preloader.style.display = 'none';
            }
          });
        }
      });
      
      preloaderTimeline
        .to(preloaderLogo.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.03,
          ease: "power3.out"
        })
        .to(preloaderQuoteText.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.025,
          ease: "power3.out"
        }, "-=0.2")
        .to(preloaderProgress, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.3")
        .to(preloaderBar, {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.inOut"
        }, "-=0.3")
        .to({}, { duration: 0.3 });
      
      gsap.to('body', { 
        opacity: 1, 
        duration: 0.1
      });
      
      // Инициализируем карту
      initYandexMap();
      
      // Инициализация кастомного курсора
      UI.initCursor();
    };
    
    const initYandexMap = () => {
      const mapContainer = document.getElementById('yandex-map');
      if (!mapContainer) return;
      
      ymaps.ready(function() {
        // Создаем карту с оптимизированными настройками
        const myMap = new ymaps.Map('yandex-map', {
          center: [43.820213, 44.032360],
          zoom: 15,
          controls: [],
          type: 'yandex#hybrid'
        }, {
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
          searchControlProvider: 'yandex#search'
        });
        
        // Отключаем поведения для лучшего UX
        myMap.behaviors.disable('scrollZoom');
        myMap.behaviors.disable('dblClickZoom');
        myMap.behaviors.disable('rightMouseButtonMagnifier');
        myMap.behaviors.disable('multiTouch');
        
        // Создаем метку с кастомным стилем
        const myPlacemark = new ymaps.Placemark([43.820213, 44.032360], {
          hintContent: 'ИП Прытков М.А.',
          balloonContentHeader: 'ИП Прытков М.А.',
          balloonContentBody: 'Пролетарское, Прохладненский р-н<br>Кабардино-Балкарская Республика',
          balloonContentFooter: '<a href="tel:+79286928744">+7 928 692-87-44</a>'
        }, {
          preset: 'islands#darkBrownAgricultureIcon',
          iconColor: '#906c46',
          hideIconOnBalloonOpen: false
        });
        
        // Добавляем метку на карту
        myMap.geoObjects.add(myPlacemark);
        
        // Функция для скрытия стандартных элементов интерфейса Яндекс.Карт
        const hideYandexElements = function() {
          const selectors = [
            '[class*="ymaps-2"][class*="copyright"]', 
            '[class*="ymaps-2"][class*="copyrights"]',
            '[class*="ymaps-2"][class*="map-copyrights"]',
            '[class*="ymaps-2"][class*="gototech"]',
            '[class*="ymaps-2"][class*="controls__control"]',
            '[class*="ymaps-2"][class*="control"]',
            '[class*="ymaps-2"][class*="button"]',
            '[class*="ymaps-2"][class*="float-button"]',
            '[class*="ymaps-2"][class*="places-pane"]',
            '[class*="ymaps-2"][class*="search"]',
            '[class*="ymaps-2"][class*="controls-pane"]',
            '[class*="ymaps-2"][class*="logo"]'
          ];
          
          selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              el.style.height = '0';
              el.style.width = '0';
              el.style.overflow = 'hidden';
              el.style.position = 'absolute';
              el.style.left = '-9999px';
            });
          });
        };
        
        // Запускаем функцию скрытия в разные моменты для надежности
        setTimeout(hideYandexElements, 100);
        setTimeout(hideYandexElements, 500);
        setTimeout(hideYandexElements, 1000);
        
        // При изменении размера карты тоже скрываем элементы
        myMap.container.events.add('sizechange', function() {
          setTimeout(hideYandexElements, 100);
        });
        
        // Адаптация для мобильных устройств
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          myMap.behaviors.disable('drag');
        }
        
        // Дополнительная попытка скрыть логотип
        try {
          const logoClass = Object.keys(myMap.container.getElement().querySelector('[class*="ymaps-2"][class*="logo"]').classList).find(cls => cls.includes('logo'));
          if (logoClass) {
            const style = document.createElement('style');
            style.innerHTML = `.${logoClass} { display: none !important; }`;
            document.head.appendChild(style);
          }
        } catch (e) {
          console.log('Не удалось скрыть logo');
        }
        
        // Продолжаем мониторинг изменений DOM для скрытия элементов
        const observer = new MutationObserver(hideYandexElements);
        observer.observe(mapContainer, { childList: true, subtree: true });
      });
    };
    
    const initAnimations = () => {
      UI.initScrollProgress();
      UI.initMobileMenu();
      UI.initHoverEffects();
      UI.initMagneticElements();
      
      Animations.headerAnimation();
      Animations.heroAnimation();
      Animations.parallaxEffects();
      Animations.sectionAnimations();
      Animations.cardInteractions();
      Animations.footerAnimation();
      
      document.querySelectorAll('.intro-title .char, .background-image img, .title-reveal, .contact-item, .map-container').forEach(el => {
        if (el.classList.contains('char')) {
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
        } else if (el.matches('.background-image img')) {
          el.style.scale = '1';
          el.style.opacity = '0.2';
        } else if (el.classList.contains('title-reveal')) {
          el.style.opacity = '1';
        } else if (el.classList.contains('contact-item')) {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        } else if (el.classList.contains('map-container')) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      });
    };
    
    Animations.headerAnimation = () => {
      const header = document.querySelector('.site-header');
      
      if (header) {
        ScrollTrigger.create({
          start: 'top -50',
          toggleClass: {
            targets: header,
            className: "scrolled"
          },
          onEnter: () => {
            gsap.to(header, {
              padding: '1rem 2rem',
              duration: 0.3,
              ease: 'power2.out'
            });
          },
          onLeaveBack: () => {
            gsap.to(header, {
              padding: '1.5rem 2rem',
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });
        
        // Анимация появления элементов хедера
        const headerElements = [
          '.logo-text',
          '.nav-link'
        ];
        
        gsap.fromTo(headerElements, 
          { y: -20, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.05,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.3
          }
        );
        
        // Анимация активной ссылки
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
          gsap.to(activeLink.querySelector('.nav-dot'), {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            delay: 0.8
          });
          
          gsap.to(activeLink, {
            color: 'var(--color-accent)',
            duration: 0.4,
            delay: 0.8
          });
          
          gsap.fromTo(activeLink.querySelector('::after'),
            { scaleX: 0 },
            { 
              scaleX: 1, 
              duration: 0.5,
              delay: 0.9,
              ease: 'power2.out'
            }
          );
        }
        
        // Интерактивный эффект при наведении на пункты меню
        const navLinks = document.querySelectorAll('.nav-link:not(.active)');
        
        navLinks.forEach(link => {
          const dot = link.querySelector('.nav-dot');
          
          link.addEventListener('mouseenter', () => {
            gsap.to(dot, { 
              opacity: 1,
              scale: 1,
              duration: 0.3,
              ease: 'power1.out'
            });
          });
          
          link.addEventListener('mouseleave', () => {
            gsap.to(dot, { 
              opacity: 0,
              scale: 0,
              duration: 0.3,
              ease: 'power1.out'
            });
          });
        });
      }
    };
    
    Animations.heroAnimation = () => {
      // Анимируем появление всех элементов героя
      gsap.to('.hero-title .char', {
        opacity: 1,
        y: 0,
        stagger: 0.015,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.2
      });
      
      gsap.to('.hero-subtitle .char', {
        opacity: 1,
        y: 0,
        stagger: 0.01,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.6
      });
      
      gsap.to('.scroll-indicator', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8
      });
      
      gsap.to('.image-mask', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.4
      });
      
      gsap.to('.image-wrapper img', {
        scale: 1,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.5
      });
    };

    Animations.parallaxEffects = () => {
      gsap.to('.background-image img', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.intro-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    };

    Animations.footerAnimation = () => {
      // Анимация появления футера при скролле
      const footerEl = document.querySelector('.site-footer');
      if (!footerEl) return;

      const footerItems = [
        '.footer-logo',
        '.footer-tagline',
        '.copyright'
      ];

      ScrollTrigger.create({
        trigger: footerEl,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          // Анимация элементов в стиле каскада
          gsap.fromTo(footerItems, 
            { y: 20, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              stagger: 0.1,
              duration: 0.7,
              ease: 'power2.out'
            }
          );
        }
      });
    };

    UI.initScrollProgress = () => {
      const scrollBar = document.querySelector('.scroll-bar');
      
      if (scrollBar) {
        gsap.to(scrollBar, {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3
          }
        });
      }
    };
    
    UI.initMobileMenu = () => {
      const menuToggle = document.querySelector('.menu-toggle');
      const mobileMenu = document.querySelector('.mobile-menu');
      const menuLines = document.querySelectorAll('.menu-line');
      const body = document.body;
      let menuOpen = false;
      
      if (!menuToggle || !mobileMenu) return;
      
      menuToggle.addEventListener('click', () => {
        if (!menuOpen) {
          body.classList.add('menu-open');
          
          gsap.to(mobileMenu, {
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'all',
            duration: 0.4,
            ease: 'power3.out'
          });
          
          gsap.to(menuLines[0], {
            y: 9,
            rotation: 45,
            duration: 0.4,
            ease: 'power2.out'
          });
          
          gsap.to(menuLines[1], {
            opacity: 0,
            duration: 0.2
          });
          
          gsap.to(menuLines[2], {
            y: -9,
            rotation: -45,
            duration: 0.4,
            ease: 'power2.out'
          });
          
          gsap.fromTo('.mobile-nav-links li', 
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power3.out',
              delay: 0.1
            }
          );
          
          gsap.fromTo('.menu-contact a', 
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power3.out',
              delay: 0.3
            }
          );
          
          menuOpen = true;
        } else {
          body.classList.remove('menu-open');
          
          gsap.to(mobileMenu, {
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out',
            onComplete: () => {
              mobileMenu.style.visibility = 'hidden';
              mobileMenu.style.pointerEvents = 'none';
            }
          });
          
          gsap.to(menuLines[0], {
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
          
          gsap.to(menuLines[1], {
            opacity: 1,
            duration: 0.4
          });
          
          gsap.to(menuLines[2], {
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
          
          menuOpen = false;
        }
      });
      
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          if (menuOpen) {
            menuToggle.click();
          }
        });
      });
    };

    UI.initCursor = () => {
      // Пропускаем на мобильных устройствах
      if (window.innerWidth <= 768) return;
      
      const cursor = document.querySelector('.cursor');
      const cursorFollower = document.querySelector('.cursor-follower');
      
      // Обновление позиции курсора
      const updateCursorPosition = (e) => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
        
        gsap.to(cursorFollower, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.4,
          ease: "power2.out"
        });
      };
      
      // Обработка наведения на ссылки и кнопки
      const handleLinkHover = (e) => {
        cursor.classList.add('cursor-link');
        cursorFollower.classList.add('cursor-active');
      };
      
      const handleLinkLeave = (e) => {
        cursor.classList.remove('cursor-link');
        cursorFollower.classList.remove('cursor-active');
      };
      
      // Слушатели событий
      document.addEventListener('mousemove', updateCursorPosition);
      
      document.querySelectorAll('a, button, .magnetic-element').forEach(el => {
        el.addEventListener('mouseenter', handleLinkHover);
        el.addEventListener('mouseleave', handleLinkLeave);
      });
    };

    UI.initMagneticElements = () => {
      // Пропускаем на мобильных устройствах
      if (window.innerWidth <= 768) return;
      
      const magneticElements = document.querySelectorAll('.magnetic-element');
      
      magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const distanceX = e.clientX - centerX;
          const distanceY = e.clientY - centerY;
          
          // Сила магнитного эффекта
          const strength = 15; 
          const magneticX = distanceX / rect.width * strength;
          const magneticY = distanceY / rect.height * strength;
          
          gsap.to(element, {
            x: magneticX,
            y: magneticY,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
          });
        });
      });
    };

    UI.initHoverEffects = () => {
      // Подсветка для карточек
      const cards = document.querySelectorAll('.contact-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            duration: 0.4,
            ease: 'power2.out',
            boxShadow: 'var(--shadow-lg)'
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            boxShadow: 'var(--shadow-sm)'
          });
        });
      });
      
      // Эффект для кнопки маршрута
      const routeBtn = document.querySelector('.btn-route');
      if (routeBtn) {
        routeBtn.addEventListener('mouseenter', () => {
          gsap.to(routeBtn.querySelector('.btn-icon'), {
            x: 5,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
        
        routeBtn.addEventListener('mouseleave', () => {
          gsap.to(routeBtn.querySelector('.btn-icon'), {
            x: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
      }
      
      // Эффект для кнопки звонка
      const ctaBtn = document.querySelector('.connect-cta');
      if (ctaBtn) {
        ctaBtn.addEventListener('mouseenter', () => {
          gsap.to(ctaBtn.querySelector('.cta-circle'), {
            x: 5,
            duration: 0.4,
            ease: 'power2.out',
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
          });
        });
        
        ctaBtn.addEventListener('mouseleave', () => {
          gsap.to(ctaBtn.querySelector('.cta-circle'), {
            x: 0,
            duration: 0.4,
            ease: 'power2.out',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          });
        });
      }
    };

    Animations.sectionAnimations = () => {
      // Общая функция для анимации заголовков секций
      const animateSectionTitle = (section) => {
        const title = section.querySelector('.section-title');
        const label = section.querySelector('.section-label');
        const description = section.querySelector('.section-description');
        const btn = section.querySelector('.btn-route, .connect-cta');
        
        if (title) {
          gsap.to(title.querySelectorAll('.char'), {
            opacity: 1,
            y: 0,
            stagger: 0.01,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          });
        }
        
        if (label) {
          gsap.to(label, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: label,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          });
        }
        
        if (description) {
          gsap.to(description, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: description,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          });
        }
        
        if (btn) {
          gsap.to(btn, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: btn,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          });
        }
      };
      
      // Применяем анимацию к каждой секции
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        animateSectionTitle(section);
      });
      
      // Анимация карточек контактов
      const contactCards = document.querySelectorAll('.contact-card');
      contactCards.forEach(card => {
        const delay = parseFloat(card.getAttribute('data-stagger') || 0) * 0.1;
        
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
      
      // Анимация блока с картой
      gsap.to('.map-frame-wrapper', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.map-visual',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
      
      // Анимация границ карты
      gsap.to('.map-border-top', {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.map-visual',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
      
      gsap.to('.map-border-right', {
        scaleY: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: '.map-visual',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
      
      gsap.to('.map-border-bottom', {
        scaleX: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: '.map-visual',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
      
      gsap.to('.map-border-left', {
        scaleY: 1,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.6,
        scrollTrigger: {
          trigger: '.map-visual',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    };

    Animations.cardInteractions = () => {
      const cards = document.querySelectorAll('.contact-card');
      
      cards.forEach(card => {
        const hoverEffect = card.querySelector('.card-hover-effect');
        
        // Эффект перемещения градиента при движении мыши
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const mouseX = Math.floor((x / rect.width) * 100);
          const mouseY = Math.floor((y / rect.height) * 100);
          
          hoverEffect.style.setProperty('--mouse-x', `${mouseX}%`);
          hoverEffect.style.setProperty('--mouse-y', `${mouseY}%`);
        });
      });
    };

    initPage();
  });