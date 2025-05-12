document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    const Animations = {};
    const UI = {};
    
    const initPage = () => {
      const preloader = document.querySelector('.preloader');
      const preloaderQuote = document.querySelector('.preloader-quote');
      const preloaderBar = document.querySelector('.preloader-bar');
      
      const preloaderTimeline = gsap.timeline({
        onComplete: () => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power3.inOut",
            onComplete: () => {
              initAnimations();
              preloader.style.display = 'none';
            }
          });
        }
      });
      
      preloaderTimeline
        .to(preloaderQuote, {
          opacity: 1,
          duration: 0.8,
          ease: "power3.out"
        })
        .to(preloaderBar, {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut"
        }, "-=0.3");
      
      gsap.to('body', { 
        opacity: 1, 
        duration: 0.1
      });
    };
    
    const initAnimations = () => {
      UI.initScrollProgress();
      UI.initMobileMenu();
      
      Animations.headerAnimation();
      Animations.parallaxEffects();
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
            delay: 0.2
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

    initPage();
  });