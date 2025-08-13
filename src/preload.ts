// Disable no-unused-vars, broken for interfaces

import { contextBridge, ipcRenderer } from 'electron';

export interface IElectronAPI {
  openFile: () => Promise<string>;
  saveFile: (content: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

// Custom APIs for renderer
const electronAPI: IElectronAPI = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content: string) => ipcRenderer.invoke('dialog:saveFile', content),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  Object.assign(window, { electronAPI });
}
