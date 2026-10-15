# Page topology (top → bottom)

| # | Section | Type | Interaction model |
|---|---------|------|-------------------|
| 0 | `.preloader` | fixed overlay z 9999 | time-driven (GSAP timeline) |
| 1 | `#header` | fixed z 999 | scroll-driven (state classes) + click (mobile menu, cart) |
| 2 | `.cart-drawer` | fixed z 1000 | click |
| 3 | `.clone-transition` | fixed z 998 | click (Flip expand on cards) |
| 4 | `#intro` hero (100vh video) | flow | time (after preloader) + scroll parallax |
| 5 | `#ingredients` | flow | scroll reveal + parallax |
| 6 | divider `.container .border` | flow | static |
| 7 | `#explore` (title + 2 half grids w/ Swiper) | flow | scroll reveal + drag slider + hover |
| 8 | `#ethos` (#f5f5f5) | flow | scroll reveal + parallax + magnet |
| 9 | `#quiz` (half grid: quality + offer) | flow | scroll reveal (DrawSVG) + parallax |
| 10 | `#journal` (#222) | flow | scroll reveal + hover + click |
| 11 | `#connect` | flow | scroll reveal + parallax |
| 12 | `#footer` (parallax image + links + dark email box) | flow | scroll parallax + popups |
| 13 | `.scrollbar` | fixed z 9998 | scroll + drag |
| 14 | `.popup-service`, `.popup-credit` | fixed z 99998 | click |

Scroll container: document (Lenis smooth scroll), GSAP ticker drives `lenis.raf`.
Files: `index.html`, `css/style.css`, `js/main.js`, `assets/**`.
