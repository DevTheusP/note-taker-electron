import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
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
// Evita abrir janelas duplicadas
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Se já existe um app rodando e o usuário tentou abrir outro pelo atalho do Hyprland,
  // nós matamos esse processo novo imediatamente.
  app.quit()
} else {
  // O app que já está aberto fica escutando. Se alguém tentar abrir de novo...
  app.on('second-instance', () => {
    // ...ele pega a janela dele mesmo e mostra de novo
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })
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

  const caminhoMaterias = join(os.homedir(), 'Documents', 'Vault_Faculdade', 'materias.json')

  // Puxar a lista de matérias
  ipcMain.handle('get-materias', async () => {
    try {
      // Tenta ler o arquivo JSON
      const arquivo = await fs.readFile(caminhoMaterias, 'utf-8')
      return JSON.parse(arquivo)
    } catch (erro) {
      // Se der erro (provavelmente porque é a primeira vez rodando e o arquivo não existe),
      // cria o arquivo injetando algumas disciplinas iniciais padrão.
      const materiasIniciais = [
        'Arquitetura de Computadores', 
        'Estruturas de Dados', 
        'Cálculo',
        'Algoritmos'
      ]
      
      // Garante que a pasta base existe
      await fs.mkdir(join(os.homedir(), 'Documents', 'Vault_Faculdade'), { recursive: true })
      
      // Cria o arquivo materias.json com as disciplinas padrão
      await fs.writeFile(caminhoMaterias, JSON.stringify(materiasIniciais, null, 2), 'utf-8')
      
      return materiasIniciais
    }
  })

  // Adiciona uma matéria nova ao JSON
  ipcMain.handle('add-materia', async (_, novaMateria) => {
    try {
      // Lê o array atual
      const arquivo = await fs.readFile(caminhoMaterias, 'utf-8')
      const materias = JSON.parse(arquivo)

      // Evita disciplinas duplicadas
      if (!materias.includes(novaMateria)) {
        materias.push(novaMateria)
        // Sobrescreve o JSON com o novo array ordenado alfabeticamente
        materias.sort() 
        await fs.writeFile(caminhoMaterias, JSON.stringify(materias, null, 2), 'utf-8')
      }
      return { sucesso: true, materias }
    } catch (erro: any) {
      console.error('Erro ao salvar matéria:', erro)
      return { sucesso: false, erro: erro.message }
    }
  })
  // Busca todas as notas de uma matéria específica
  ipcMain.handle('get-notas', async (_, materia) => {
    try {
      const pastaMateria = join(os.homedir(), 'Documents', 'Vault_Faculdade', materia);
      
      // Verifica se a pasta da matéria já existe fisicamente. 
      // Se não existir (ex: matéria recém-criada sem notas), retorna um array vazio.
      try {
        await fs.access(pastaMateria);
      } catch {
        return []; 
      }

      // Lê todos os arquivos dentro da pasta
      const arquivos = await fs.readdir(pastaMateria);
      const notas: any[] = [];

      for (const arquivo of arquivos) {
        // Filtra para pegar apenas os arquivos Markdown
        if (arquivo.endsWith('.md')) {
          const caminhoCompleto = join(pastaMateria, arquivo);
          
          // Pega os metadados do arquivo (como data de criação/modificação)
          const stats = await fs.stat(caminhoCompleto);
          
          notas.push({
            nome: arquivo.replace('.md', ''), // Remove o ".md" para a interface ficar mais limpa
            caminho: caminhoCompleto,
            dataModificacao: stats.mtime 
          });
        }
      }

      // Ordena a lista para mostrar as anotações mais recentes primeiro
      return notas.sort((a, b) => b.dataModificacao.getTime() - a.dataModificacao.getTime());
      
    } catch (erro: any) {
      console.error('Erro ao buscar notas:', erro);
      return [];
    }
  });

  // Abre o arquivo no programa padrão do sistema (Ex: Obsidian, VS Code)
  ipcMain.handle('abrir-nota', async (_, caminho) => {
    await shell.openPath(caminho);
  });
  

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

  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    // Pega a janela que já está aberta na memória
    const mainWindow = BrowserWindow.getAllWindows()[0]
    
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide() // Se está visível, esconde
      } else {
        mainWindow.show() // Se está invisível, mostra
        mainWindow.focus() // E garante que o teclado já vai estar nela
      }
    }
  })

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

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
