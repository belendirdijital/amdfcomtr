import { _electron as electron } from "playwright";

const electronEnvironment = { ...process.env };
delete electronEnvironment.ELECTRON_RUN_AS_NODE;

const launchOptions = {
  args: ["."],
  cwd: process.cwd(),
  env: electronEnvironment
};

if (process.env.V3_APP_EXECUTABLE) {
  launchOptions.executablePath = process.env.V3_APP_EXECUTABLE;
  launchOptions.args = [];
}

const application = await electron.launch(launchOptions);

const page = await application.firstWindow();
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("dialog", (dialog) => dialog.accept());

await page.waitForLoadState("domcontentloaded");
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForLoadState("domcontentloaded");

const windowTitle = await application.evaluate(({ BrowserWindow }) => {
  return BrowserWindow.getAllWindows()[0]?.getTitle();
});
if (windowTitle !== "V3 Ajans") throw new Error(`Beklenmeyen pencere başlığı: ${windowTitle}`);

const title = await page.locator("h1").textContent();
if (title?.trim() !== "Lig merkezi") throw new Error(`Beklenmeyen ekran: ${title}`);

await page.getByRole("button", { name: "Takımlar", exact: true }).click();
await page.locator(".team-card").first().waitFor();
if ((await page.locator(".team-card").count()) !== 6) throw new Error("Örnek takım sayısı hatalı.");

await page.getByRole("button", { name: "Takım ekle", exact: true }).click();
await page.getByLabel("Takım adı *").fill("Masaüstü Test Takımı");
await page.getByLabel("Kısa ad").fill("MTT");
await page.getByRole("button", { name: "Takımı ekle", exact: true }).click();
await page.locator(".team-card").nth(6).waitFor();

await page.getByRole("button", { name: "Fikstür", exact: true }).click();
await page.getByRole("button", { name: "Fikstürü oluştur", exact: true }).click();
const firstMatch = page.locator(".fixture-card").first();
await firstMatch.locator("input[type=number]").nth(0).fill("3");
await firstMatch.locator("input[type=number]").nth(1).fill("1");
await firstMatch.getByRole("button", { name: "Kaydet" }).click();

await page.getByRole("button", { name: "Puan Durumu", exact: true }).click();
if ((await page.locator(".standings-table tbody tr").count()) !== 7) {
  throw new Error("Puan tablosu takım sayısıyla eşleşmiyor.");
}
if ((await page.locator(".points-cell").first().textContent())?.trim() !== "3") {
  throw new Error("Girilen skor puan tablosuna yansımadı.");
}

await page.getByRole("button", { name: /^Fair Play/ }).click();
await page.getByRole("button", { name: "Kart kaydı ekle", exact: true }).click();
await page.getByLabel("Oyuncu").fill("Masaüstü Test Oyuncusu");
await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();
await page.getByText("Masaüstü Test Oyuncusu", { exact: true }).waitFor();

const platform = await page.evaluate(() => window.v3Desktop?.platform);
if (!platform) throw new Error("Güvenli masaüstü köprüsü yüklenmedi.");

const hasHorizontalOverflow = await page.evaluate(
  () => document.documentElement.scrollWidth > window.innerWidth
);
if (hasHorizontalOverflow) throw new Error("Masaüstü penceresinde yatay taşma var.");

await page.screenshot({ path: "/tmp/v3-desktop-app.png", fullPage: true });

if (errors.length) throw new Error(errors.join("\n"));

console.log(
  JSON.stringify(
    {
      status: "ok",
      platform,
      windowTitle,
      screenshot: "/tmp/v3-desktop-app.png",
      tested: [
        "native-window",
        "secure-preload",
        "navigation",
        "team-create",
        "fixture-regenerate",
        "score-save",
        "standings-auto-update",
        "card-create"
      ]
    },
    null,
    2
  )
);

await application.close();
