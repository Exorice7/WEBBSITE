// Убедимся, что GSAP и плагины зарегистрированы
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// --- Инициализация ScrollSmoother ---
ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: 'DOMContentLoaded,load,resize', // Добавим resize
});

const scroller = (() => {
    // Отключаем ScrollSmoother на тач-устройствах для лучшей производительности нативного скролла
    // Добавил проверку на window.utils на случай, если скрипт utils.js не загрузится по какой-то причине
    if (typeof gsap === 'undefined' || typeof ScrollSmoother === 'undefined' || !window.utils || utils.device.isTouch()) {
        document.body.classList.add('normalize-scroll'); // Добавляем класс для CSS стилей без ScrollSmoother
        return null;
    }

    document.body.classList.add('has-smoother'); // Класс для индикации наличия smoother

    // Инициализация ScrollSmoother
    return ScrollSmoother.create({
        content: '.content-scroll',
        wrapper: '.viewport-wrapper',
        smooth: 1.5, // Немного уменьшил для большей отзывчивости
        effects: false, // Отключаем встроенные эффекты, если не нужны
        normalizeScroll: true, // Важно для согласованности
        preventDefault: true,
    });
})();


// --- Функция создания GSAP Swiper ---
const createGsapSwiper = () => {
    let DOM = {}; // Объект для хранения ссылок на DOM-элементы
    let swiper = null;
    let swiperInitialized = false;
    let gsapAnimation = null; // Для ScrollTrigger анимации

    let isScrubActive = false; // Флаг режима scrub
    let isSwiperNavigation = false; // Флаг наличия кнопок навигации
    let centeredSlides = true; // Центрировать ли активный слайд
    let currentActiveSlideIndex = 0; // Индекс активного слайда при инициализации
    let options = {}; // Опции конкретного инстанса

    // Опции по умолчанию
    const defaultOptions = {
        selector: null,             // Селектор корневого элемента карусели
        centeredSlides: true,       // Центрировать слайды по умолчанию
        isScrubActive: false,       // Отключен ли scrub по умолчанию
        isScrubOnTouchActive: false,// Разрешен ли scrub на тач-устройствах
        scrubDir: 1,                // Направление scrub (1: вперед, -1: назад)
    };

    /** Инициализация Swiper.js */
    const _initializeSwiper = (selectorEl) => {
        if (!selectorEl) return;

        const swiperOptions = {
            init: false, // Инициализируем вручную после настройки
            runCallbacksOnInit: true,
            direction: 'horizontal',
            slidesPerView: 'auto', // Количество видимых слайдов определяется их шириной
            centeredSlides: centeredSlides,
            centeredSlidesBounds: false, // Не ограничивать центрированный слайд краями контейнера
            slidesOffsetBefore: _getSlidesOffset(), // Отступ перед первым слайдом (динамический)
            slidesOffsetAfter: _getSlidesOffsetAfter(), // Отступ после последнего (динамический)
            spaceBetween: _getSlideSpacing(), // Пространство между слайдами (динамическое)
            initialSlide: currentActiveSlideIndex,
            loop: false, // Зацикливание отключено
            speed: 700, // Скорость анимации Swiper
            roundLengths: false, // Не округлять размеры для точности
            preloadImages: false, // Не предзагружать все изображения
            touchMoveStopPropagation: false, // Не останавливать всплытие touchmove
            threshold: utils.device.isTouch() ? 10 : 6, // Порог срабатывания свайпа
            passiveListeners: true, // Для лучшей производительности скролла
            preventClicks: true, // Предотвращать клики во время перетаскивания
            watchSlidesProgress: true, // Следить за прогрессом каждого слайда (для анимаций)
            watchSlidesVisibility: false, // Не следить за видимостью (watchProgress достаточно)
            grabCursor: !utils.device.isTouch() && !isScrubActive, // Показывать курсор "рука" на десктопе, если не scrub
            // customTransition: true, // НЕ ИСПОЛЬЗУЕМ, т.к. Swiper должен управлять translate
            virtualTranslate: isScrubActive, // Виртуальный translate ТОЛЬКО для scrub режима
            slideToClickedSlide: false, // Не переходить к слайду по клику
            watchOverflow: false, // Не следить, помещаются ли все слайды
            resistanceRatio: 0.85, // Сопротивление при выходе за границы
            on: {
                init: _onSwiperInit,
                // setTransition: _onSetTransition, // Не нужно с virtualTranslate: false
                progress: _onSwiperProgress, // Обработчик прогресса для анимации слайдов
                touchStart: _onTouchStart, // Обработчик начала касания
                // Дополнительные обработчики для НЕ-scrub режима
                ...( !isScrubActive && {
                     touchEnd: _checkBounds,
                     transitionStart: _checkBounds,
                     transitionEnd: _checkBounds
                 })
            }
        };

        // Добавляем конфигурацию для scrub-режима
        if (isScrubActive) {
            swiperOptions.updateOnWindowResize = false; // GSAP будет управлять обновлением
            swiperOptions.allowTouchMove = false; // Запрещаем свайп в режиме scrub
            utils.dom.addClass(DOM.swiper, 'swiper-no-swiping');
        } else {
             // Подключаем пагинацию, если она есть
             if (DOM.swiperPagination) {
                 swiperOptions.pagination = {
                     el: DOM.swiperPagination,
                     type: 'bullets',
                     clickable: true,
                 };
             }
             // Подключаем навигацию, если она есть и не тач-устройство
             if (DOM.swiperNavigationContainer && !utils.device.isTouch()) {
                swiperOptions.navigation = {
                     nextEl: DOM.swiperNext,
                     prevEl: DOM.swiperPrev,
                     hiddenClass: 'hide', // Класс для скрытия неактивных кнопок
                 };
                _setupNavigationClickHandlers(); // Настроим кастомные обработчики, если нужно
             }
        }

        // Создаем экземпляр Swiper
        swiper = new Swiper(selectorEl, swiperOptions);

        // Инициализируем Swiper после небольшой задержки
        utils.system.nextTick(() => {
            // Добавим проверку swiper && !swiper.destroyed на случай race condition
            if (swiper && !swiper.destroyed) {
                 swiper.init();
                 if (!isScrubActive) {
                     _checkBounds(); // Проверяем границы сразу после инициализации
                 }
                 _updateSwiperStateByProgress(isScrubActive ? 0 : swiper.progress); // Установим начальное состояние
                 _update(); // Обновим связанные элементы (текст, навигацию)
            }
        }, null, 50); // Небольшая задержка для Swiper init
    };

    /** Получает реальный отступ между слайдами из DOM (через элемент .swiper-column-gap) */
    const _getSlideSpacing = () => {
         // Используем кэшированное значение, если есть, иначе вычисляем
         if (DOM.cachedSlideSpacing === null) {
             DOM.cachedSlideSpacing = DOM.swiperSpacing ? Math.ceil(parseFloat(getComputedStyle(DOM.swiperSpacing).width)) : 0;
         }
         return DOM.cachedSlideSpacing;
    };

    /** Вычисляет отступ перед первым слайдом */
    const _getSlidesOffset = () => {
        const spacingOffset = _getSlideSpacing();
        const viewportWidth = window.innerWidth;
        const maxWrapperSize = DOM.maxWrapperSize || viewportWidth; // Используем viewportWidth если не задано
        const isLargeScreen = viewportWidth >= maxWrapperSize;
        const isMediumScreen = viewportWidth >= DOM.mdBreakpoint; // Учитываем медиа-точку

        if (centeredSlides) {
             // На больших экранах с центрированием отступ не нужен, если не на всю ширину
             if (isLargeScreen && !DOM.el.classList.contains('full-bg-color')) {
                 return 0;
             }
              // На средних экранах тоже не нужен
             if(isMediumScreen) {
                  return 0;
             }
             // На маленьких экранах нужен отступ, равный spacing
             return spacingOffset;
        } else {
             // Без центрирования
             if (isLargeScreen) {
                 // Рассчитываем отступ, чтобы контент был по центру wrapper'а
                 const wrapperWidth = maxWrapperSize - spacingOffset * 2; // Предполагаем 2 отступа по краям wrapper'а
                 const padding = (viewportWidth - wrapperWidth) * 0.5;
                 return Math.max(padding, spacingOffset); // Отступ не меньше spacing
             } else {
                 // На маленьких экранах отступ равен spacing
                 return spacingOffset;
             }
        }
    };

    /** Вычисляет отступ после последнего слайда */
    const _getSlidesOffsetAfter = () => {
        const beforeOffset = _getSlidesOffset();

        if (centeredSlides || !swiperInitialized || !swiper || isScrubActive) {
            // Для центрированных или scrub слайдов отступ такой же, как и до
            return beforeOffset;
        }

        // Компенсация, если слайды не заполняют всю ширину
        const slides = swiper.slides || [];
        const spacing = _getSlideSpacing();
        const slideCount = slides.length;

        let totalSlideWidth = 0;
        slides.forEach(slide => totalSlideWidth += slide?.offsetWidth || 0);

        const containerWidth = swiper.width; // Ширина контейнера Swiper
        const totalSpacing = spacing * (slideCount > 0 ? slideCount - 1 : 0); // Общее пространство между слайдами
        const contentWidth = beforeOffset + totalSlideWidth + totalSpacing; // Общая ширина контента

        // Если контент короче контейнера, увеличиваем отступ после
        if (contentWidth < containerWidth) {
            const remainingSpace = containerWidth - contentWidth;
            return beforeOffset + remainingSpace; // Добавляем оставшееся пространство
        }

        return beforeOffset; // Стандартный отступ
    };

    /** Проверяет границы Swiper и обновляет видимость кнопок навигации */
    const _checkBounds = () => {
        if (!swiper || swiper.destroyed || !swiperInitialized || !isSwiperNavigation || isScrubActive) return;
        // Swiper сам управляет классами isBeginning/isEnd и hiddenClass для кнопок
        // Эта функция может быть нужна для дополнительной логики, если потребуется
        // console.log('Checking bounds:', swiper.isBeginning, swiper.isEnd);
    };

    /** Настраивает обработчики кликов для кастомных кнопок навигации (если не используется стандартная опция Swiper) */
     const _setupNavigationClickHandlers = () => {
        isSwiperNavigation = true; // Устанавливаем флаг
         // Swiper >= 6 сам вешает обработчики через опцию navigation,
         // этот метод может быть нужен для очень старых версий или кастомной логики.
     };

    /** Обработчик инициализации Swiper */
    const _onSwiperInit = (sw) => {
        swiperInitialized = true;
        // Обновляем ScrollTrigger, если он есть и активен
        if (isScrubActive && gsapAnimation?.scrollTrigger) {
             // ScrollTrigger.refresh(); // Не нужно здесь, делается в onRefreshInit
        }
    };

    /** Обработчик установки transition (скорости) - НЕ используется с virtualTranslate: false */
    // const _onSetTransition = (speed) => { ... };

    /** Обработчик прогресса Swiper (для анимации непрозрачности слайдов) */
    const _onSwiperProgress = (sw, progress) => {
         if (!swiperInitialized || !swiper || sw.destroyed) return;

         const slides = sw.slides;
         if (!slides || slides.length === 0) return;

         slides.forEach(slide => {
             if (!slide) return;
             const slideProgress = utils.math.clamp(slide.progress ?? 0, -1.5, 1.5);
             const absProgress = Math.abs(slideProgress);
             const opacity = utils.math.interpolateRange(absProgress, 0, 1.5, 1, 0.3);
             slide.style.opacity = opacity.toFixed(2);

             if (opacity < 0.6) {
                 utils.dom.addClass(slide, 'no-interaction');
             } else {
                 utils.dom.removeClass(slide, 'no-interaction');
             }
         });
     };


    /** Обработчик начала касания (для сброса transition, если нужно) */
    const _onTouchStart = (sw, event) => {
        if (!swiperInitialized || !swiper || sw.destroyed || isScrubActive) return;
        // Сброс transition, если используется customTransition: true
        // if (swiper.params.customTransition) { ... }
    };

    /** Обновляет все связанные элементы: Swiper, текст перед, контейнер навигации */
    const _update = () => {
        _updateSwiperLayout();
        _updateTextBeforeWrapper();
        _updateSwiperNavigationContainer();
    };


    /** Обновляет параметры Swiper и вызывает update() */
    const _updateSwiperLayout = () => {
        if (!swiperInitialized || !swiper || swiper.destroyed) return;

        // Переоценка `centeredSlides` в зависимости от ширины экрана
        const isSmallScreen = window.innerWidth < DOM.mdBreakpoint;
        centeredSlides = isSmallScreen ? false : options.centeredSlides;

        // Обновляем кэш отступа
        DOM.cachedSlideSpacing = null; // Сбрасываем кэш
        const newSpacing = _getSlideSpacing(); // Получаем актуальный

        // Обновляем параметры Swiper
        swiper.params.centeredSlides = centeredSlides;
        swiper.params.slidesOffsetBefore = _getSlidesOffset();
        swiper.params.slidesOffsetAfter = _getSlidesOffsetAfter();
        swiper.params.spaceBetween = newSpacing;

        swiper.update();
        swiper.pagination?.update?.(); // Обновляем пагинацию, если есть

        // Пересчитываем прогресс и эффекты
         _onSwiperProgress(swiper, swiper.progress);
         if (!isScrubActive) {
             _checkBounds(); // Проверяем кнопки навигации
         }
    };


    /** Обновляет позиционирование блока текста перед каруселью */
    const _updateTextBeforeWrapper = () => {
        const { textBefore, mediaContainerRef } = DOM;
        if (!swiper || swiper.destroyed || !textBefore || !mediaContainerRef) return;

        requestAnimationFrame(() => {
             if (!swiper || swiper.destroyed || !textBefore || !mediaContainerRef) return; // Доп. проверка внутри RAF

             const bodyWidth = document.body.clientWidth;
             const maxWrapperSize = DOM.maxWrapperSize || bodyWidth;
             const isLargeScreen = bodyWidth >= maxWrapperSize;
             const slideWidth = mediaContainerRef.offsetWidth;
             if (!slideWidth) return;

             const swiperOffsetLeft = swiper.params.slidesOffsetBefore || 0;
             let marginLeft = 0;
             let beforeWidth = 0;

             if (DOM.el.classList.contains('full-bg-color')) {
                  const wrapperPadding = (bodyWidth - Math.min(bodyWidth, maxWrapperSize)) * 0.5;
                  marginLeft = wrapperPadding + swiperOffsetLeft;
                  beforeWidth = bodyWidth - marginLeft - wrapperPadding;
             } else {
                  marginLeft = swiperOffsetLeft;
                  const wrapperWidth = DOM.wrapper?.offsetWidth || bodyWidth;
                  beforeWidth = wrapperWidth - marginLeft;
             }

             textBefore.style.cssText = `--swiper-text-before-width: ${Math.max(0, beforeWidth)}px; --swiper-text-before-margin-left: ${marginLeft}px;`;
         });
    };

    /** Обновляет высоту контейнера навигации, чтобы соответствовать высоте медиа */
    let lastNavigationHeight = -1; // Кэшируем последнее значение
    const _updateSwiperNavigationContainer = () => {
        const { swiperNavigationContainer, mediaContainerRef } = DOM;
        if (!swiper || swiper.destroyed || !swiperNavigationContainer || !mediaContainerRef) return;

         requestAnimationFrame(() => {
            if (!swiper || swiper.destroyed || !swiperNavigationContainer || !mediaContainerRef) return; // Доп. проверка внутри RAF
             const height = mediaContainerRef.offsetHeight;
             if (height && height !== lastNavigationHeight) {
                 swiperNavigationContainer.style.setProperty('--swiper-navigation-height', `${height}px`);
                 lastNavigationHeight = height;
             }
         });
    };

    /** Инициализация GSAP ScrollTrigger для scrub-режима */
    const _initializeGsapAnimation = () => {
        if (!isScrubActive || gsapAnimation || !DOM.trigger || !DOM.pin) return;

        const slowDownFactor = 0.5;
        const getLVH = () => utils.css.getLVH();

        const getScrollDistance = () => {
             if (!swiper || swiper.destroyed || !swiper.slides.length) return window.innerHeight;
             const slidesWidth = swiper.size;
             const slidesHeight = swiper.slides.length * getLVH() * slowDownFactor;
             return Math.max(slidesWidth, slidesHeight, window.innerHeight);
         };

        gsapAnimation = gsap.to(swiper, {
            progress: 1,
            ease: 'none',
            scrollTrigger: {
                id: `pin-${options.selector?.replace(/[^a-zA-Z0-9]/g, '-') || 'swiper'}`, // Более безопасный ID
                trigger: DOM.trigger,
                pin: DOM.pin,
                pinSpacing: true,
                scrub: 0.2,
                invalidateOnRefresh: true,
                start: () => `top center`,
                end: () => `+=${getScrollDistance()}px`,
                onUpdate: (self) => _updateSwiperStateByProgress(self.progress),
                onRefreshInit: () => {
                    if (swiper && !swiper.destroyed) {
                         _update();
                    }
                },
                onRefresh: (self) => {
                    if (swiper && !swiper.destroyed) {
                         _updateSwiperStateByProgress(self.progress);
                         _update();
                    }
                }
            }
        });
    };

    /** Обновляет состояние Swiper (translate) на основе прогресса ScrollTrigger */
    const _updateSwiperStateByProgress = (progress) => {
         if (!swiper || swiper.destroyed) return;

         const clampedProgress = utils.math.clamp(isNaN(progress) ? 0 : progress, 0, 1);
         const directionAdjustedProgress = options.scrubDir === -1 ? 1 - clampedProgress : clampedProgress;

         if (!swiper.params.virtualTranslate) {
             swiper.setProgress(directionAdjustedProgress, 0);
         } else {
             const min = swiper.minTranslate();
             const max = swiper.maxTranslate();
             const translate = (max - min) * directionAdjustedProgress + min;
             swiper.setTranslate(translate);
             swiper.updateProgress(translate);
         }

         swiper.updateActiveIndex();
         swiper.updateSlidesClasses();
         _onSwiperProgress(swiper, swiper.progress);
     };

    /** Сброс состояния и ссылок перед инициализацией */
    const _reset = () => {
        if (swiper && !swiper.destroyed) {
            swiper.destroy(true, true);
        }
        if (gsapAnimation) {
            gsapAnimation.scrollTrigger?.kill();
            gsapAnimation = null;
        }
        DOM = {};
        swiper = null;
        swiperInitialized = false;
        gsapAnimation = null;
        isScrubActive = false;
        isSwiperNavigation = false;
        centeredSlides = true;
        currentActiveSlideIndex = 0;
        lastNavigationHeight = -1;
        options = { ...defaultOptions };
    };

    /** Применяет lazy loading к изображениям, если карусель вне видимой области */
     const _maybeLazyLoadImages = () => {
         const swiperEl = DOM.swiper;
         if (!swiperEl || typeof IntersectionObserver === 'undefined') return;

         const images = swiperEl.querySelectorAll('img[loading="lazy"], img:not([loading])');
         if (images.length === 0) return;

         const observer = new IntersectionObserver((entries, obs) => {
             entries.forEach(entry => {
                 if (entry.isIntersecting) {
                     const img = entry.target;
                     // ... (код для data-src и data-srcset) ... // Оставлю его без изменений
                      if (img.dataset.src) {
                         img.src = img.dataset.src;
                         img.removeAttribute('data-src');
                     }
                     if (img.dataset.srcset) {
                          const picture = img.closest('picture');
                          if (picture) {
                              const sources = picture.querySelectorAll('source[data-srcset]');
                              sources.forEach(source => {
                                   if (source.dataset.srcset) {
                                       source.srcset = source.dataset.srcset;
                                       source.removeAttribute('data-srcset');
                                   }
                              });
                          }
                         img.srcset = img.dataset.srcset;
                         img.removeAttribute('data-srcset');
                     }
                     img.removeAttribute('loading');
                     obs.unobserve(img);
                 }
             });
         }, { rootMargin: '200px 0px 200px 0px' });

         images.forEach(img => observer.observe(img));
     };

    /** Публичный метод инициализации */
    const initialize = (opts = {}) => {
        _reset();
        options = { ...defaultOptions, ...opts };

        const el = utils.dom.resolveElement(options.selector);
        if (!el) {
            console.warn(`[gsapSwiper] Селектор не найден: ${options.selector}`);
            return;
        }

        const swiperEl = el.querySelector('.swiper-container');
        const wrapperEl = el.querySelector('.swiper-wrapper');
        const spacingEl = el.querySelector('.swiper-column-gap');

        if (!swiperEl || !wrapperEl) {
            console.warn(`[gsapSwiper] Не найден .swiper-container или .swiper-wrapper в ${options.selector}`);
            return;
        }

        DOM.el = el;
        DOM.wrapper = el.querySelector('.wrapper');
        DOM.mediaContainerRef = el.querySelector('.media-container');
        DOM.textBefore = el.querySelector('.text-before');
        DOM.swiper = swiperEl;
        DOM.swiperSpacing = spacingEl;
        DOM.swiperWrapper = wrapperEl;
        DOM.cachedSlideSpacing = null;

        DOM.maxWrapperSize = utils.css.getCssVarValue(el, '--max-wrapper-size', true) || window.innerWidth;
        DOM.mdBreakpoint = utils.css.getCssVarValue(el, '--md-breakpoint', true) || 820;

        centeredSlides = options.centeredSlides;
        isScrubActive = (!utils.device.isTouch() && options.isScrubActive) || (utils.device.isTouch() && options.isScrubOnTouchActive);

        if (isScrubActive) {
            el.dataset.scrub = 'true';
            DOM.pin = swiperEl;
            DOM.trigger = el;
             if (!DOM.trigger || !DOM.pin) {
                 console.warn(`[gsapSwiper] Не найден trigger или pin элемент для scrub в ${options.selector}`);
                 isScrubActive = false;
             } else {
                 _initializeGsapAnimation();
             }
        } else {
            DOM.swiperPagination = el.querySelector('.swiper-pagination');
            DOM.swiperNavigationContainer = el.querySelector('.swiper-navigation-container');
            DOM.swiperNext = el.querySelector('.swiper-next');
            DOM.swiperPrev = el.querySelector('.swiper-prev');
        }

        _maybeLazyLoadImages();
        _initializeSwiper(swiperEl);
    };

    // Возвращаем публичные методы
    return {
        initialize,
        update: () => {
             if (swiperInitialized && swiper && !swiper.destroyed) {
                 _update();
             }
         },
        isScrubbing: () => isScrubActive,
        getInstance: () => swiper
    };
}; // <--- Конец функции createGsapSwiper


