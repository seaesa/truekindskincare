// Builds index.html from scripts/index.template.html.
//   {{name}}                           -> contents of scripts/svg/<name>.svg
//   {{card:slug|title|category|bg|img}} -> product card markup
// Usage: node scripts/build-html.mjs
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPTS, "..");

const svgCache = new Map();
async function svg(name) {
  if (!svgCache.has(name)) svgCache.set(name, (await readFile(join(SCRIPTS, "svg", `${name}.svg`), "utf8")).trim());
  return svgCache.get(name);
}

async function card(slug, title, category, bg, img) {
  return `<a href="https://truekindskincare.com/products/${slug}" class="product__card swiper-slide" aria-label="${title}" style="background-color: ${bg}">
                  <div class="product__card-head">
                    <p class="product__card-category pill-fill">${category}</p>
                    <div class="product__card-quickcart">${await svg("quickcart")}</div>
                  </div>
                  <div class="product__content">
                    <div class="media-img product__card-img"><picture><img src="assets/images/products/${img}-1.jpg" alt="${title}" draggable="false"></picture></div>
                    <div class="media-img product__card-img2"><picture><img src="assets/images/products/${img}-2.jpg" alt="${title}" draggable="false" loading="lazy"></picture></div>
                    <div class="product__card-foot">
                      <h3 class="product__card-title">${title}</h3>
                      <p class="product-price">₹899</p>
                    </div>
                  </div>
                </a>`;
}

let html = await readFile(join(SCRIPTS, "index.template.html"), "utf8");
const tokens = [...new Set(html.match(/\{\{[^}]+\}\}/g) ?? [])];
for (const token of tokens) {
  const body = token.slice(2, -2);
  const value = body.startsWith("card:") ? await card(...body.slice(5).split("|")) : await svg(body);
  html = html.split(token).join(value);
}
await writeFile(join(ROOT, "index.html"), html);
console.log(`index.html written (${tokens.length} tokens, ${html.length} bytes)`);
