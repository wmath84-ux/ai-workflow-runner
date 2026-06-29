import { ipcMain } from 'electron';
import { createPrompt, deletePrompt, duplicatePrompt, getPromptById, listPrompts, seedDefaultPromptsIfEmpty, togglePromptFavorite, updatePrompt } from '../storage/prompts.js';
function ok(data){return {ok:true,data};} function fail(e){return {ok:false,error:e.message};}
export function registerPromptsIpc(){
  ipcMain.handle('prompts:list',(_e,filters)=>{try{return ok(listPrompts(filters??{}));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:get',(_e,id)=>{try{return ok(getPromptById(id));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:create',(_e,prompt)=>{try{return ok(createPrompt(prompt));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:update',(_e,id,updates)=>{try{return ok(updatePrompt(id,updates));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:delete',(_e,id)=>{try{return ok(deletePrompt(id));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:duplicate',(_e,id)=>{try{return ok(duplicatePrompt(id));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:toggle-favorite',(_e,id)=>{try{return ok(togglePromptFavorite(id));}catch(e){return fail(e);}});
  ipcMain.handle('prompts:seed-defaults',()=>{try{return ok(seedDefaultPromptsIfEmpty());}catch(e){return fail(e);}});
}
