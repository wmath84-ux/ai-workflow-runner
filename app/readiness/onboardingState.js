import { loadSettings, saveSettings } from '../settings/settingsService.js';
const initialState = { currentStep: 0, completedSteps: [], skipped: false, completed: false, completedAt: null };
function fromSettings(settings){return { ...initialState, completed: Boolean(settings.app.onboardingCompleted), completedAt: settings.app.onboardingCompletedAt ?? null, ...(settings.app.onboardingState ?? {}) };}
export async function getOnboardingState(){const {settings}=await loadSettings(); return fromSettings(settings);}
export async function updateOnboardingState(updates){const {settings}=await loadSettings(); const next={...fromSettings(settings),...updates}; settings.app.onboardingState=next; settings.app.onboardingCompleted=Boolean(next.completed); settings.app.onboardingCompletedAt=next.completedAt; await saveSettings(settings); return next;}
export async function markOnboardingStepComplete(stepId){const state=await getOnboardingState(); const completedSteps=[...new Set([...(state.completedSteps??[]),stepId])]; return updateOnboardingState({completedSteps,currentStep:Math.min((state.currentStep??0)+1,9)});}
export async function resetOnboarding(){const {settings}=await loadSettings(); settings.app.onboardingCompleted=false; settings.app.onboardingCompletedAt=null; settings.app.onboardingState=initialState; await saveSettings(settings); return initialState;}
export async function completeOnboarding(){return updateOnboardingState({completed:true,skipped:false,completedAt:new Date().toISOString(),currentStep:9});}
