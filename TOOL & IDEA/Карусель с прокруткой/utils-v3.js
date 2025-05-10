const utils = (() => {

    const system = (() => {
        let timeStamp = Date.now();
        const ticks = new Map();

        /**
         * Generates a unique ID (incremental from timestamp).
         * @returns {number}
         */
        const getUID = () => timeStamp++;

        /**
         * Runs a function after the next available frame with optional delay.
         * @param {Function} callback - The function to execute.
         * @param {Object} [scope] - The scope in which to call the function.
         * @param {number} [delay=60] - Delay in milliseconds before executing.
         * @returns {Object} - A reference handle to clear the interval.
         */
        const nextTick = (callback, scope, delay = 60) => {
            const start = performance.now();
            const handle = { uid: Symbol('tick') };

            const loop = () => {
                const current = performance.now();
                if (current - start >= delay) {
                    ticks.delete(handle.uid);
                    callback?.call(scope);
                } else {
                    handle.value = requestAnimationFrame(loop);
                }
            };

            handle.value = requestAnimationFrame(loop);
            ticks.set(handle.uid, handle);
            return handle;
        };

        /**
         * Cancels a scheduled nextTick execution.
         * @param {Object} handle - The reference handle returned by nextTick.
         */
        const clearInterval = (handle) => {
            if (!handle) return;
            cancelAnimationFrame(handle.value);
            ticks.delete(handle.uid);
        };

        /**
         * Cancels all pending nextTick executions.
         */
        const clearAllTicks = () => {
            for (const handle of ticks.values()) {
                cancelAnimationFrame(handle.value);
            }
            ticks.clear();
        };

        return {
            getUID,
            nextTick,
            clearInterval,
            clearAllTicks
        };
    })();

    const math = (() => {
        /**
         * Clamps a number between a minimum and maximum value.
         * @param {number} value - The input value.
         * @param {number} min - Minimum limit.
         * @param {number} max - Maximum limit.
         * @returns {number}
         */
        const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

        /**
         * Interpolates a value from one range into another.
         * @param {number} value - The input value.
         * @param {number} inMin - Input range start.
         * @param {number} inMax - Input range end.
         * @param {number} outMin - Output range start.
         * @param {number} outMax - Output range end.
         * @returns {number}
         */
        const interpolateRange = (value, inMin, inMax, outMin, outMax) => value === inMin ? outMin : ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

        return {
            clamp,
            interpolateRange
        };
    })();

    const dom = (() => {
        /**
         * Checks if an element has a given class.
         * @param {Element} el - The target DOM element.
         * @param {string} className - The class name to check.
         * @returns {boolean}
         */
        const hasClass = (el, className) => el && el.classList ? el.classList.contains(className) : false;

        /**
         * Adds a class to a DOM element if not already present.
         * @param {Element} el - The target DOM element.
         * @param {string} className - The class name to add.
         */

        const addClass = (el, className) => {
            if (el && el.classList && typeof className === 'string') {
                el.classList.add(className);
            }
        };

        /**
         * Removes a class from a DOM element if present.
         * @param {Element} el - The target DOM element.
         * @param {string} className - The class name to remove.
         */
        const removeClass = (el, className) => {
            if (el && el.classList && typeof className === 'string') {
                el.classList.remove(className);
            }
        };

        /**
         * Resolves an element from a string selector or returns it if it's already an HTMLElement.
         * @param {string|HTMLElement} el - The element reference (selector or HTMLElement).
         * @returns {HTMLElement|null} - The resolved element or null if not found.
         */
        const resolveElement = (el) => {
            if (typeof el === 'string') {
                return document.querySelector(el);
            }
            return el instanceof HTMLElement ? el : null;
        };

        return {
            hasClass,
            addClass,
            removeClass,
            resolveElement
        };
    })();

    const css = (() => {
        /**
         * Reads the value of a CSS custom property (--variable) from an element.
         * @param {HTMLElement} el - The target element
         * @param {string} varName - The CSS variable name (e.g., "--custom-size")
         * @param {boolean} parseAsNumber - If true, converts to a number (supports px, rem, %, vw, etc.)
         * @returns {string|number} - Raw string or computed numeric value
         */
        const getCssVarValue = (el, varName, parseAsNumber = false) => {
            const computed = getComputedStyle(el);
            const value = computed.getPropertyValue(varName)?.trim();
            if (!value) return parseAsNumber ? NaN : "";

            if (!parseAsNumber) return value;

            const [, num, unit = "px"] = value.match(/^([\d.]+)([a-z%]+)?$/i) || [];
            if (!num) return NaN;

            const numericValue = parseFloat(num);
            const lowerUnit = unit.toLowerCase();

            switch (lowerUnit) {
                case "em":
                    return numericValue * parseFloat(computed.fontSize);
                case "rem":
                    return numericValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
                case "%": {
                    const parent = el.parentElement;
                    return parent ? (numericValue / 100) * parent.offsetWidth : NaN;
                }
                case "vw":
                    return (numericValue / 100) * window.innerWidth;
                case "vh":
                    return (numericValue / 100) * window.innerHeight;
                case "vmin":
                    return (numericValue / 100) * Math.min(window.innerWidth, window.innerHeight);
                case "vmax":
                    return (numericValue / 100) * Math.max(window.innerWidth, window.innerHeight);
                default:
                    return numericValue;
            }
        };

        /**
         * Returns the visual viewport height in pixels.
         * On touch devices, uses a hidden fixed element with `100lvh` for accurate measurement (especially iOS).
         * @returns {number}
         */
        const getLVH = (() => {
            let fixedEl = null;
            const style = `position: fixed;left: 0;top: 0;bottom: 0;width: 1px;height: 100lvh;visibility: hidden;pointer-events: none;z-index: -1;`;
            const createFixedElement = () => {
                if (!fixedEl) {
                    fixedEl = document.createElement('div');
                    fixedEl.style.cssText = style;
                    document.body.appendChild(fixedEl);
                }
            };

            return () => device.isTouch() ? (createFixedElement(), fixedEl.offsetHeight) : window.innerHeight;
        })();

        return {
            getCssVarValue,
            getLVH
        };
    })();

    const device = (() => {
        let cachedResult;

        /**
         * Detects if the device is touch-enabled. Adds utility classes on a target element.
         * Caches result for performance.
         * @param {HTMLElement} [targetElement=document.body]
         * @returns {boolean}
         */
        const isTouch = (targetElement = document.body) => {
            if (cachedResult !== undefined) return cachedResult;

            const supportsTouch = (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                navigator.msMaxTouchPoints > 0
            );

            const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
            const legacyOrientation = 'orientation' in window;
            const userAgentMatch = /\b(BlackBerry|webOS|iPhone|IEMobile|Android|Windows Phone|iPad|iPod)\b/i.test(navigator.userAgent);

            cachedResult = supportsTouch && hasCoarsePointer || userAgentMatch || legacyOrientation;

            if (targetElement) {
                targetElement.classList.toggle('is-touch', cachedResult);
                targetElement.classList.toggle('is-desktop', !cachedResult);
            }

            return cachedResult;
        };

        return { isTouch };
    })();

    const scroll = (() => {
        /**
         * Converts a ScrollTrigger's progress to an absolute window scroll position.
         * 
         * @param {gsap.core.Tween} tween - GSAP tween with ScrollTrigger.
         * @param {number} [progress=0] - Normalized progress (0вЂ“1).
         * @returns {number}
         */
        const scrollTriggerToWindowScrollPosition = (tween, progress = 0) => {
            if (typeof gsap === 'undefined') {
                console.warn('GSAP is not available');
                return 0;
            }

            const st = tween.scrollTrigger;
            if (!st) {
                console.warn('No ScrollTrigger found on tween');
                return 0;
            }

            const clamped = gsap.utils.clamp(0, 1, progress);
            const { start, end, vars } = st;

            if (vars?.containerAnimation) {
                const containerST = vars.containerAnimation.scrollTrigger;
                if (!containerST) return 0;

                const t = start + (end - start) * clamped;
                const { start: cs, end: ce } = containerST;
                return cs + (ce - cs) * (t / vars.containerAnimation.duration());
            }

            return start + (end - start) * clamped;
        };

        return {
            scrollTriggerToWindowScrollPosition
        };
    })();

    const html = (() => {
        // HTML escape character map
        const charMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        const escapeText = (str) =>
            str.replace(/[&<>"']/g, char => charMap[char]);

        /**
         * Sanitizes a DOM Node and returns escaped HTML string.
         * @param {Node} node
         * @returns {string}
         */
        const sanitizeNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return escapeText(node.nodeValue);
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const attrs = Array.from(node.attributes)
                    .map(attr => `${attr.name}="${escapeText(attr.value)}"`)
                    .join(' ');

                const openTag = `<${tagName}${attrs ? ' ' + attrs : ''}>`;
                const closeTag = `</${tagName}>`;

                const content = Array.from(node.childNodes).map(sanitizeNode).join('');
                return `${openTag}${content}${closeTag}`;
            }

            return '';
        };

        /**
         * Escapes HTML string by sanitizing the DOM structure.
         * @param {string} unsafe_ - Untrusted HTML
         * @returns {string}
         */
        const escapeHtml = (unsafe_) => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = unsafe_;
            return Array.from(tempDiv.childNodes).map(sanitizeNode).join('');
        };

        return {
            escapeHtml
        };
    })();

    const url = (() => {
        /**
         * Checks if a given URL matches the current page or is from a trusted host.
         * 
         * @param {string} url_ - The URL to evaluate.
         * @param {Array<string>} hostDomains - List of trusted hostnames.
         * @returns {boolean} - `true` if it's the same page or a trusted host.
         */
        const isSamePage = (url_, hostDomains = []) => {
            try {
                const parsedUrl = new URL(url_, window.location.href);
                const { hostname, pathname } = parsedUrl;
                const current = window.location;

                return (
                    (hostname === current.hostname && pathname === current.pathname) ||
                    hostDomains.includes(hostname)
                );
            } catch {
                console.warn("[utils.url] Invalid URL:", url_);
                return false;
            }
        };

        /**
         * Returns a configuration object with appropriate `target` and `rel` attributes.
         * 
         * @param {string} url_ - The URL to configure.
         * @param {Array<string>} hostDomains - List of trusted hostnames.
         * @returns {Object} - Contains `href`, `target`, and `rel` values.
         */
        const configureUrl = (url_, hostDomains = []) => {
            const isSame = isSamePage(url_, hostDomains);
            return {
                href: url_,
                target: isSame ? (window.top !== window.self ? '_top' : '_self') : '_blank',
                rel: isSame ? undefined : 'noopener noreferrer'
            };
        };

        /**
         * Validates and upgrades anchor tags in-place.
         * 
         * @param {HTMLCollection|NodeList} links 
         * @param {Array<string>} hostDomains 
         * @param {Array<string>} skipClasses 
         * @param {Array<string>} skipAttributes 
         */
        const validateLinks = (links, hostDomains = [], skipClasses = [], skipAttributes = []) => {
            const skipAttrSet = new Set(skipAttributes);

            for (let link of links) {
                if (
                    skipClasses.some(cls => link.classList.contains(cls)) ||
                    skipAttrSet.has('target') && link.hasAttribute('target') ||
                    skipAttrSet.has('rel') && link.hasAttribute('rel')
                ) continue;

                let href = link.getAttribute('href') || link.getAttribute('data-src');
                if (!href || href.startsWith('#')) continue;

                // Sanitize link content (optional step вЂ” depends on trust level)
                link.innerHTML = html.escapeHtml(link.innerHTML);

                const config = configureUrl(href, hostDomains);
                if (link.getAttribute('href') !== config.href) link.setAttribute('href', config.href);

                if (config.target === '_self') {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = config.href;
                    });
                } else {
                    if (link.getAttribute('target') !== config.target) {
                        link.setAttribute('target', config.target);
                    }

                    if (config.rel) {
                        if (link.getAttribute('rel') !== config.rel) {
                            link.setAttribute('rel', config.rel);
                        }
                    } else {
                        link.removeAttribute('rel');
                    }
                }
            }
        };

        return {
            isSamePage,
            configureUrl,
            validateLinks
        };
    })();

    return {
        system, // timings, UID
        math, // clamp, interpolate
        dom, // classes, resolver
        css, // variables, viewport
        device, // touch check
        scroll, // GSAP positioning
        html, // sanitization, escaping
        url // link validation
    };
})();
//# sourceMappingURL=utils-v3.js.map