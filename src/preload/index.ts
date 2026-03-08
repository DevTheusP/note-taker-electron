import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  salvarAula: (dadosDaAula: any) => {
    return electronAPI.ipcRenderer.invoke('salvar-nota', dadosDaAula)
  },
  getMaterias: () => {
    return electronAPI.ipcRenderer.invoke('get-materias')
  },
  addMateria: (novaMateria: string) => {
    return electronAPI.ipcRenderer.invoke('add-materia', novaMateria)
  },
  getNotas: (materia: string) => {
    return electronAPI.ipcRenderer.invoke('get-notas', materia)
  },
  abrirNota: (caminho: string) => {
    return electronAPI.ipcRenderer.invoke('abrir-nota', caminho)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
