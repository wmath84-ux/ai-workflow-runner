import { ipcMain } from 'electron';
import { completeOnboarding, getOnboardingState, markOnboardingStepComplete, resetOnboarding, updateOnboardingState } from '../readiness/onboardingState.js';
function h(fn){return async(_e,...args)=>{try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}}}
export function registerOnboardingIpc(){ipcMain.handle('onboarding:get',h(getOnboardingState)); ipcMain.handle('onboarding:update',h(updateOnboardingState)); ipcMain.handle('onboarding:complete-step',h(markOnboardingStepComplete)); ipcMain.handle('onboarding:reset',h(resetOnboarding)); ipcMain.handle('onboarding:complete',h(completeOnboarding));}
