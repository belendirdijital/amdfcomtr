import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1
});

await page.goto(pathToFileURL(resolve("build/icon.svg")).href);
await page.screenshot({
  path: resolve("build/icon.png"),
  clip: { x: 0, y: 0, width: 1024, height: 1024 },
  omitBackground: true
});

await browser.close();
console.log("build/icon.png oluşturuldu.");
