'use strict'

import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron'
import * as fs from 'fs'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  const options = {
    height: 678,
    width: 800,
    show: false,
    // frame: true,
    center: true,
    fullscreenable: false,
    resizable: true,
    title: 'music-jojo',
    vibrancy: 'ultra-dark',
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      backgroundThrottling: false,
      webSecurity: false
    }
  }
  if (process.platform === 'win32') { // 针对windows平台做出不同的配置
    options.show = true // 创建即展示
    options.frame = true // 创建一个frameless窗口
    Menu.setApplicationMenu(null)
    // options.backgroundColor = '#3f3c37' // 背景色
  }
  mainWindow = new BrowserWindow(options)
  // const menu = Menu.buildFromTemplate(template)
  // Menu.setApplicationMenu(menu)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.request_remote = require('request')
app.fs = fs
app.dialog = dialog
app.lowdb = db
db.defaults({setting: { saveDir: '', about: false }})
  .write()

ipcMain.on('Config', (event, arg) => {
  console.log(arg)
  if (arg['method'] === 'set') {
    db.set('setting', arg['setting']).write()
    event.returnValue = 'success'
  }
  if (arg['method'] === 'get') {
    let ret = db.get('setting').value()
    event.returnValue = ret
  }
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
