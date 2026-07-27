import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("dialog", (dialog) => dialog.accept());

await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });

const title = await page.locator("h1").textContent();
if (title?.trim() !== "Lig merkezi") throw new Error(`Beklenmeyen başlık: ${title}`);

const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (desktopOverflow) throw new Error("Masaüstünde yatay sayfa taşması var.");
await page.screenshot({ path: "/tmp/v3-dashboard-desktop.png", fullPage: true });

await page.getByRole("button", { name: "Takımlar", exact: true }).click();
await page.locator(".team-card").first().waitFor();
const initialTeamCount = await page.locator(".team-card").count();
if (initialTeamCount !== 6) throw new Error(`Örnek takım sayısı 6 değil: ${initialTeamCount}`);

await page.getByRole("button", { name: "Takım ekle", exact: true }).click();
await page.getByLabel("Takım adı *").fill("Test Veteranlar");
await page.getByLabel("Kısa ad").fill("TST");
await page.getByLabel("Takım sorumlusu").fill("Test Sorumlusu");
await page.getByRole("button", { name: "Takımı ekle", exact: true }).click();
await page.locator(".team-card").nth(6).waitFor();
if ((await page.locator(".team-card").count()) !== 7) throw new Error("Takım ekleme çalışmadı.");

await page.getByRole("button", { name: "Fikstür", exact: true }).click();
await page.getByRole("button", { name: "Fikstürü oluştur", exact: true }).click();
await page.locator(".fixture-card").first().locator("input[type=number]").nth(0).fill("4");
await page.locator(".fixture-card").first().locator("input[type=number]").nth(1).fill("2");
await page.locator(".fixture-card").first().getByRole("button", { name: "Kaydet" }).click();

await page.getByRole("button", { name: "Puan Durumu", exact: true }).click();
if ((await page.locator(".standings-table tbody tr").count()) !== 7) throw new Error("Puan tablosu takım sayısıyla eşleşmiyor.");
if ((await page.locator(".points-cell").first().textContent())?.trim() !== "3") throw new Error("Maç sonucu puan tablosuna yansımadı.");

await page.getByRole("button", { name: /^Fair Play/ }).click();
await page.getByRole("button", { name: "Kart kaydı ekle", exact: true }).click();
await page.getByLabel("Oyuncu").fill("Test Oyuncu");
await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();
await page.getByText("Test Oyuncu", { exact: true }).waitFor();

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (mobileOverflow) throw new Error("Mobilde yatay sayfa taşması var.");
await page.getByRole("button", { name: "Menüyü aç" }).click();
await page.waitForFunction(() => document.querySelector(".sidebar")?.classList.contains("sidebar--open"));
await page.getByRole("button", { name: "Genel Bakış", exact: true }).click();
await page.waitForFunction(() => !document.querySelector(".sidebar")?.classList.contains("sidebar--open"));
await page.waitForTimeout(250);
await page.screenshot({ path: "/tmp/v3-dashboard-mobile.png", fullPage: true });

if (errors.length) throw new Error(errors.join("\n"));

console.log(JSON.stringify({
  status: "ok",
  desktopScreenshot: "/tmp/v3-dashboard-desktop.png",
  mobileScreenshot: "/tmp/v3-dashboard-mobile.png",
  teams: 7,
  tested: ["navigation", "team-create", "fixture-regenerate", "score-save", "standings-auto-update", "card-create", "responsive-menu"]
}, null, 2));

await browser.close();
