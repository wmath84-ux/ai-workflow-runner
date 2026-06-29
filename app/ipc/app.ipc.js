import { ipcMain, shell } from 'electron';
import { projectPath } from '../shared/fileUtils.js';
import { getBuildInfo } from '../build/buildInfo.js';
import { getAppVersionInfo } from '../build/versionInfo.js';
import { resetOnboarding } from '../readiness/onboardingState.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerAppIpc(){ipcMain.handle('app:version-info',()=>({ok:true,data:getAppVersionInfo()})); ipcMain.handle('app:build-info',()=>({ok:true,data:getBuildInfo()})); ipcMain.handle('app:open-user-guide',h(()=>shell.openPath(projectPath('USER_GUIDE.md')))); ipcMain.handle('app:open-troubleshooting',h(()=>shell.openPath(projectPath('TROUBLESHOOTING.md')))); ipcMain.handle('app:restart-onboarding',h(resetOnboarding));}
