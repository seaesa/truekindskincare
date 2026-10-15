/* =========================================================
   TrueKind — homepage clone behaviours
   GSAP (ScrollTrigger, SplitText, DrawSVG, CustomEase) + Lenis + Swiper
   ========================================================= */
(() => {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const BREAKPOINT = 767;
  const isMobile = () => window.innerWidth <= BREAKPOINT;

  /* ---------- GSAP config (mirrors original) ---------- */
  CustomEase.create(
    "customExpo",
    "M0,0 C0.124,0.012 0.154,0.016 0.186,0.046 0.266,0.121 0.317,0.288 0.349,0.498 0.383,0.726 0.437,0.875 0.491,0.924 0.493,0.926 0.519,0.94 0.52,0.941 0.523,0.942 0.527,0.944 0.531,0.945 0.605,0.973 0.76,1 1,1"
  );
  CustomEase.create("customSlow", "M0,0 C0.17,0.84 0.44,1 1,1");
  gsap.config({ nullTargetWarn: false });
  gsap.defaults({ ease: "customSlow", duration: 1.2 });
  ScrollTrigger.defaults({ start: isMobile() ? "top bottom" : "top bottom-=20%" });
  ScrollTrigger.config({ ignoreMobileResize: true });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  document.documentElement.style.setProperty("--vhmobilebar", `${window.innerHeight * 0.01}px`);

  // The original reloads when crossing the desktop/mobile breakpoint.
  const startedMobile = isMobile();
  on(window, "resize", () => {
    if (isMobile() !== startedMobile) window.location.reload();
  });

  const yearEl = $(".js-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Preload state ---------- */
  let preloadDone = false;
  const preloadCallbacks = [];
  const whenPreloaded = (fn) => (preloadDone ? fn() : preloadCallbacks.push(fn));

  /* ---------- Smooth scroll (Lenis) ---------- */
  const lenis = new Lenis({
    duration: 0.9,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -11 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
  });
  lenis.stop();
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Custom scrollbar ---------- */
  const scrollbar = $(".scrollbar");
  const thumb = $("#thumb");
  const scrollInner = $(".scrollbar .inner");
  let draggingThumb = false;

  lenis.on("scroll", ({ progress }) => {
    ScrollTrigger.update();
    if (thumb) {
      const thumbH = thumb.getBoundingClientRect().height;
      gsap.set(thumb, { y: progress * (window.innerHeight - thumbH - 24 * 2), force3D: true });
    }
  });
  on(thumb, "pointerdown", () => (draggingThumb = true), { passive: false });
  on(window, "pointerup", () => (draggingThumb = false), { passive: false });
  on(window, "pointermove", (e) => {
    if (!draggingThumb) return;
    e.preventDefault();
    const innerH = scrollInner.getBoundingClientRect().height;
    const pad = (window.innerHeight - innerH) / 2;
    const mapped = gsap.utils.mapRange(0, window.innerHeight, -pad, innerH + pad)(e.clientY);
    const ratio = gsap.utils.clamp(0, 1, mapped / innerH);
    lenis.scrollTo(lenis.limit * ratio, { duration: 1, force: true });
  }, { passive: false });
  const toggleScrollbar = () => {
    const main = $("#main");
    if (scrollbar && main) scrollbar.classList.toggle("is--hidden", main.getBoundingClientRect().height <= window.innerHeight);
  };
  toggleScrollbar();

  // Refresh triggers when the document height changes (images, fonts…)
  let refreshTimer;
  new ResizeObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100);
  }).observe(document.body);

  /* ---------- Header ---------- */
  function initHeader() {
    const header = $("#header");
    const navbar = $(".navbar", header);
    const hamburger = $(".navbar-hamburger", header);

    const menu = $(".navbar-menu", header);
    const menuScroll = $(".navbar-menu-scroll", header);

    // The mobile menu's scroll area starts right under the header bar.
    const setHeaderHeight = () =>
      document.documentElement.style.setProperty("--header-h", `${navbar.getBoundingClientRect().height}px`);
    setHeaderHeight();
    on(window, "resize", setHeaderHeight);
    document.fonts.ready.then(setHeaderHeight);
    on(menuScroll, "scroll", () => menu.classList.toggle("is--scrolled", menuScroll.scrollTop > 0), { passive: true });

    lenis.on("scroll", (e) => {
      if (navbar.classList.contains("active")) return;
      if (e.isLocked || e.actualScroll <= 500) return;
      if (e.direction === 1) header.classList.add("is--hidden");
      else if (e.direction === -1) header.classList.remove("is--hidden");
    });

    ScrollTrigger.create({
      trigger: document.body,
      start: () => window.innerHeight - 300,
      invalidateOnRefresh: true,
      onEnter: () => {
        header.classList.add("active");
        header.classList.remove("is--white");
      },
      onLeaveBack: () => {
        header.classList.remove("active");
        header.classList.add("is--white");
      },
    });

    const toggleMenu = (force) => {
      const open = navbar.classList.toggle("active", force);
      hamburger.setAttribute("aria-expanded", String(open));
      hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      header.classList.toggle("is--menu-open", open);
      if (open) {
        header.classList.remove("is--hidden");
        menuScroll.scrollTop = 0;
        menu.classList.remove("is--scrolled");
        lenis.stop();
      } else if (preloadDone) {
        lenis.start();
      }
    };
    on(hamburger, "click", () => toggleMenu());
    on(hamburger, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggleMenu();
    });
    on(document, "keydown", (e) => e.key === "Escape" && navbar.classList.contains("active") && toggleMenu(false));
    $$(".navbar-menu a", header).forEach((a) => on(a, "click", () => toggleMenu(false)));
  }

  /* ---------- Cart drawer ---------- */
  function initCart() {
    const drawer = $(".cart-drawer");
    const open = () => {
      if ($(".navbar.active")) $(".navbar-hamburger").click();
      drawer.classList.add("active");
      lenis.stop();
    };
    const close = () => {
      drawer.classList.remove("active");
      lenis.start();
    };
    on($("#cart-nav"), "click", open);
    on($(".cart-drawer-overlay"), "click", close);
    on($(".cart-drawer__header-close"), "click", close);
    on(document, "keydown", (e) => e.key === "Escape" && drawer.classList.contains("active") && close());
  }

  /* ---------- Popups (Disclaimer / Credits) ---------- */
  function initPopups() {
    const closeAll = () => {
      $$(".popup.active").forEach((p) => p.classList.remove("active"));
      lenis.start();
    };
    $$("[data-popup]").forEach((trigger) =>
      on(trigger, "click", () => {
        const popup = $(`.popup-${trigger.dataset.popup}`);
        if (!popup) return;
        popup.classList.add("active");
        lenis.stop();
      })
    );
    $$(".popup").forEach((popup) => {
      on($(".overlay-black", popup), "click", closeAll);
      on($(".close", popup), "click", closeAll);
      $$("[data-popup-close]", popup).forEach((b) => on(b, "click", closeAll));
    });
    on(document, "keydown", (e) => e.key === "Escape" && $(".popup.active") && closeAll());
  }

  /* ---------- Icon clone (arrow swap on hover) ---------- */
  function initIconClone() {
    $$(".icon-clone").forEach((el) => {
      if (el.dataset.clone === "true") return;
      const svg = $("svg", el);
      if (!svg) return;
      el.dataset.clone = "true";
      const clone = svg.cloneNode(true);
      svg.parentNode.appendChild(clone);
      on(el, "mouseenter", () => {
        svg.classList.add("active");
        clone.classList.add("active");
      });
      on(el, "mouseleave", () => {
        svg.classList.remove("active");
        clone.classList.remove("active");
      });
    });
  }

  /* ---------- Magnet ---------- */
  function initMagnet() {
    $$(".magnet").forEach((el) => {
      on(el, "mousemove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: ((e.clientX - r.left) / el.offsetWidth - 0.5) * 35,
          y: ((e.clientY - r.top) / el.offsetHeight - 0.5) * 35,
          duration: 1,
          ease: "expo.out",
        });
      });
      on(el, "mouseout", () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "expo.out" }));
    });
  }

  /* ---------- Split text ---------- */
  // Titles are pre-split in the markup; paragraphs flagged with data-split-auto
  // are split at runtime (their line breaks depend on the viewport).
  function splitText() {
    $$("[data-split-auto]").forEach((el) => {
      const split = new SplitText(el, { type: "lines", linesClass: "line" });
      split.lines.forEach((line) => {
        const mask = document.createElement("div");
        mask.classList.add("masking-text");
        line.parentNode.insertBefore(mask, line);
        mask.appendChild(line);
      });
    });
  }

  function initLineReveal() {
    $$("[data-split]").forEach((el) => {
      const words = el.hasAttribute("split-words");
      const targets = $$(words ? ".word" : ".line", el);
      const noTrigger = el.hasAttribute("reveal-notrigger");
      const vars = {
        yPercent: Number(el.getAttribute("reveal-ypercent")) || 105,
        stagger: 0.15,
        delay: Number(el.getAttribute("reveal-delay")) || 0,
        duration: 1.4,
        ease: "expo.out",
      };
      if (!noTrigger) vars.scrollTrigger = { trigger: el };

      if (el.hasAttribute("reveal-waitpreloader")) {
        const tl = gsap.timeline({ paused: true });
        tl.from(targets, vars);
        whenPreloaded(() => tl.play());
      } else {
        gsap.from(targets, vars);
      }
    });
  }

  /* ---------- Scroll effects ---------- */
  function initFade() {
    $$(".fade").forEach((el) => gsap.from(el, { opacity: 0, scrollTrigger: { trigger: el } }));
  }

  function initUnderline() {
    $$(".text-underline-border").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom-=10%",
        onEnter: (st) => {
          gsap.delayedCall(1, () => el.classList.add("active"));
          st.kill();
        },
      });
    });
  }

  function initDrawSvg() {
    $$(".mask-path").forEach((path) => {
      // Paths inside <mask> have no layout box, so the owning <svg> is the trigger.
      gsap.timeline({ scrollTrigger: { trigger: path.closest("svg") } }).from(path, {
        drawSVG: 0,
        duration: parseInt(path.dataset.duration, 10) || 1.2,
        ease: "circ.out",
      });
    });
  }

  function initParallax() {
    // Full-bleed images inside an overflow:hidden frame
    $$(".parallax").forEach((frame) => {
      const img = $(".parallax-image", frame);
      if (!img) return;
      const fromTop = img.hasAttribute("data-parallax-top");
      gsap.set(img, { yPercent: fromTop ? 0 : -20 });
      ScrollTrigger.create({
        trigger: frame,
        start: fromTop ? "top top" : "top bottom",
        end: fromTop ? "bottom top" : "200% center",
        scrub: true,
        onUpdate: (s) => gsap.set(img, { yPercent: fromTop ? s.progress * 30 : s.progress * 50 - 20 }),
      });
    });

    // Floating elements with a per-element speed
    $$(".parallax-scroll").forEach((el) => {
      if (isMobile() && !el.hasAttribute("data-parallax-mobile")) return;
      const target = $(".parallax-scroll-item", el) || el;
      const distance = parseInt(el.dataset.parallaxSpeed, 10) * 22;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
      });
      tl.set(target, { y: `${distance}%` });
      tl.to(target, { y: `${-distance}%` });
    });
  }

  function initFooter() {
    const wrapper = $("#footer .footer__parallax .wrapper");
    const frame = $("#footer .footer__parallax");
    const email = $("#footer .footer__email");

    gsap.set(wrapper, { yPercent: -20 });
    ScrollTrigger.create({
      trigger: frame,
      start: "top bottom",
      end: "200% center",
      scrub: true,
      onUpdate: (s) => gsap.set(wrapper, { yPercent: s.progress * 50 - 20 }),
    });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: email, start: "top bottom", end: "bottom top", scrub: true, once: true, invalidateOnRefresh: true },
    });
    tl.set(email, { y: "20%" });
    tl.to(email, { y: "-30%" });

    on(email, "submit", (e) => {
      e.preventDefault();
      const input = $("input", email);
      if (input) input.value = "";
    });
  }

  /* ---------- Videos: play only while in view ---------- */
  function watchVideo(video) {
    ScrollTrigger.create({
      trigger: video,
      start: "top bottom",
      onEnter: () => video.play().catch(() => {}),
      onEnterBack: () => video.play().catch(() => {}),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });
  }

  /* ---------- Intro ---------- */
  function initIntro() {
    const tl = gsap.timeline({ paused: true, delay: 0.2, defaults: { duration: 1.2, ease: "power4.out" } });
    tl.from(".intro__cta", { scale: 0, opacity: 0 });
    tl.from(".intro__cta .text", { yPercent: -105 }, "<=25%");

    whenPreloaded(() => {
      tl.play();
      const video = $(isMobile() ? "#intro .mobile video" : "#intro .desktop video");
      if (video) {
        video.play().catch(() => {});
        watchVideo(video);
      }
    });
  }

  /* ---------- Product sliders ---------- */
  function initSliders() {
    $$(".slider").forEach((slider) => {
      const view = Number(slider.dataset.view) || 2;
      const swiper = new Swiper($(".swiper", slider), {
        slidesPerView: "auto",
        spaceBetween: 10,
        grabCursor: true,
        speed: 400,
        preventClicks: true,
        preventClicksPropagation: true,
        threshold: 10,
        breakpoints: { [BREAKPOINT]: { slidesPerView: view, spaceBetween: 15 } },
        on: {
          init(s) {
            s.on("setTranslate", (sw, translate) => {
              if (translate !== 0) gsap.to(sw.slides, { scale: 0.9, rotation: 3, duration: 0.8, ease: "expo.out" });
            });
            s.on("transitionEnd", (sw) => {
              gsap.to(sw.slides, { scale: 1, rotation: 0, duration: 1, ease: "expo.out", overwrite: true });
            });
          },
        },
      });

      gsap.timeline({ scrollTrigger: { trigger: slider, start: "top bottom" } }).from(swiper.slides, {
        x: 120,
        y: 50,
        rotate: -10,
        opacity: 0,
        stagger: 0.12,
        duration: 1.8,
        ease: "expo.out",
      });
    });
  }

  /* ---------- Card → fullscreen transition, then navigate ---------- */
  function expandToFullscreen(source, href, { background, radius, content }) {
    const layer = $(".clone-transition");
    const rect = source.getBoundingClientRect();
    layer.innerHTML = "";
    layer.style.background = "transparent";
    layer.classList.add("active");

    const box = document.createElement("div");
    box.className = "clone-box";
    Object.assign(box.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      background,
      borderRadius: radius,
    });
    if (content) box.appendChild(content);
    layer.appendChild(box);
    lenis.stop();

    if (content && content.children.length) {
      gsap.to(content.children, { opacity: 0, duration: 0.5 });
    }
    gsap.to(box, {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      borderRadius: 0,
      duration: 1.2,
      ease: "customExpo",
      onComplete: () => (window.location.href = href),
    });
  }

  const isPlainClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

  function initCardTransitions() {
    $$(".product__card").forEach((card) => {
      on(card, "click", (e) => {
        if (isMobile() || !isPlainClick(e) || e.defaultPrevented) return;
        e.preventDefault();
        if (card.classList.contains("is--event")) return;
        card.classList.add("is--event");
        const content = card.cloneNode(true);
        content.removeAttribute("href");
        content.removeAttribute("style");
        Object.assign(content.style, { width: "100%", height: "100%", background: "transparent", borderRadius: 0 });
        expandToFullscreen(card, card.href, {
          background: getComputedStyle(card).backgroundColor,
          radius: "14px",
          content,
        });
      });
    });

    $$(".article-card").forEach((card) => {
      on(card, "click", (e) => {
        if (isMobile() || !isPlainClick(e)) return;
        const img = $("img", card);
        if (!img) return;
        e.preventDefault();
        if (card.classList.contains("is--event")) return;
        card.classList.add("is--event");
        const copy = img.cloneNode(true);
        copy.style.transform = "none";
        expandToFullscreen(img, card.href, { background: "#fff", radius: "0px", content: copy });
      });
    });

    // Back/forward cache: restore the page state
    on(window, "pageshow", (e) => {
      if (!e.persisted) return;
      $(".clone-transition").classList.remove("active");
      $$(".is--event").forEach((el) => el.classList.remove("is--event"));
      lenis.start();
    });
  }

  /* ---------- Preloader ---------- */
  function runPreloader() {
    const preloader = $(".preloader");
    const finish = () => {
      if (preloader) preloader.remove();
      preloadDone = true;
      lenis.start();
      ScrollTrigger.refresh();
      preloadCallbacks.splice(0).forEach((fn) => fn());
    };
    if (!preloader) return finish();

    lenis.scrollTo(0, { duration: 0, force: true, immediate: true });

    const tl = gsap.timeline({ defaults: { ease: "expo.inOut", duration: 1 }, onComplete: finish });
    const leftCount = $$(".left .number", preloader).length;
    const rightNumbers = $$(".right .number", preloader);
    const step = { ease: "expo.out", duration: 0.6 };

    rightNumbers.forEach((_, i) => {
      if (i < rightNumbers.length - 2) tl.to(".preloader .left-inner", { yPercent: `-=${100 / leftCount}`, ...step });
      if (i < rightNumbers.length - 1) {
        tl.to(".preloader .right-inner", { yPercent: `-=${100 / rightNumbers.length}`, ...step },
          i < rightNumbers.length - 2 ? "<=10%" : null);
      }
    });
    tl.to(".preloader .left-inner", { yPercent: `-=${100 / leftCount}`, ...step });
    tl.to(".preloader .right-inner", { yPercent: `-=${100 / rightNumbers.length}`, ...step }, "<=10%");

    const logos = [".preloader .logo__left", ".preloader .logo__right"];
    tl.to(logos, {
      y: 0,
      stagger: 0.1,
      duration: 1.4,
      onStart: () => gsap.to(".preloader .loading", { opacity: 0 }),
    }, "<-=20%");
    tl.to(".preloader__inner .line", { scaleY: 1 }, "<=95%");
    tl.to(".preloader__inner .line", { opacity: 0, ease: "power1.out" }, "<=50%");
    tl.to(logos, { y: gsap.utils.wrap(["105%", "-105%"]), stagger: 0.1 }, "<=10%");
    tl.to([".preloader .bg__left", ".preloader .bg__right"], { scaleY: 0, stagger: 0.1 }, "<=30%");
  }

  /* ---------- Boot ---------- */
  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else on(window, "load", resolve, { once: true });
  });
  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  initHeader();
  initCart();
  initPopups();
  initIconClone();
  initMagnet();
  initIntro();

  document.fonts.ready.then(() => {
    splitText();
    initLineReveal();
    initFade();
    initUnderline();
    initDrawSvg();
    initParallax();
    initSliders();
    initFooter();
    initCardTransitions();
    ScrollTrigger.refresh();

    Promise.race([pageLoaded, timeout(8000)]).then(runPreloader);
  });
})();
