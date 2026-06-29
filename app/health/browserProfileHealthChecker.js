import fs from 'node:fs/promises';
import { projectPath } from '../shared/fileUtils.js';
export async function checkBrowserProfile(){try{await fs.access(projectPath('browser-profile')); return {id:'browser_profile',label:'Browser Profile',status:'ok',message:'Browser profile folder is available.'};}catch(error){return {id:'browser_profile',label:'Browser Profile',status:'warning',message:'Browser profile folder will be created on demand.'};}}
