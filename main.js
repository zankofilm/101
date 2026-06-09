const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function dataDir(){ const d=path.join(app.getPath('userData'),'data'); ensureDir(d); return d; }
function stateFile(key){ return path.join(dataDir(), String(key||'client').replace(/[^a-zA-Z0-9_-]/g,'_')+'_state.json'); }
function readJson(file){ try{return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null}catch(e){return null} }
function writeJson(file,obj){ ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(obj||{},null,2),'utf8'); }

function createWindow(){
  mainWindow = new BrowserWindow({
    width: 440,
    height: 860,
    minWidth: 390,
    minHeight: 720,
    title: 'کلاینت سامانه سمن‌های شهرستان جوانرود',
    autoHideMenuBar: true,
    backgroundColor: '#f7fbff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname,'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    }
  });
  mainWindow.once('ready-to-show',()=>mainWindow.show());
  mainWindow.loadFile(path.join(__dirname,'client_ui','index.html'));
  mainWindow.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return {action:'deny'}});
  mainWindow.webContents.on('render-process-gone',()=>{ mainWindow.loadFile(path.join(__dirname,'client_ui','index.html')); });
}

app.whenReady().then(()=>{
  session.defaultSession.setPermissionRequestHandler((_wc,permission,callback)=>callback(['media','camera','microphone','display-capture'].includes(permission)));
  session.defaultSession.setPermissionCheckHandler((_wc,permission)=>['media','camera','microphone','display-capture'].includes(permission));

  ipcMain.handle('native:loadState',async(_e,key)=>{const f=stateFile(key||'client');return {ok:true,exists:fs.existsSync(f),state:readJson(f),path:f}});
  ipcMain.handle('native:saveState',async(_e,key,state)=>{const f=stateFile(key||'client');writeJson(f,state||{});return {ok:true,path:f}});
  ipcMain.handle('native:backupState',async(_e,key,state)=>{const dir=path.join(dataDir(),'backups');ensureDir(dir);const f=path.join(dir,`${key||'client'}_${new Date().toISOString().replace(/[:.]/g,'-')}.json`);writeJson(f,state||{});return {ok:true,path:f}});
  ipcMain.handle('native:openDataDir',async()=>{shell.openPath(dataDir());return {ok:true,path:dataDir()}});

  createWindow();
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});