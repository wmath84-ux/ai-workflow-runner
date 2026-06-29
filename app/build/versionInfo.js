import { app } from 'electron';
export function getAppVersionInfo(){return { appName: app?.getName?.() ?? 'AI Workflow Runner', appVersion: app?.getVersion?.() ?? '0.1.0', electron: process.versions.electron, node: process.versions.node, platform: process.platform };}
