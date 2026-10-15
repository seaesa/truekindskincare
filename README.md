# TrueKind — homepage clone

A static rebuild of the https://truekindskincare.com/ homepage in HTML, CSS and JS. GSAP, Lenis and Swiper are loaded from a CDN.

## Run

The page needs a local server because the browser blocks fonts and video when it is opened as a file:

```bash
npx http-server -p 8731 -c-1
# open http://127.0.0.1:8731
```

## Structure

| Path | Contents |
|------|----------|
| `index.html` | Generated page. Do not edit by hand. |
| `css/style.css` | All styles. Sizes use rem: 1rem is 12px at 1440px wide and 14px at 375px wide. |
| `js/main.js` | Preloader, Lenis, header, reveal animations, parallax, Swiper, magnet effect, cart, popups, card transitions |
| `assets/` | Fonts, images, videos and icons downloaded from the original site |
| `scripts/index.template.html` | Source markup. `{{name}}` inserts `scripts/svg/<name>.svg`. `{{card:...}}` inserts a product card. |
| `scripts/build-html.mjs` | Builds `index.html` from the template |
| `scripts/download-assets.mjs` | Downloads the assets again |
| `docs/research/` | Behaviour notes (`BEHAVIORS.md`), page topology, extracted DOM and content |
| `docs/design-references/` | Screenshots of the original and the clone, plus side-by-side comparisons (`cmp-*.png`) |

After you edit the template or an SVG, rebuild the page:

```bash
node scripts/build-html.mjs
```

## Libraries (CDN)

- gsap 3.13.0 with ScrollTrigger, SplitText, DrawSVGPlugin and CustomEase
- lenis 1.2.3
- swiper 11.1.14

## Notes

- Only the homepage was cloned. Links to pages that were not cloned (nav, CTAs, product and journal cards, login) use `href="#"` and do nothing when clicked; they never redirect to the original site. Social, mailto/tel and credit links still work.
- The mobile menu was redesigned and no longer matches the original: numbered rows with dividers and arrows, staggered reveal, a bottom-anchored Sign Up / Login button, and Follow Us / Contact Us rows. Scrolling is locked while it is open, and Esc closes it. The menu scrolls in its own area below the header bar, so its content never slides under the logo or close button. Compact variants apply below 780px and 620px of height, and the header stays fixed while the menu is open.
- The curved arrows draw when their SVG scrolls into view. On the original site they draw at page load, because their trigger has no layout box.
