const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const fs = require("fs")
const { google } = require("googleapis")

function createWindow() {

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  })

  win.loadFile("index.html")
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)


ipcMain.on("save-results", async (event, data) => {

  console.log("Received data:", data)

  fs.writeFileSync(
    path.join(__dirname, "result.json"),
    JSON.stringify(data, null, 2)
  )

  try {

    await sendToGoogleSheets(data)

  } catch (err) {

    console.error("Google Sheets error:", err)

  }

})


async function sendToGoogleSheets(data) {

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  })

  const sheets = google.sheets({
    version: "v4",
    auth
  })

  // ONLY THE ID, NOT THE FULL URL
  const spreadsheetId = "1J_aJR-poUCDhpSZAVvDPwW9oyhMfN-Lxwq3y5KydDyA"

  const rows = data.map(r => [
    r.project_name,
    r.task_id
  ])

  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: "Sheet1!A:B",
    valueInputOption: "RAW",
    requestBody: {
      values: rows
    }
  })

  console.log("Uploaded to Google Sheets")

}