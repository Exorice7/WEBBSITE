document.addEventListener("DOMContentLoaded", () => {
	// Basic elements
	const track = document.querySelector(".carousel-track");
	const cards = document.querySelectorAll(".deconstructed-card");
	const prevBtn = document.querySelector(".carousel-button.prev");
	const nextBtn = document.querySelector(".carousel-button.next");
	const dotsContainer = document.querySelector(".dots-container");
	
	// Clear and create dots
	dotsContainer.innerHTML = '';
	
	// Current slide index and card dimensions
	let currentIndex = 0;
	let cardWidth = 0;
	const cardGap = 40; // Must match the gap in CSS
	
	// Create dots for navigation
	cards.forEach((_, index) => {
		const dot = document.createElement("div");
		dot.classList.add("dot");
		if (index === 0) dot.classList.add("active");
		dot.addEventListener("click", () => {
			currentIndex = index;
			updateSlider();
		});
		dotsContainer.appendChild(dot);
	});
	
	const dots = document.querySelectorAll(".dot");
	
	// Update the slider position and state
	function updateSlider() {
		// Calculate current card width
		cardWidth = cards[0].getBoundingClientRect().width;
		
		// Calculate movement
		const offset = currentIndex * (cardWidth + cardGap);
		
		// Apply transform
		track.style.transform = `translateX(-${offset}px)`;
		
		// Update dots
		dots.forEach((dot, index) => {
			dot.classList.toggle("active", index === currentIndex);
		});
		
		// Update buttons
		prevBtn.disabled = currentIndex === 0;
		prevBtn.style.opacity = currentIndex === 0 ? 0.5 : 1;
		
		nextBtn.disabled = currentIndex === cards.length - 1;
		nextBtn.style.opacity = currentIndex === cards.length - 1 ? 0.5 : 1;
	}
	
	// Handle previous slide
	prevBtn.addEventListener("click", () => {
		if (currentIndex > 0) {
			currentIndex--;
			updateSlider();
		}
	});
	
	// Handle next slide
	nextBtn.addEventListener("click", () => {
		if (currentIndex < cards.length - 1) {
			currentIndex++;
			updateSlider();
		}
	});
	
	// Keyboard navigation
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowLeft" && currentIndex > 0) {
			currentIndex--;
			updateSlider();
		}
		if (e.key === "ArrowRight" && currentIndex < cards.length - 1) {
			currentIndex++;
			updateSlider();
		}
	});
	
	// Handle touch events
	let touchStartX = 0;
	
	track.addEventListener("touchstart", (e) => {
		touchStartX = e.touches[0].clientX;
	});
	
	track.addEventListener("touchend", (e) => {
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartX - touchEndX;
		
		// Require a minimum swipe distance
		if (Math.abs(diff) > 50) {
			if (diff > 0 && currentIndex < cards.length - 1) {
				currentIndex++;
			} else if (diff < 0 && currentIndex > 0) {
				currentIndex--;
			}
			updateSlider();
		}
	});
	
	// 3D hover effect for cards
	cards.forEach((card) => {
		card.addEventListener("mousemove", (e) => {
			const rect = card.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			const xDeg = (y - 0.5) * 8;
			const yDeg = (x - 0.5) * -8;
			card.style.transform = `perspective(1200px) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
			const layers = card.querySelectorAll(".card-layer");
			layers.forEach((layer, index) => {
				const depth = 30 * (index + 1);
				const translateZ = depth;
				const offsetX = (x - 0.5) * 10 * (index + 1);
				const offsetY = (y - 0.5) * 10 * (index + 1);
				layer.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${translateZ}px)`;
			});
			const waveSvg = card.querySelector(".wave-svg");
			if (waveSvg) {
				const moveX = (x - 0.5) * -20;
				const moveY = (y - 0.5) * -20;
				waveSvg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
				const wavePaths = waveSvg.querySelectorAll("path:not(:first-child)");
				wavePaths.forEach((path, index) => {
					const factor = 1 + index * 0.5;
					const waveX = moveX * factor * 0.5;
					const waveY = moveY * factor * 0.3;
					path.style.transform = `translate(${waveX}px, ${waveY}px)`;
				});
			}
			const bgObjects = card.querySelectorAll(".bg-object");
			bgObjects.forEach((obj, index) => {
				const factorX = (index + 1) * 10;
				const factorY = (index + 1) * 8;
				const moveX = (x - 0.5) * factorX;
				const moveY = (y - 0.5) * factorY;
				if (obj.classList.contains("square")) {
					obj.style.transform = `rotate(45deg) translate(${moveX}px, ${moveY}px)`;
				} else if (obj.classList.contains("triangle")) {
					obj.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1)`;
				} else {
					obj.style.transform = `translate(${moveX}px, ${moveY}px)`;
				}
			});
		});

		card.addEventListener("mouseleave", () => {
			card.style.transform = "";
			const layers = card.querySelectorAll(".card-layer");
			layers.forEach((layer) => {
				layer.style.transform = "";
			});
			const waveSvg = card.querySelector(".wave-svg");
			if (waveSvg) {
				waveSvg.style.transform = "";
				const wavePaths = waveSvg.querySelectorAll("path:not(:first-child)");
				wavePaths.forEach((path) => {
					path.style.transform = "";
				});
			}
			const bgObjects = card.querySelectorAll(".bg-object");
			bgObjects.forEach((obj) => {
				if (obj.classList.contains("square")) {
					obj.style.transform = "rotate(45deg) translateY(-20px)";
				} else if (obj.classList.contains("triangle")) {
					obj.style.transform = "translate(-50%, -50%) scale(0.5)";
				} else {
					obj.style.transform = "translateY(20px)";
				}
			});
		});
	});
	
	// Handle window resize
	window.addEventListener("resize", updateSlider);
	
	// Initialize slider
	updateSlider();
});
