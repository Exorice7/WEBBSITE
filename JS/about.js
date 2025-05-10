// WEBSITE/JS/about.js

import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('hidden');
            // Optional: Remove preloader from DOM after transition
            // setTimeout(() => {
            //     preloader.remove();
            // }, 500); // Match transition duration
        });
    }

    // --- Header Scroll Effect ---
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Burger Menu Toggle ---
    const burgerBtn = document.getElementById('burger-menu');
    const mobileNav = document.getElementById('mobile-nav');

    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', () => {
            const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true';
            burgerBtn.setAttribute('aria-expanded', !isExpanded);
            mobileNav.classList.toggle('open');
            // Optional: Change burger icon to 'X' when open
            if (mobileNav.classList.contains('open')) {
                 burgerBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
            } else {
                 burgerBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>`;
            }
        });
    }

    // --- AOS Initialization ---
    AOS.init({
        duration: 800, // Animation duration
        easing: 'ease-in-out', // Default easing
        once: true, // Whether animation should happen only once - while scrolling down
        mirror: false, // Whether elements should animate out while scrolling past them
        anchorPlacement: 'top-bottom', // Defines which position of the element regarding to window should trigger the animation
    });

    // --- Infographic Counter Animation ---
    const infographicItems = document.querySelectorAll('.infographic-item');

    const animateCounter = (element, targetValue, maxVal, duration = 1500) => {
        const valueElement = element.querySelector('.infographic-value');
        const progressCircle = element.querySelector('.infographic-circle-progress');
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * targetValue);

            valueElement.textContent = currentValue.toLocaleString('ru-RU'); // Format number

            // Animate circle
            const progressFraction = currentValue / maxVal; // Use max value for percentage
            const offset = circumference - Math.min(progressFraction, 1) * circumference; // Cap progress at 1
            progressCircle.style.strokeDashoffset = offset;


            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const value = parseInt(item.getAttribute('data-value'), 10);
                 const maxVal = parseInt(item.getAttribute('data-max'), 10);
                animateCounter(item, value, maxVal);
                observer.unobserve(item); // Stop observing once animated
            }
        });
    };

    const infographicObserver = new IntersectionObserver(observerCallback, observerOptions);

    infographicItems.forEach(item => {
        infographicObserver.observe(item);
         // Initialize circle offset
        const progressCircle = item.querySelector('.infographic-circle-progress');
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference; // Start empty
    });


    // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Basic Three.js Particle Background ---
    const webglContainer = document.getElementById('webgl-container');
    const canvas = document.getElementById('canvas');

    if (webglContainer && canvas && typeof THREE !== 'undefined') {
        let scene, camera, renderer, particles, clock;
        let mouseX = 0, mouseY = 0;
        let windowHalfX = window.innerWidth / 2;
        let windowHalfY = window.innerHeight / 2;

        const initThree = () => {
            // Scene
            scene = new THREE.Scene();
            // scene.fog = new THREE.FogExp2(0x0a0a1a, 0.001); // Subtle fog

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
            camera.position.z = 1000;

            // Renderer
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI screens

            // Clock for animation timing
            clock = new THREE.Clock();

            // Particles
            const particleCount = 5000;
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.PointsMaterial({
                size: 2,
                vertexColors: true, // Use colors defined in geometry
                blending: THREE.AdditiveBlending,
                transparent: true,
                sizeAttenuation: true, // Particles smaller further away
                depthWrite: false // Prevents particles obscuring each other strangely
            });

             // Gradient colors
            const color1 = new THREE.Color(0x4f46e5); // --primary-color-start
            const color2 = new THREE.Color(0xa855f7); // --primary-color-end
            const color3 = new THREE.Color(0x374151); // --border-color (darker)


            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                // Position particles in a sphere-like distribution
                const radius = 1500;
                const phi = Math.acos(-1 + (2 * Math.random()));
                const theta = Math.sqrt(particleCount * Math.PI) * phi;

                positions[i3] = radius * Math.cos(theta) * Math.sin(phi) + (Math.random() - 0.5) * 500;
                positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) * 500;
                positions[i3 + 2] = radius * Math.cos(phi) + (Math.random() - 0.5) * 500;


                // Assign gradient colors based on position (e.g., y-axis)
                const yRatio = (positions[i3 + 1] + radius) / (2 * radius); // Normalize y between 0 and 1
                let mixedColor;
                if (yRatio < 0.4) {
                    mixedColor = color3.clone().lerp(color1, yRatio / 0.4);
                } else {
                    mixedColor = color1.clone().lerp(color2, (yRatio - 0.4) / 0.6);
                }

                colors[i3] = mixedColor.r;
                colors[i3 + 1] = mixedColor.g;
                colors[i3 + 2] = mixedColor.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            particles = new THREE.Points(geometry, material);
            scene.add(particles);

            // Event Listeners
            document.addEventListener('mousemove', onDocumentMouseMove, false);
            window.addEventListener('resize', onWindowResize, false);

            // Start animation loop
            animate();
        };

        const onWindowResize = () => {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
             renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        };

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.1; // Reduced sensitivity
            mouseY = (event.clientY - windowHalfY) * 0.1;
        };

        const animate = () => {
            requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Subtle particle rotation
            if (particles) {
                 particles.rotation.y = elapsedTime * 0.05;
                 particles.rotation.x = elapsedTime * 0.02;
            }

            // Camera movement based on mouse
            camera.position.x += (mouseX - camera.position.x) * 0.02;
            camera.position.y += (-mouseY - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        // Initialize Three.js only if canvas exists
        initThree();

    } else {
        console.warn("WebGL container or canvas not found, or THREE is not defined. Skipping background animation.");
    }

}); // End DOMContentLoaded
