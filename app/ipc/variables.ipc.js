import { ipcMain } from 'electron';
import { previewVariableResolution as preview } from '../runner/variableResolver.js';
import { createInputPreset, createVariable, deleteInputPreset, deleteVariable, getVariableById, listInputPresets, listVariables, updateInputPreset, updateVariable } from '../storage/variables.js';
function ok(data){return {ok:true,data};} function fail(e){return {ok:false,error:e.message};}
export function registerVariablesIpc(){
  ipcMain.handle('variables:list',(_e,filters)=>{try{return ok(listVariables(filters??{}));}catch(e){return fail(e);}});
  ipcMain.handle('variables:get',(_e,id)=>{try{return ok(getVariableById(id));}catch(e){return fail(e);}});
  ipcMain.handle('variables:create',(_e,v)=>{try{return ok(createVariable(v));}catch(e){return fail(e);}});
  ipcMain.handle('variables:update',(_e,id,u)=>{try{return ok(updateVariable(id,u));}catch(e){return fail(e);}});
  ipcMain.handle('variables:delete',(_e,id)=>{try{return ok(deleteVariable(id));}catch(e){return fail(e);}});
  ipcMain.handle('variables:preview-resolution',(_e,text,context)=>{try{return ok(preview(text,context??{}));}catch(e){return fail(e);}});
  ipcMain.handle('input-presets:list',(_e,filters)=>{try{return ok(listInputPresets(filters??{}));}catch(e){return fail(e);}});
  ipcMain.handle('input-presets:create',(_e,p)=>{try{return ok(createInputPreset(p));}catch(e){return fail(e);}});
  ipcMain.handle('input-presets:update',(_e,id,u)=>{try{return ok(updateInputPreset(id,u));}catch(e){return fail(e);}});
  ipcMain.handle('input-presets:delete',(_e,id)=>{try{return ok(deleteInputPreset(id));}catch(e){return fail(e);}});
}
