document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    const Animations = {};
    const UI = {};
    
    // Smooth scroll с Lenis-like эффектом
    let smoothScroll = {
      current: 0,
      target: 0,
      ease: 0.075,
      
      init() {
        this.update();
      },
      
      update() {
        this.current = gsap.utils.interpolate(this.current, this.target, this.ease);
        
        if (Math.abs(this.target - this.current) < 0.05) {
          this.current = this.target;
        }
        
        requestAnimationFrame(() => this.update());
      }
    };
    
    const initPage = () => {
      // Инициализируем элементы прелоадера
      const preloader = document.querySelector('.preloader');
      const preloaderContent = document.querySelector('.preloader-content');
      const preloaderLogo = document.querySelector('.logo-preloader');
      const preloaderQuote = document.querySelector('.preloader-quote');
      const preloaderQuoteText = document.querySelector('.preloader-quote p');
      const preloaderProgress = document.querySelector('.preloader-progress');
      const preloaderBar = document.querySelector('.preloader-bar');
      
      // Убеждаемся что body начинает показываться
      document.body.style.opacity = '1';
      
      // Генерируем мобильное меню на основе основного меню
      generateMobileMenu();
      
      // Разбиваем текст для анимации - только один раз при загрузке
      const splitTexts = document.querySelectorAll('.split-text');
      splitTexts.forEach(text => {
        new SplitType(text, { types: 'chars, words', tagName: 'span' });
      });
      
      // Применяем разбивку текста к цитате прелоадера
      if (preloaderQuoteText) {
        new SplitType(preloaderQuoteText, { types: 'chars, words', tagName: 'span' });
      }
      
      // Разбиваем логотип на символы для анимации
      if (preloaderLogo) {
        new SplitType(preloaderLogo, { types: 'chars', tagName: 'span' });
        gsap.set(preloaderLogo.querySelectorAll('.char'), { 
          opacity: 0, 
          rotateX: -90,
          y: 30
        });
      }
      
      // Первичная настройка непрозрачности элементов
      gsap.set(preloaderQuote, { opacity: 1 });
      gsap.set(preloaderQuoteText, { opacity: 1 });
      gsap.set(preloaderQuoteText.querySelectorAll('.word'), { 
        opacity: 0,
        filter: 'blur(10px)',
        y: 50,
        rotateX: -45
      });
      
      // Скрываем элементы основной страницы для плавного появления
      gsap.set('.site-header', { y: -100, opacity: 0 });
      gsap.set('.hero-section', { opacity: 0 });
      gsap.set('.hero-title .char', { opacity: 0, y: 100, rotateX: -90 });
      gsap.set('.hero-subtitle .char', { opacity: 0, y: 40, filter: 'blur(8px)' });
      gsap.set('.hero-stats', { opacity: 0, y: 60 });
      gsap.set('.stat-item', { opacity: 0, y: 30 });
      gsap.set('.hero-cta', { opacity: 0, scale: 0.5, rotate: -5 });
      gsap.set('.scroll-indicator', { opacity: 0, scale: 0 });
      gsap.set('.image-mask', { 
        opacity: 0, 
        y: 100, 
        scale: 0.7, 
        rotateY: -25,
        rotateX: 10
      });
      
      // Инициализируем базовые интерактивные элементы до анимаций
      UI.initParallaxEffects();
      UI.initParticles();
      
      // Создаём новую улучшенную анимацию прелоадера
      const preloaderTimeline = gsap.timeline({
        onComplete: () => {
          // Запускаем анимацию исчезновения
          transitionToMainContent();
        }
      });
      
      // Последовательно анимируем элементы прелоадера (быстрая версия)
      preloaderTimeline
        // Анимация появления логотипа с 3D эффектом
        .to(preloaderLogo.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          stagger: {
            each: 0.02,
            from: "center"
          },
          ease: "expo.out"
        })
        // Анимация появления слов цитаты с blur эффектом
        .to(preloaderQuoteText.querySelectorAll('.word'), {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 0.5,
          stagger: 0.03,
          ease: "power4.out"
        }, "-=0.4")
        // Анимация появления индикатора прогресса
        .to(preloaderProgress, {
          opacity: 1,
          scaleX: 1,
          duration: 0.4,
          ease: "power3.out"
        }, "-=0.3")
        // Анимация заполнения индикатора прогресса с эффектом liquid
        .to(preloaderBar, {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.inOut"
        }, "-=0.2")
        // Небольшая пауза для лучшего восприятия
        .to({}, { duration: 0.2 });
      
      // Функция перехода от прелоадера к основному контенту
      const transitionToMainContent = () => {
        const exitTimeline = gsap.timeline({
          onComplete: () => {
            preloader.style.display = 'none';
            animateMainContent();
          }
        });
        
        exitTimeline
          // Анимация исчезновения текста с распадом
          .to(preloaderLogo.querySelectorAll('.char'), {
            opacity: 0,
            y: -50,
            rotateX: 90,
            scale: 0.5,
            duration: 0.6,
            stagger: {
              each: 0.02,
              from: "edges"
            },
            ease: "power3.in"
          })
          .to(preloaderQuoteText.querySelectorAll('.word'), {
            opacity: 0,
            y: -30,
            filter: 'blur(15px)',
            duration: 0.5,
            stagger: 0.03,
            ease: "power2.in"
          }, "-=0.5")
          // Эффектное исчезновение прогресс-бара
          .to(preloaderProgress, {
            scaleY: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in"
          }, "-=0.4")
          // Масштабирование и затухание фона
          .to(preloaderContent, {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut"
          }, "-=0.4")
          // Круговая маска исчезновения
          .to(preloader, {
            clipPath: 'circle(0% at 50% 50%)',
            duration: 1,
            ease: "expo.inOut"
          }, "-=0.4");
      };
    };
    
    // Функция для генерации мобильного меню на основе основного
    const generateMobileMenu = () => {
      const navLinks = document.querySelectorAll('.nav-links a');
      const mobileNavContainer = document.querySelector('.mobile-nav-links');
      
      if (!navLinks.length || !mobileNavContainer) return;
      
      // Очищаем мобильное меню перед заполнением
      mobileNavContainer.innerHTML = '';
      
      // Перебираем все ссылки из основного меню
      navLinks.forEach(link => {
        const isActive = link.classList.contains('active');
        const navId = link.getAttribute('data-nav-id') || '';
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        // Создаем новый элемент для мобильного меню
        const mobileItem = document.createElement('li');
        mobileItem.innerHTML = `
          <a href="${href}" class="mobile-link${isActive ? ' active' : ''}">
            <span>${navId}</span>${text}
          </a>
        `;
        
        // Добавляем элемент в мобильное меню
        mobileNavContainer.appendChild(mobileItem);
      });
    };
    
    // Единая функция анимации основного контента - премиум стиль
    const animateMainContent = () => {
      // Инициализируем UI-компоненты только один раз
      UI.initMobileMenu();
      UI.initHoverEffects();
      UI.initMagneticElements();
      UI.initImageTilt();
      
      const mainTimeline = gsap.timeline();
      
      mainTimeline
        // Хедер с эффектом падения сверху
        .to('.site-header', {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out'
        })
        // Герой секция
        .to('.hero-section', { 
          opacity: 1, 
          duration: 0.6, 
          ease: 'power2.out' 
        }, "-=1")
        // Заголовок с 3D эффектом
        .to('.hero-title .char', {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: {
            each: 0.03,
            from: "start"
          },
          duration: 1.4,
          ease: 'expo.out'
        }, "-=0.8")
        // Подзаголовок с blur эффектом
        .to('.hero-subtitle .char', {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          stagger: 0.015,
          duration: 1,
          ease: 'power4.out'
        }, "-=1")
        // Статистика с пружинным эффектом
        .to('.hero-stats', {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.6)'
        }, "-=0.6")
        .to('.stat-item', {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out'
        }, "-=0.8")
        // CTA кнопка с вращением
        .to('.hero-cta', {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1,
          ease: 'back.out(1.7)'
        }, "-=0.9")
        // Скролл-индикатор с масштабированием
        .to('.scroll-indicator', {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(2)'
        }, "-=0.7")
        // Изображение с 3D трансформацией
        .to('.image-mask', {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateY: 0,
          rotateX: 0,
          duration: 1.6,
          ease: 'expo.out',
          onStart: () => {
            const imageMask = document.querySelector('.image-mask');
            if (imageMask) imageMask.classList.add('animated');
          }
        }, "-=1.4")
        // Изображение внутри маски с плавным зумом
        .to('.image-wrapper img', {
          scale: 1,
          duration: 2.5,
          ease: 'power2.out'
        }, "-=1.6");
      
      // Инициализируем анимации на скролл с задержкой
      setTimeout(initScrollAnimations, 100);
    };
    
    // Выделяем отдельную функцию для анимаций на скролл - CSS Awards стиль
    const initScrollAnimations = () => {
      // Анимации для секций при скролле с премиум эффектами
      document.querySelectorAll('section:not(.hero-section)').forEach((section) => {
        const title = section.querySelector('.section-title');
        const label = section.querySelector('.section-label');
        const description = section.querySelector('.section-description');
        
        if (label) {
          ScrollTrigger.create({
            trigger: label,
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.to(label, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: 'back.out(1.7)'
              });
            }
          });
        }
        
        if (title) {
          ScrollTrigger.create({
            trigger: title,
            start: "top 80%",
            once: true,
            onEnter: () => {
              const chars = title.querySelectorAll('.char');
              if (chars.length > 0) {
                gsap.to(chars, {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  stagger: {
                    each: 0.02,
                    from: "start"
                  },
                  duration: 1.2,
                  ease: 'expo.out',
                });
              }
            }
          });
        }
        
        if (description) {
          ScrollTrigger.create({
            trigger: description,
            start: "top 85%",
            once: true,
            onEnter: () => {
              gsap.to(description, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1.2,
                ease: 'power3.out'
              });
            }
          });
        }
        
        // Parallax эффект для секций
        gsap.to(section, {
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      });
      
      // Анимации карточек trust
      const trustCards = document.querySelectorAll('.trust-card');
      trustCards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.2,
              delay: index * 0.15,
              ease: 'expo.out'
            });
          }
        });
      });
      
      // Анимации списка географии
      const geoList = document.querySelector('.geography-list');
      if (geoList) {
        ScrollTrigger.create({
          trigger: geoList,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(geoList, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
            
            gsap.to('.geo-item', {
              opacity: 1,
              x: 0,
              stagger: 0.1,
              duration: 0.8,
              delay: 0.2,
              ease: 'power3.out'
            });
          }
        });
      }
      
      // Анимации карточек арсенала
      const arsenalCards = document.querySelectorAll('.arsenal-card');
      arsenalCards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.2,
              delay: index * 0.2,
              ease: 'expo.out'
            });
          }
        });
      });
      
      // Анимация arsenal-info
      const arsenalInfo = document.querySelector('.arsenal-info');
      if (arsenalInfo) {
        ScrollTrigger.create({
          trigger: arsenalInfo,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(arsenalInfo, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out'
            });
          }
        });
      }
      
      // Анимации преимуществ
      const advantageItems = document.querySelectorAll('.advantage-item');
      advantageItems.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(item, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: 'power3.out'
            });
          }
        });
      });
      
      // Анимация pricing note
      const pricingNote = document.querySelector('.pricing-note');
      if (pricingNote) {
        ScrollTrigger.create({
          trigger: pricingNote,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(pricingNote, {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out'
            });
          }
        });
      }
      
      // Анимации CTA секции
      const ctaTitle = document.querySelector('.cta-title');
      if (ctaTitle) {
        ScrollTrigger.create({
          trigger: ctaTitle,
          start: "top 80%",
          once: true,
          onEnter: () => {
            const chars = ctaTitle.querySelectorAll('.char');
            if (chars.length > 0) {
              gsap.to(chars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                stagger: {
                  each: 0.02,
                  from: "start"
                },
                duration: 1.2,
                ease: 'expo.out'
              });
            }
          }
        });
      }
      
      const ctaDescription = document.querySelector('.cta-description');
      if (ctaDescription) {
        ScrollTrigger.create({
          trigger: ctaDescription,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(ctaDescription, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          }
        });
      }
      
      const ctaButtons = document.querySelectorAll('.cta-button');
      ctaButtons.forEach((btn, index) => {
        ScrollTrigger.create({
          trigger: btn,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(btn, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.1,
              ease: 'power3.out'
            });
          }
        });
      });
      
      // Анимация футера с эффектом всплывания
      ScrollTrigger.create({
        trigger: '.site-footer',
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to('.footer-logo', {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out'
          });
          
          gsap.to('.footer-tagline', {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: 0.1,
            ease: 'expo.out'
          });
          
          gsap.to('.footer-heading', {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out'
          });
          
          gsap.to('.footer-link, .footer-contact-link, .footer-address', {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.out'
          });
          
          gsap.to('.copyright', {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.6,
            ease: 'power3.out'
          });
        }
      });
      
      // Эффект параллакса для изображения героя
      gsap.to('.image-wrapper img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5
        }
      });
      
      // Прогресс скролла с плавной анимацией
      gsap.to('.scroll-bar', {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5
        }
      });
      
      // Скрытие скролл-индикатора при скролле
      gsap.to('.scroll-indicator', {
        opacity: 0,
        y: -20,
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: '+=300',
          scrub: 1
        }
      });
      
      // Анимации reveal элементов
      document.querySelectorAll('.anim-reveal').forEach(el => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          once: true,
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
          }
        });
      });
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

    UI.initHoverEffects = () => {
      // Подсветка для карточек
      const cards = document.querySelectorAll('.trust-card, .arsenal-card, .advantage-item');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
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
          
          // Сила магнитного эффекта - увеличена для большей выразительности
          const strength = 20; 
          const magneticX = distanceX / rect.width * strength;
          const magneticY = distanceY / rect.height * strength;
          
          gsap.to(element, {
            x: magneticX,
            y: magneticY,
            duration: 0.5,
            ease: 'power3.out'
          });
          
          // Добавляем небольшой 3D эффект
          const rotateX = -distanceY / rect.height * 10;
          const rotateY = distanceX / rect.width * 10;
          
          gsap.to(element, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: 'power3.out'
          });
        });
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)'
          });
        });
      });
    };

    // Новый эффект - 3D tilt для изображений
    UI.initImageTilt = () => {
      if (window.innerWidth <= 768) return;
      
      const imageMask = document.querySelector('.image-mask');
      if (!imageMask) return;
      
      imageMask.addEventListener('mousemove', (e) => {
        const rect = imageMask.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -10;
        const rotateY = (x - centerX) / centerX * 10;
        
        gsap.to(imageMask, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });
      
      imageMask.addEventListener('mouseleave', () => {
        gsap.to(imageMask, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    };

    // Параллакс эффекты для элементов
    UI.initParallaxEffects = () => {
      // Эффект скролла для хедера
      ScrollTrigger.create({
        start: 'top top',
        end: 99999,
        onUpdate: (self) => {
          const header = document.querySelector('.site-header');
          if (self.direction === -1) {
            header.classList.remove('scrolled');
          } else if (self.progress > 0.02) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        }
      });
    };
    
    // Простой particle эффект
    UI.initParticles = () => {
      const canvas = document.getElementById('particles-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      let particles = [];
      const particleCount = 50;
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 1;
          this.speedX = Math.random() * 0.5 - 0.25;
          this.speedY = Math.random() * 0.5 - 0.25;
        }
        
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          
          if (this.x > canvas.width) this.x = 0;
          if (this.x < 0) this.x = canvas.width;
          if (this.y > canvas.height) this.y = 0;
          if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
          ctx.fillStyle = 'rgba(144, 108, 70, 0.3)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      }
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
        requestAnimationFrame(animate);
      }
      
      init();
      animate();
      
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
      });
    };

    // Система плавных переходов между страницами
    const PageTransition = {
      isTransitioning: false,
      
      init() {
        this.createOverlay();
        this.bindLinks();
      },
      
      createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = `
          <div class="transition-content">
            <div class="transition-logo">ИП ПРЫТКОВ М.А.</div>
          </div>
        `;
        document.body.appendChild(overlay);
      },
      
      bindLinks() {
        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (!link) return;
          
          const href = link.getAttribute('href');
          if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || link.target === '_blank') return;
          
          // Проверяем, что это внутренняя ссылка на HTML страницу
          if (href.endsWith('.html') || href === 'index.html') {
            e.preventDefault();
            this.navigateTo(href);
          }
        });
      },
      
      async navigateTo(url) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const overlay = document.querySelector('.page-transition-overlay');
        
        // Анимация выхода
        gsap.to(overlay, {
          clipPath: 'circle(150% at 50% 50%)',
          duration: 0.8,
          ease: 'expo.inOut',
          onComplete: () => {
            window.location.href = url;
          }
        });
        
        gsap.to('.transition-logo', {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.2,
          ease: 'expo.out'
        });
      }
    };
    
    // Инициализируем систему переходов
    PageTransition.init();
    
    // Инициализируем страницу
    initPage();
  });
