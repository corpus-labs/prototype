// Export the deck: one self-contained HTML file and a PDF with one 1280 x 720 page per slide.
// Usage: npm run export [-- <out-dir>]
// Runs after `SINGLEFILE=1 vp build`, which writes everything into dist/index.html.
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const outDir = resolve(process.argv[2] ?? "../../iya-submission");
const name = "corpus-ignite-grant-deck";
const html = resolve("dist/index.html");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(`${pathToFileURL(html).href}#all`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
// Big inlined screenshots can still be decoding at "networkidle", and Chrome prints them blank.
await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
await page.emulateMedia({ media: "print" });
await page.waitForTimeout(300);
await page.pdf({
  path: `${outDir}/${name}.pdf`,
  width: "1280px",
  height: "720px",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
copyFileSync(html, `${outDir}/${name}.html`);
console.log(`wrote ${outDir}/${name}.pdf and ${name}.html`);