// --- Инициализация каруселей после загрузки DOM ---
document.addEventListener('DOMContentLoaded', () => {

    // Добавляем класс 'is-touch' для CSS стилей, если utils.js загрузился
    if (window.utils && utils.device.isTouch()) {
        utils.device.isTouch(document.body); // Вызываем функцию для добавления классов is-touch/is-desktop
    } else if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('is-touch'); // Запасной вариант добавления класса
        document.body.classList.remove('is-desktop');
    } else {
         document.body.classList.add('is-desktop');
         document.body.classList.remove('is-touch');
    }


    const carousels = []; // Массив для хранения инстансов каруселей

    // Инициализация первой карусели (Scrub)
    const gsapSwiperTest1 = createGsapSwiper();
    gsapSwiperTest1.initialize({
        selector: '#gsap_swiper_01',
        isScrubActive: true,
        isScrubOnTouchActive: true, // Включить scrub и на тач-устройствах (если нужно)
        centeredSlides: true
    });
    carousels.push(gsapSwiperTest1);

    // Инициализация второй карусели (Free Swipe + Nav/Pag)
    const gsapSwiperTest2 = createGsapSwiper();
    gsapSwiperTest2.initialize({
        selector: '#gsap_swiper_02',
        isScrubActive: false,
        centeredSlides: false // Можно сделать true для центрирования на больших экранах
    });
    carousels.push(gsapSwiperTest2);

    // Инициализация третьей карусели (Scrub, Reverse)
    const gsapSwiperTest3 = createGsapSwiper();
    gsapSwiperTest3.initialize({
        selector: '#gsap_swiper_03',
        isScrubActive: true,
        isScrubOnTouchActive: true, // Включить scrub и на тач-устройствах (если нужно)
        scrubDir: -1,
        centeredSlides: true
    });
    carousels.push(gsapSwiperTest3);

    // --- Глобальное обновление и обработчики событий ---

    let resizeTimeout;
    const globalRefresh = () => {
        carousels.forEach(instance => {
            if (instance && !instance.isScrubbing()) {
                 instance.update();
            }
        });
        ScrollTrigger.refresh();
    };

    const onResize = () => {
         clearTimeout(resizeTimeout);
         resizeTimeout = setTimeout(() => {
             if (window.utils && utils.system && utils.system.nextTick) {
                 utils.system.nextTick(globalRefresh);
             } else {
                 requestAnimationFrame(globalRefresh);
             }
         }, 250);
     };

    window.addEventListener('resize', onResize);

     if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
         window.addEventListener('orientationchange', () => {
             setTimeout(onResize, 300);
         });
     }


    // --- Скрытие блокировщика ---
    const hideBlocker = () => {
        const blocker = document.getElementById('app_blocker');
        if (!blocker) return;

        blocker.classList.add('hide');

        const cleanup = () => {
            blocker.removeEventListener('transitionend', cleanup);
            if (blocker.parentNode) {
                blocker.parentNode.removeChild(blocker);
            }
        };
        blocker.addEventListener('transitionend', cleanup);
        setTimeout(() => {
            if (blocker.parentNode) {
                 blocker.parentNode.removeChild(blocker);
            }
        }, 500);
    };

    // --- Финальные действия после инициализации ---
    // Проверяем, что utils доступен перед вызовом nextTick
    if (window.utils && utils.system && utils.system.nextTick) {
        utils.system.nextTick(() => {
            globalRefresh();
            hideBlocker();
        }, null, 300);
    } else {
        // Запасной вариант, если utils не загрузился
        setTimeout(() => {
            globalRefresh();
            hideBlocker();
        }, 300);
    }


}); // Конец DOMContentLoaded