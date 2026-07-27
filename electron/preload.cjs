const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("v3Desktop", {
  platform: process.platform,
  versions: Object.freeze({
    electron: process.versions.electron,
    chrome: process.versions.chrome
  })
});
