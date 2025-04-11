import net from 'node:net'
import path, { join } from 'node:path' // 引入 process
import process from 'node:process' // 使用 node:process 引入

import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain } from 'electron'
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '../..')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

const mainWindows = []
let controlWindow
const url = `${process.env.VITE_DEV_SERVER_URL}`
const indexHtml = join(RENDERER_DIST, 'index.html')
const preloadJs = join(__dirname, '../preload/index.mjs')

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.on('ready', () => {
  // 创建中控台窗口
  controlWindow = new BrowserWindow({
    width: 1600,
    height: 600,

    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadJs,
    },
  })
  controlWindow.maximize()
  if (app.isPackaged) {
    controlWindow.loadFile(indexHtml)
  }
  else {
    controlWindow.loadURL(url)
    controlWindow.webContents.openDevTools()
  }

  // 监听插件问题消息
  const server = net.createServer((socket) => {
    socket.on('data', (data) => {
      const message = data.toString()
      console.log(message)
    })
  })

  server.listen(9999, 'localhost', () => {
    console.log('Listening on port 9999')
  })
})

function createBrowserWindow(containerId) {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
    resizable: true,
  })
  window.loadURL('https://business.facebook.com')
  mainWindows.push({ window, containerId })

  // 注入隐藏按钮
  window.webContents.on('did-finish-load', () => {
    window.webContents.executeJavaScript(`
            const hideButton = document.createElement('button');
            hideButton.textContent = '隐藏窗口';
            hideButton.style.position = 'fixed';
            hideButton.style.top = '20px';
            hideButton.style.right = '20px';
            hideButton.style.zIndex = '9999';
            hideButton.style.padding = '10px 20px';
            hideButton.style.fontSize = '16px';
            hideButton.style.backgroundColor = 'red';
            hideButton.style.color = 'white';
            hideButton.style.border = 'none';
            hideButton.style.borderRadius = '5px';
            hideButton.style.cursor = 'pointer';
            hideButton.addEventListener('mouseover', () => {
                hideButton.style.backgroundColor = 'darkred';
            });
            hideButton.addEventListener('mouseout', () => {
                hideButton.style.backgroundColor = 'red';
            });
            hideButton.addEventListener('click', () => {
                window.electronAPI.hideWindow('${containerId}');
            });
            document.body.appendChild(hideButton);
        `)
  })
}

// 处理启动请求
ipcMain.on('start-browsers', (_) => {
  createBrowserWindow(`chrome-instance-1`)
  const containerInfo = mainWindows.map(item => ({ containerId: item.containerId }))
  controlWindow.webContents.send('update-container-list', containerInfo)
})

// 处理展示容器请求
ipcMain.on('show-container', (event, containerId) => {
  const targetWindow = mainWindows.find(({ containerId: id }) => id === containerId)
  if (targetWindow) {
    targetWindow.window.show()
    targetWindow.window.setClosable(false)
  }
})

// 处理隐藏容器请求
ipcMain.on('hide-container', (event, containerId) => {
  const targetWindow = mainWindows.find(({ containerId: id }) => id === containerId)
  if (targetWindow) {
    targetWindow.window.hide()
  }
})

// 处理请求容器列表
ipcMain.on('request-container-list', (event) => {
  const containerInfo = mainWindows.map(item => ({ containerId: item.containerId }))
  event.sender.send('update-container-list', containerInfo)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    controlWindow = null
    // mainWindows.forEach(({ containerId }) => {})
    app.quit()
  }
})

app.on('activate', () => {
  if (controlWindow === null) {
    if (app.isPackaged) {
      controlWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          devTools: false,
        },
      })
      controlWindow.loadFile(indexHtml)
    }
    else {
      controlWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          // 保持 DevTools 开启
          devTools: true,
        },
      })
      controlWindow.loadURL(url)
    }
  }
})
