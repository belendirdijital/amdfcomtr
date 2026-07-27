const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");

const isDevelopment = process.argv.includes("--dev");
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

function createApplicationMenu() {
  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
    return;
  }

  const template = [
    {
      label: "V3 Ajans",
      submenu: [
        { role: "about", label: "V3 Ajans Hakkında" },
        { type: "separator" },
        { role: "hide", label: "V3 Ajans'ı Gizle" },
        { role: "hideOthers", label: "Diğerlerini Gizle" },
        { role: "unhide", label: "Tümünü Göster" },
        { type: "separator" },
        { role: "quit", label: "V3 Ajans'tan Çık" }
      ]
    },
    {
      label: "Düzen",
      submenu: [
        { role: "undo", label: "Geri Al" },
        { role: "redo", label: "Yinele" },
        { type: "separator" },
        { role: "cut", label: "Kes" },
        { role: "copy", label: "Kopyala" },
        { role: "paste", label: "Yapıştır" },
        { role: "selectAll", label: "Tümünü Seç" }
      ]
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "togglefullscreen", label: "Tam Ekran" }
      ]
    },
    {
      role: "window",
      label: "Pencere",
      submenu: [
        { role: "minimize", label: "Küçült" },
        { role: "zoom", label: "Yakınlaştır" },
        { role: "front", label: "Tümünü Öne Getir" }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 930,
    minWidth: 980,
    minHeight: 680,
    show: false,
    title: "V3 Ajans",
    backgroundColor: "#f5f4f0",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const allowedUrl = isDevelopment
      ? url.startsWith("http://127.0.0.1:5173")
      : url.startsWith("file://");
    if (!allowedUrl) event.preventDefault();
  });

  if (isDevelopment) {
    mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist-renderer", "index.html"));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("second-instance", () => {
  const [mainWindow] = BrowserWindow.getAllWindows();
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
