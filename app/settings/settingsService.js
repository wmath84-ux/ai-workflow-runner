import { getSetting, setSetting } from '../storage/settings.js';
import { safeJsonParse } from '../shared/safeJson.js';
import { defaultSettings } from './defaultSettings.js';
import { sanitizeSettings, mergeWithDefaultSettings } from './settingsValidator.js';
export async function loadSettings(){const raw=getSetting('app_settings'); const validation=sanitizeSettings(raw??defaultSettings); if(!raw) setSetting('app_settings',validation.settings); return {...validation, warning: raw?null:'Loaded default settings.'};}
export async function saveSettings(settings){const previous=getSetting('app_settings'); if(previous) setSetting('app_settings_backup',previous); const validation=sanitizeSettings(settings); setSetting('app_settings',validation.settings); return validation;}
export async function updateSettings(partialSettings){const current=(await loadSettings()).settings; return saveSettings(mergeWithDefaultSettings({...current,...partialSettings}));}
export async function resetSettings(){setSetting('app_settings_backup',getSetting('app_settings')??{}); setSetting('app_settings',defaultSettings); return {valid:true,settings:defaultSettings,errors:[],warnings:[]};}
export async function resetSettingsSection(sectionName){const current=(await loadSettings()).settings; current[sectionName]=defaultSettings[sectionName]; return saveSettings(current);}
export async function exportSettings(){return (await loadSettings()).settings;}
export async function importSettings(settingsJson){const parsed=typeof settingsJson==='string'?safeJsonParse(settingsJson,{}):settingsJson; return saveSettings(parsed);}
