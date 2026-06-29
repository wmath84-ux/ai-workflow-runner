import { ipcMain, app } from 'electron';
import { getDefaultProfilePath } from '../browser/profileManager.js';
import { exportSettings, importSettings, loadSettings, resetSettings, resetSettingsSection, saveSettings, updateSettings } from '../settings/settingsService.js';
function ok(data){return {ok:true,data};} function fail(e){return {ok:false,error:e.message};}
export async function getCurrentSettings(){const result=await loadSettings(); return {...result.settings,resolvedBrowserProfileDirectory:result.settings.browser.profilePath||getDefaultProfilePath()};}
export function registerSettingsIpc(){
  ipcMain.handle('settings:get-app-info',()=>({name:app.getName(),version:app.getVersion(),platform:process.platform}));
  ipcMain.handle('settings:get',async()=>getCurrentSettings());
  ipcMain.handle('settings:load',async()=>{try{return ok(await loadSettings());}catch(e){return fail(e);}});
  ipcMain.handle('settings:save',async(_e,next)=>{try{return ok((await saveSettings(next)).settings);}catch(e){return fail(e);}});
  ipcMain.handle('settings:update',async(_e,partial)=>{try{return ok(await updateSettings(partial));}catch(e){return fail(e);}});
  ipcMain.handle('settings:reset',async()=>{try{return ok(await resetSettings());}catch(e){return fail(e);}});
  ipcMain.handle('settings:reset-section',async(_e,section)=>{try{return ok(await resetSettingsSection(section));}catch(e){return fail(e);}});
  ipcMain.handle('settings:export',async()=>{try{return ok(await exportSettings());}catch(e){return fail(e);}});
  ipcMain.handle('settings:import',async(_e,json)=>{try{return ok(await importSettings(json));}catch(e){return fail(e);}});
}
