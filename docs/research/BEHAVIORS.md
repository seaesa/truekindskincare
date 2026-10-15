# TrueKind homepage — behavior bible

Source: live site (Nuxt 3 + GSAP 3.12 + ScrollTrigger + SplitText + DrawSVG + Flip + Lenis 1.2.3 + Swiper 8),
inspected with Playwright at 1440×900 and 390×844.

## Global
- `html { font-size: .833333vw }` (12px @1440) / `3.73333vw` under 768px (14px @375). Every size is in rem → whole layout scales with viewport width.
- Breakpoint: 767.98px (mobile ≤, desktop ≥ 767.99). Original reloads the page when crossing it.
- GSAP defaults: `ease: customSlow` = CustomEase `M0,0 C0.17,0.84 0.44,1 1,1`, `duration: 1.2`.
  `customExpo` CustomEase (used by Flip transitions) — path in js/main.js.
- ScrollTrigger default `start`: desktop `top bottom-=20%`, mobile `top bottom`.
- Lenis: `duration .9`, `easing t => min(1, 1.001 - 2^(-11t))`, stopped until preloader done. `html.lenis` class.
- Native scrollbar hidden; custom `.scrollbar #thumb` (fixed right, 8px, 80px tall, opacity .5 → hover .7/10px).
  Thumb y = progress × (innerHeight − thumbH − 48). Thumb is draggable (pointerdown → map clientY → lenis.scrollTo, duration 1).
- `::selection` bg #3b3b3b, color #fff.

## Preloader (time-driven, first load)
Dark #2f2f2f split panels (`.bg__left/.bg__right`, transform-origin top), Editorial New 18rem counter.
Timeline (defaults expo.inOut, 1s):
1. Digit columns roll: left [0,2,6,9] yPercent −=25, right [0,5,7,8,9] yPercent −=20, each step `expo.out .6s`, right offset `<=10%`. Last step rolls both out (−100%).
2. Logo halves `y: 0` (from ±105%) stagger .1, 1.4s at `<-=20%`; spinner fades out.
3. Center line `scaleY 1` at `<=95%`, then `opacity 0` (power1.out) at `<=50%`.
4. Logo halves out to `105% / -105%` stagger .1 at `<=10%`.
5. Panels `scaleY 0` stagger .1 at `<=30%` → onComplete: preload done → Lenis starts, hero intro plays.

## Hero (#intro)
- Video (desktop `hero.mp4`, mobile `hero-m.mp4`) starts after preloader; black overlay .2.
- H1 lines + desc lines: SplitText line reveal `yPercent 105 → 0`, stagger .15, 1.4s expo.out; desc delay .2.
- CTA pill: `scale 0, opacity 0 → 1`, 1.2s power4.out, delay .2; label `yPercent -105 → 0` at `<=25%`.
- Parallax (data-parallax-top): video `yPercent = progress × 30`, trigger top top → bottom top.
- CTA hover: arrow circle `scale 1.1` (.3s ease) + icon-clone arrow swap.

## Header
- `is--white` on load (white text/logo, white cart pill with dark icons).
- ScrollTrigger at `innerHeight − 300` px: add `.active` (bg #fff + shadow `0 0 10px 2px #b8b8b82b`), drop `is--white`. Reverse on leave-back.
- Lenis scroll > 500: direction down → `.is--hidden` (translateY −120%), up → visible. Transition .8s cubic-bezier(.18,.71,.11,1).
- Nav `.link` underline: `:before` scaleX 0→1 (origin right→left), .3s.
- Mobile: hamburger (2 lines 35×2px) → full-screen white menu slides from left (translateX −100% → 0, .8s); lines morph into X (rotate ±40°, scaleX .8). Logo center, cart right.
  - **Clone deviation (user request):** menu content redesigned: 01–04 indexed rows with 1px dividers (scaleX draw) and circle arrows, rows reveal translateY 105% → 0 staggered .07s; bottom block (login pill, Follow Us / Contact Us rows) fades up at .55s. Lenis stops while open; Esc closes.
- Cart button → cart drawer (right panel 40rem, overlay .5, .8s); close via × (rotate 180° on hover) or overlay.

## Reveal effects (scroll-driven, ScrollTrigger)
- `[data-split]` line/word reveal: `yPercent 105`, stagger .15, 1.4s expo.out (Explore title uses 120).
- `.fade`: opacity 0 → 1.
- `.text-underline-border`: `.active` added 1s after entering (`top bottom-=10%`) → underline scaleX .8s.
- `.mask-path` (curved arrows): DrawSVG from 0, duration = data-duration, `circ.out`.
- Sliders: slides from `x 120, y 50, rotate -10, opacity 0`, stagger .12, 1.8s expo.out, start `top bottom`.

## Parallax (scrubbed)
- `.parallax-scroll[data-parallax-speed=s]` (desktop only unless `data-parallax-mobile`): `y: s×22% → −s×22%`, top bottom → bottom top, ease none. Target = `.parallax-scroll-item` child if present.
- `.parallax .parallax-image`: `yPercent −20 → 30` (progress×50−20), top bottom → 200% center.
- Footer image wrapper: same −20 → 30; footer email box `y 20% → −30%`.

## Hover / click
- `.icon-clone`: svg duplicated; on hover first arrow flies out (translate 350% scaleX 2) and clone flies in (.8s).
- `.magnet` (ethos arrow, offer, journal more, instagram pill, footer submit): follows cursor ±17.5px, 1s expo.out; resets on mouseout.
- `.slider-arrow`, `.arrowlong` wrappers: scale 1.1 on hover (.3s).
- Product card: hover crossfades to 2nd image (.3s). Swiper drag (grab cursor) → slides `scale .9, rotate 3` while moving, back to 1/0 on transitionEnd. Click (desktop) → card Flip-expands to fullscreen then navigates.
- Journal card: image `scale 1.1 → 1` on hover (1s); click → image expands fullscreen then navigates.
- Footer: Disclaimer / Credits open popups (fade .3s, overlay .5, Esc/overlay/× close, Lenis paused). Subscribe button turns white with scale 1.1.

## Responsive
- Under 768px: header becomes hamburger layout; half grids stack (explore images hidden); slides 92% width, overflow visible; ethos uses mobile layout (pill + "HIDE NOTHING" 17vw + icon rows); journal title above featured card; connect side images hidden; footer email box on top.
