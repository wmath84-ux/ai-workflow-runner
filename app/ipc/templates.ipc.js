import { ipcMain } from 'electron';
import { createWorkflow } from '../storage/workflows.js';
import { createTemplate, deleteTemplate, duplicateTemplate, getTemplateById, listTemplates, seedDefaultTemplatesIfEmpty, toggleTemplateFavorite, updateTemplate } from '../storage/templates.js';
import { createWorkflowFromTemplate } from '../templates/templateFactory.js';
function ok(data){return {ok:true,data};} function fail(e){return {ok:false,error:e.message};}
export function registerTemplatesIpc(){
  ipcMain.handle('templates:list',(_e,filters)=>{try{return ok(listTemplates(filters??{}));}catch(e){return fail(e);}});
  ipcMain.handle('templates:get',(_e,id)=>{try{return ok(getTemplateById(id));}catch(e){return fail(e);}});
  ipcMain.handle('templates:create',(_e,t)=>{try{return ok(createTemplate(t));}catch(e){return fail(e);}});
  ipcMain.handle('templates:update',(_e,id,u)=>{try{return ok(updateTemplate(id,u));}catch(e){return fail(e);}});
  ipcMain.handle('templates:delete',(_e,id)=>{try{return ok(deleteTemplate(id));}catch(e){return fail(e);}});
  ipcMain.handle('templates:duplicate',(_e,id)=>{try{return ok(duplicateTemplate(id));}catch(e){return fail(e);}});
  ipcMain.handle('templates:toggle-favorite',(_e,id)=>{try{return ok(toggleTemplateFavorite(id));}catch(e){return fail(e);}});
  ipcMain.handle('templates:seed-defaults',()=>{try{return ok(seedDefaultTemplatesIfEmpty());}catch(e){return fail(e);}});
  ipcMain.handle('templates:create-workflow',(_e,id,inputValues,options={})=>{try{const template=getTemplateById(id); if(!template) throw new Error('Template not found.'); const workflow=createWorkflowFromTemplate(template,inputValues??{},options); const saved=options.saveToLibrary?createWorkflow({name:workflow.workflowName,description:workflow.description??'',status:'ready',definition:workflow}):null; return ok({workflow,saved});}catch(e){return fail(e);}});
}
