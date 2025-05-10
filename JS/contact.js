document.addEventListener('DOMContentLoaded', () => {
    // Регистрируем плагины GSAP
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    // Инициализация SplitType для анимации текста
    const splitHeading = new SplitType('.split-text', {
      types: 'chars, words',
      tagName: 'span'
    });
    
    // Функция инициализации кастомного курсора
    const initCustomCursor = () => {
      const cursor = document.querySelector('.cursor');
      const cursorFollower = document.querySelector('.cursor-follower');
      
      // Проверка на мобильное устройство
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        cursor.style.display = 'none';
        cursorFollower.style.display = 'none';
        return;
      }

      document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out'
        });

        gsap.to(cursorFollower, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      // Показать курсор при входе на страницу
      gsap.to([cursor, cursorFollower], {
        opacity: 1,
        duration: 1,
        delay: 0.3
      });

      // Эффекты при наведении на интерактивные элементы
      const hoverElements = document.querySelectorAll('[data-cursor="hover"]');
      hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
          gsap.to(cursor, {
            scale: 1.5,
            backgroundColor: 'transparent',
            border: '1px solid var(--color-accent)',
            duration: 0.3,
          });
          gsap.to(cursorFollower, {
            scale: 1.5,
            opacity: 0.1,
            duration: 0.3
          });
        });

        element.addEventListener('mouseleave', () => {
          gsap.to(cursor, {
            scale: 1,
            backgroundColor: 'var(--color-accent)',
            border: 'none',
            duration: 0.3
          });
          gsap.to(cursorFollower, {
            scale: 1,
            opacity: 1,
            duration: 0.3
          });
        });
      });
    };
    
    // Инициализация табов контактной карточки
    const initContactTabs = () => {
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');
      
      if (!tabBtns.length || !tabContents.length) return;
      
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          // Убираем активный класс со всех кнопок и контента
          tabBtns.forEach(b => b.classList.remove('active'));
          tabContents.forEach(content => content.classList.remove('active'));
          
          // Добавляем активный класс текущей кнопке
          btn.classList.add('active');
          
          // Показываем соответствующий контент
          const tabId = btn.getAttribute('data-tab');
          const activeContent = document.getElementById(`${tabId}-tab`);
          if (activeContent) {
            activeContent.classList.add('active');
          }
          
          // Анимация контента
          gsap.fromTo(activeContent, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
          );
        });
      });
      
      // Интерактивные эффекты для контактной карточки
      const contactCard = document.querySelector('.contact-card');
      if (contactCard) {
        // Эффект наведения с движением мыши
        contactCard.addEventListener('mousemove', (e) => {
          const rect = contactCard.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Вычисляем угол наклона (меньшие значения для более тонкого эффекта)
          const tiltX = (y - centerY) / 25;
          const tiltY = -(x - centerX) / 25;
          
          // Применяем трансформацию
          gsap.to(contactCard, {
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 1000,
            duration: 0.6,
            ease: "power3.out",
            boxShadow: `
              ${tiltY * -1}px ${tiltX}px 30px rgba(0, 0, 0, 0.1)
            `
          });
          
          // Анимация декоративных элементов
          gsap.to('.decoration-circle', {
            x: tiltY * 5,
            y: tiltX * 5,
            duration: 0.6,
            ease: "power3.out"
          });
          
          gsap.to('.decoration-line', {
            rotation: -45 + tiltX * 2,
            duration: 0.6,
            ease: "power3.out"
          });
        });

        contactCard.addEventListener('mouseleave', () => {
          // Возвращаем карточку в исходное положение
          gsap.to(contactCard, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: "elastic.out(0.8, 0.2)",
            boxShadow: 'var(--shadow-lg)'
          });
          
          // Возвращаем декоративные элементы в исходное положение
          gsap.to('.decoration-circle', {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(0.8, 0.2)"
          });
          
          gsap.to('.decoration-line', {
            rotation: -45,
            duration: 0.6,
            ease: "elastic.out(0.8, 0.2)"
          });
        });
      }
      
      // Анимация появления контактных элементов
      gsap.from('.contact-item', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact-items',
          start: 'top 80%'
        }
      });
    };
    
    // Анимация бегущей строки
    const initMarquee = () => {
      const marqueeContent = document.querySelector('.marquee-content');
      if (!marqueeContent) return;
    
      // Дублируем содержимое для бесконечной анимации
      marqueeContent.innerHTML = marqueeContent.innerHTML + marqueeContent.innerHTML;
    
      gsap.to(marqueeContent, {
        x: '-50%',
        ease: 'none',
        duration: 25,
        repeat: -1
      });
    };
    
    // Анимация героя при загрузке
    const animateHero = () => {
      // Показываем тело
      gsap.to('body', { 
        opacity: 1, 
        duration: 1.5,
        ease: "power3.inOut"
      });
    
      // Анимация появления страницы
      gsap.fromTo('.page-transition', {
        y: 0
      }, {
        y: '-100%',
        duration: 1.2,
        ease: "power3.inOut"
      });
    
      // Анимация заголовка посимвольно
      gsap.from('.split-text .char', {
        opacity: 0,
        y: 100,
        duration: 1.2,
        stagger: 0.03,
        ease: "power4.out",
        delay: 0.5
      });
    
      // Анимация подзаголовка
      gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        delay: 1.5
      });
    };
    
    // Анимации при скролле
    const initScrollAnimations = () => {
      // Параллакс эффект для изображения
      gsap.to('.parallax-image', {
        y: '-20%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.image-wrapper',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Появление цитаты
      gsap.to('.image-quote', {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: '.contact-image',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });

      // Появление карточки контактов
      gsap.from('.contact-card', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        scrollTrigger: {
          trigger: '.contact-info-wrapper',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      });
      
      // Анимация декоративных элементов
      gsap.from('.decoration-circle', {
        scale: 0,
        opacity: 0,
        duration: 1.5,
        delay: 0.3,
        ease: 'elastic.out(1, 0.3)',
        scrollTrigger: {
          trigger: '.contact-card',
          start: 'top 70%'
        }
      });
      
      gsap.from('.decoration-line', {
        scaleX: 0,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact-card',
          start: 'top 70%'
        }
      });

      // Изменение хедера при скролле
      ScrollTrigger.create({
        start: 'top -80',
        onEnter: () => {
          gsap.to('.site-header', {
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(247, 244, 240, 0.8)',
            padding: '1rem 4rem',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.05)',
            duration: 0.3
          });
        },
        onLeaveBack: () => {
          gsap.to('.site-header', {
            backdropFilter: 'blur(0px)',
            backgroundColor: 'transparent',
            padding: '2rem 4rem',
            boxShadow: 'none',
            duration: 0.3
          });
        }
      });
    };
    
    // Инициализация мобильного меню
    const initMobileMenu = () => {
      const menuToggle = document.querySelector('.menu-toggle');
      if (!menuToggle) return;

      let menuOpen = false;
      const nav = document.querySelector('.main-nav');

      menuToggle.addEventListener('click', () => {
        if (!menuOpen) {
          // Открытие меню
          gsap.to(menuToggle.querySelectorAll('span'), {
            backgroundColor: 'var(--color-accent)',
            duration: 0.3
          });

          gsap.to(menuToggle.querySelector('span:first-child'), {
            rotate: 45,
            y: 9,
            duration: 0.3
          });

          gsap.to(menuToggle.querySelector('span:last-child'), {
            rotate: -45,
            y: -9,
            duration: 0.3
          });

          // Показать мобильное меню
          gsap.to(nav, {
            display: 'block',
            opacity: 1,
            y: 0,
            duration: 0.5
          });

          menuOpen = true;
        } else {
          // Закрытие меню
          gsap.to(menuToggle.querySelectorAll('span'), {
            backgroundColor: 'var(--color-white)',
            duration: 0.3
          });

          gsap.to(menuToggle.querySelector('span:first-child'), {
            rotate: 0,
            y: 0,
            duration: 0.3
          });

          gsap.to(menuToggle.querySelector('span:last-child'), {
            rotate: 0,
            y: 0,
            duration: 0.3
          });

          // Скрыть мобильное меню
          gsap.to(nav, {
            display: 'none',
            opacity: 0,
            y: -20,
            duration: 0.5
          });

          menuOpen = false;
        }
      });

      // Настройка мобильной навигации
      if (window.innerWidth <= 768) {
        nav.style.display = 'none';
        nav.style.position = 'fixed';
        nav.style.top = '80px';
        nav.style.left = '0';
        nav.style.width = '100%';
        nav.style.padding = '2rem';
        nav.style.backgroundColor = 'rgba(247, 244, 240, 0.95)';
        nav.style.backdropFilter = 'blur(10px)';
        nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-20px)';
        nav.style.zIndex = '99';

        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            menuOpen = false;
            gsap.to(nav, {
              display: 'none',
              opacity: 0,
              y: -20,
              duration: 0.5
            });

            gsap.to(menuToggle.querySelectorAll('span'), {
              backgroundColor: 'var(--color-white)',
              duration: 0.3
            });

            gsap.to(menuToggle.querySelector('span:first-child'), {
              rotate: 0,
              y: 0,
              duration: 0.3
            });

            gsap.to(menuToggle.querySelector('span:last-child'), {
              rotate: 0,
              y: 0,
              duration: 0.3
            });
          });
        });
      }
    };
    
    // Запуск всех анимаций
    const init = () => {
      animateHero();
      initCustomCursor();
      initContactTabs();
      initMarquee();
      initScrollAnimations();
      initMobileMenu();
    };
    
    // Запускаем все инициализации после загрузки страницы
    init();
  }); 