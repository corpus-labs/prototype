// Export the deck to PDF: 10 pages, exactly 1280x720px (13.33in x 7.5in) each.
// Usage: node scripts/export-pdf.mjs [out.pdf]
// Requires the built deck served at http://127.0.0.1:8824/
import { chromium } from "playwright";

const out = process.argv[2] ?? "../../iya-submission/corpus-ignite-deck.pdf";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:8824/", { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: out,
  width: "1280px",
  height: "720px",
  printBackground: true,
  pageRanges: "1-10",
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log("wrote", out);
