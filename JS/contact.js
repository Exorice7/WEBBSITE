document.addEventListener('DOMContentLoaded', () => {
    // Регистрируем плагины GSAP
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    // Создаем пространство имен для управления анимациями
    const Animations = {};
    const UI = {};
    
    // =========================
    // ПРЕЛОАДЕР И ИНИЦИАЛИЗАЦИЯ
    // =========================
    
    // Функция инициализации всех компонентов
    const initPage = () => {
      // Анимация прелоадера
      const preloader = document.querySelector('.preloader');
      const preloaderQuote = document.querySelector('.preloader-quote');
      const preloaderBar = document.querySelector('.preloader-bar');
      
      // Сначала показываем текст и прогресс-бар
      const preloaderTimeline = gsap.timeline({
        onComplete: () => {
          // После завершения начальной анимации скрываем прелоадер
          gsap.to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
              // Инициализация всех остальных анимаций
              initAnimations();
            }
          });
        }
      });
      
      preloaderTimeline
        .to(preloaderQuote, {
          opacity: 1,
          duration: 1,
          ease: "power3.out"
        })
        .to(preloaderBar, {
          scaleX: 1,
          duration: 1.5,
          ease: "power2.inOut"
        }, "-=0.5");
      
      // Отображаем тело документа
      gsap.to('body', { 
        opacity: 1, 
        duration: 0.1
      });
    };
    
    // =========================
    // АНИМАЦИИ
    // =========================
    
    // Инициализация всех анимаций
    const initAnimations = () => {
      // Инициализируем компоненты UI
      UI.initScrollProgress();
      UI.initMobileMenu();
      
      // Запускаем анимации
      Animations.headerAnimation();
      Animations.introAnimation();
      Animations.sectionsAnimation();
      Animations.parallaxEffects();
      Animations.marqueeAnimation();
    };
    
    // Анимации для интро-секции
    Animations.introAnimation = () => {
      const introTitle = document.querySelector('.intro-title');
      
      if (introTitle) {
        // Разделяем текст на символы для анимации
        const splitTitle = new SplitType(introTitle, {
          types: 'chars, words',
          tagName: 'span'
        });
        
        // Анимация заголовка
        const titleChars = splitTitle.chars;
        gsap.to(titleChars, {
          y: 0,
          stagger: 0.02,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2
        });
        
        // Анимация описания
        gsap.to('.paragraph-reveal', {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: 0.8,
          ease: "power3.out"
        });
        
        // Анимация индикатора скролла
        gsap.to('.scroll-indicator', {
          opacity: 1,
          duration: 1,
          delay: 1.2,
          ease: "power3.out"
        });
        
        // Анимация фонового изображения
        gsap.to('.background-image img', {
          scale: 1,
          duration: 2,
          ease: "power2.out"
        });
      }
    };
    
    // Анимации для хедера
    Animations.headerAnimation = () => {
      const header = document.querySelector('.site-header');
      
      if (header) {
        ScrollTrigger.create({
          start: 'top -50',
          onEnter: () => {
            header.classList.add('scrolled');
            gsap.to(header, {
              backgroundColor: 'rgba(247, 245, 241, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(144, 108, 70, 0.1)',
              padding: '1rem 2rem',
              duration: 0.3,
              ease: 'power2.out'
            });
          },
          onLeaveBack: () => {
            header.classList.remove('scrolled');
            gsap.to(header, {
              backgroundColor: 'transparent',
              backdropFilter: 'blur(0px)',
              borderBottom: '1px solid rgba(144, 108, 70, 0)',
              padding: '2rem 2rem',
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });
      }
    };
    
    // Анимации для секций
    Animations.sectionsAnimation = () => {
      // Анимация заголовков секций
      gsap.utils.toArray('.title-reveal').forEach(title => {
        const titleAnim = gsap.timeline({
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            once: true
          }
        });
        
        titleAnim
          .to(title, { opacity: 1, duration: 0 })
          .to(title.querySelector('::before') || title, {
            xPercent: 100,
            duration: 1,
            ease: 'power3.inOut'
          });
      });
      
      // Анимация параграфов
      gsap.utils.toArray('.paragraph-reveal:not(.intro-description .paragraph-reveal)').forEach(paragraph => {
        gsap.to(paragraph, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: paragraph,
            start: 'top 85%'
          }
        });
      });
      
      // Анимация контактной информации
      gsap.utils.toArray('.contact-item').forEach((item, i) => {
        gsap.from(item, {
          x: -30,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%'
          },
          delay: i * 0.1
        });
      });
      
      // Анимация карты
      gsap.to('.map-container', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.map-container',
          start: 'top 85%'
        }
      });
    };
    
    // Параллакс эффекты при скролле
    Animations.parallaxEffects = () => {
      // Параллакс для фонового изображения
      gsap.to('.background-image img', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.intro-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    };
    
    // Анимация бегущей строки
    Animations.marqueeAnimation = () => {
      const marquee = document.querySelector('.text-marquee');
      if (!marquee) return;
      
      // Дополнительный эффект при наведении
      marquee.addEventListener('mouseenter', () => {
        gsap.to('.marquee-content', {
          animationPlayState: 'paused',
          duration: 0.2
        });
      });
      
      marquee.addEventListener('mouseleave', () => {
        gsap.to('.marquee-content', {
          animationPlayState: 'running',
          duration: 0.2
        });
      });
    };

    // =========================
    // КОМПОНЕНТЫ ИНТЕРФЕЙСА
    // =========================
    
    // Индикатор прогресса скролла
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
    
    // Мобильное меню
    UI.initMobileMenu = () => {
      const menuToggle = document.querySelector('.menu-toggle');
      const mobileMenu = document.querySelector('.mobile-menu');
      const menuLines = document.querySelectorAll('.menu-line');
      let menuOpen = false;
      
      if (!menuToggle || !mobileMenu) return;
      
      menuToggle.addEventListener('click', () => {
        if (!menuOpen) {
          // Открываем меню
          gsap.to(mobileMenu, {
            opacity: 1,
            visibility: 'visible',
            pointerEvents: 'all',
            duration: 0.5,
            ease: 'power3.out'
          });
          
          // Анимация гамбургер-иконки
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
          
          // Анимация появления пунктов меню
          gsap.fromTo('.mobile-nav-links li', {
            y: 20,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
            delay: 0.2
          });
          
          // Анимация контактов
          gsap.fromTo('.menu-contact a', {
            y: 20,
            opacity: 0
          }, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power3.out',
            delay: 0.4
          });
          
          menuOpen = true;
        } else {
          // Закрываем меню
          gsap.to(mobileMenu, {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none',
            duration: 0.5,
            ease: 'power3.out'
          });
          
          // Анимация гамбургер-иконки
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
      
      // Закрытие меню при клике на пункт меню
      document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
          if (menuOpen) {
            menuToggle.click();
          }
        });
      });
    };

    // Запускаем инициализацию страницы
    initPage();
  }); 