// Downloads all static assets used by the TrueKind homepage clone.
// Usage: node scripts/download-assets.mjs
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://truekindskincare.com";
const PRISMIC = "https://images.prismic.io/truekind/";

const site = (p, dest) => ({ url: SITE + p, dest });
const prismic = (id, dest) => ({ url: `${PRISMIC}${id}?auto=format,compress`, dest });

const assets = [
  // fonts
  ...["EditorialNew-Regular", "EditorialNew-Italic", "EditorialNew-Lightitalic", "PPMori-Regular", "PPMori-SemiBold"]
    .flatMap((f) => [site(`/fonts/${f}.woff2`, `assets/fonts/${f}.woff2`), site(`/fonts/${f}.woff`, `assets/fonts/${f}.woff`)]),
  // videos + posters
  site("/hero.mp4", "assets/videos/hero.mp4"),
  site("/hero-m.mp4", "assets/videos/hero-m.mp4"),
  site("/hero-poster.jpg", "assets/images/hero-poster.jpg"),
  site("/hero-poster-m.jpg", "assets/images/hero-poster-m.jpg"),
  // section images (served by _ipx as webp at w_2560)
  ...["leaf.png", "empress.png", "ingredients-clip.jpg", "explore-1.jpg", "explore-2.jpg", "texture.png",
    "175A3642-3-741.jpg", "offer.jpg", "connect-1.jpg", "connect.jpg", "connect-m.jpg", "IMG_7461.jpg",
    "footer.jpg", "footer-m.jpg"].map((f) => site(`/_ipx/w_2560&f_webp&q_95/${f}`, `assets/images/${f.replace(/\.(png|jpg)$/, ".webp")}`)),
  // icons
  ...["icon-clean-beyond-reproach.svg", "icon-radical-transparency.svg", "icon-potent-multi-tasking.svg",
    "icon-conscious-responsible.svg", "icon-highest-standards.svg", "icon-real-results.svg", "icon-ellipse.svg"]
    .map((f) => site(`/${f}`, `assets/icons/${f}`)),
  site("/favicon.ico", "assets/favicon.ico"),
  site("/apple-touch-icon-180x180.png", "assets/apple-touch-icon-180x180.png"),
  // products
  ...[
    ["ZurDj7VsGrYSvh0W_1.jpg", "aha-cleanser-1"], ["ZurDkbVsGrYSvh0X_2.jpg", "aha-cleanser-2"],
    ["ZurMbbVsGrYSviXa_1.jpg", "sleeping-mask-1"], ["ZurMb7VsGrYSviXc_2.jpg", "sleeping-mask-2"],
    ["ZurL27VsGrYSviVl_1.jpg", "aha-toner-1"], ["ZurL3bVsGrYSviVo_2.jpg", "aha-toner-2"],
    ["ZurQ9LVsGrYSvimZ_1.jpg", "rosehip-oil-1"], ["ZurQ9rVsGrYSvimb_2.jpg", "rosehip-oil-2"],
    ["ZurQjbVsGrYSvik0_1.jpg", "manjistha-gel-1"], ["ZurQj7VsGrYSvik3_2.jpg", "manjistha-gel-2"],
    ["ZurNf7VsGrYSviaK_1.jpg", "acne-mask-1"], ["ZurNgbVsGrYSviaN_2.jpg", "acne-mask-2"],
    ["ZurP_7VsGrYSvijF_1.jpg", "kumkumadi-oil-1"], ["ZurQAbVsGrYSvijG_2.jpg", "kumkumadi-oil-2"],
  ].map(([id, name]) => prismic(id, `assets/images/products/${name}.jpg`)),
  // journal
  prismic("Z-Ac73dAxsiBvxdO_elegant-glass-dropper-bottles.jpg", "assets/images/journal/journal-1.jpg"),
  prismic("Z-6shXdAxsiBwSng_journal-2.jpg", "assets/images/journal/journal-2.jpg"),
  prismic("Z-6uzHdAxsiBwSpf_journal-3.jpg", "assets/images/journal/journal-3.jpg"),
];

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function download({ url, dest }) {
  const out = join(ROOT, dest);
  if (await exists(out)) return `skip ${dest}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0", accept: "image/webp,*/*" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  return `ok   ${dest}`;
}

const queue = [...assets];
let failed = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const a = queue.shift();
    try { console.log(await download(a)); } catch (e) { failed++; console.error(`FAIL ${a.dest}: ${e.message}`); }
  }
}));
console.log(`done: ${assets.length - failed}/${assets.length}`);
process.exitCode = failed ? 1 : 0;
