gsap.registerPlugin(ScrollTrigger);

const pageContainer = document.querySelector(".container");

/* SMOOTH SCROLL */
const scroller = new LocomotiveScroll({
  el: pageContainer,
  smooth: true
});

scroller.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy(pageContainer, {
  scrollTop(value) {
    return arguments.length
      ? scroller.scrollTo(value, 0, 0)
      : scroller.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };
  },
  pinType: pageContainer.style.transform ? "transform" : "fixed"
});

////////////////////////////////////
////////////////////////////////////
window.addEventListener("load", function () {
  let pinBoxes = document.querySelectorAll(".pin-wrap > *");
  let pinWrap = document.querySelector(".pin-wrap");
  let pinWrapWidth = pinWrap.offsetWidth;
  let horizontalScrollLength = pinWrapWidth - window.innerWidth;

  // Pinning and horizontal scrolling
  gsap.to(".pin-wrap", {
    scrollTrigger: {
      scroller: pageContainer, //locomotive-scroll
      scrub: true,
      trigger: "#sectionPin",
      pin: true,
      // anticipatePin: 1,
      start: "top top",
      end: pinWrapWidth
    },
    x: -horizontalScrollLength,
    ease: "none"
  });

  // Change background color on scroll
  document.querySelectorAll("section").forEach(section => {
    const bgColor = section.getAttribute("data-bgcolor");
    const textColor = section.getAttribute("data-textcolor");
    
    if (bgColor && textColor) {
      ScrollTrigger.create({
        trigger: section,
        scroller: pageContainer,
        start: "top 50%",
        scrub: true,
        onEnter: () => gsap.to("body", {
          backgroundColor: bgColor,
          color: textColor,
          overwrite: "auto"
        }),
        onLeaveBack: () => {
          if (section.previousElementSibling) {
            const prevBg = section.previousElementSibling.getAttribute("data-bgcolor");
            const prevText = section.previousElementSibling.getAttribute("data-textcolor");
            if (prevBg && prevText) {
              gsap.to("body", {
                backgroundColor: prevBg,
                color: prevText,
                overwrite: "auto"
              });
            }
          }
        }
      });
    }
  });

  ScrollTrigger.addEventListener("refresh", () => scroller.update()); //locomotive-scroll

  ScrollTrigger.refresh();
});
