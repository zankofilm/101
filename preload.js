const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('JavanroodNativeStore',{
  version:'V101_CLIENT_WHITE_SCREEN_FIX',
  loadState:(key)=>ipcRenderer.invoke('native:loadState',key),
  saveState:(key,state)=>ipcRenderer.invoke('native:saveState',key,state),
  backupState:(key,state)=>ipcRenderer.invoke('native:backupState',key,state),
  openDataDir:()=>ipcRenderer.invoke('native:openDataDir')
});
