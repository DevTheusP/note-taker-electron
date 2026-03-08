import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs/promises'
import os from 'os'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // cria o "canal" para receber a mensagem salvar-nota
  ipcMain.handle('salvar-nota', async (_, dadosDaAula) => {
    try {
      const { materia, data, titulo, conteudo } = dadosDaAula;

      // Cria a pasta dentro da sua home. 
      const pastaBase = join(os.homedir(), 'Documents', 'Vault_Faculdade', materia);
      await fs.mkdir(pastaBase, { recursive: true });

      // Limpa o nome do arquivo para não dar erro no Linux/Windows
      const nomeArquivo = `${data} - ${titulo.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
      const caminhoCompleto = join(pastaBase, nomeArquivo);

      // Formata como Markdown (perfeito para abrir direto no Obsidian depois)
      const conteudoMarkdown = `# ${titulo}\n**Data:** ${data}\n**Matéria:** ${materia}\n\n---\n\n${conteudo}`;

      // Salva no disco
      await fs.writeFile(caminhoCompleto, conteudoMarkdown, 'utf-8');

      return { sucesso: true, caminho: caminhoCompleto };
    } catch (erro: any) {
      console.error('Erro no Node:', erro);
      return { sucesso: false, erro: erro.message };
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
