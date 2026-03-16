const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {

  saveResults: (data) => ipcRenderer.send("save-results", data)

})