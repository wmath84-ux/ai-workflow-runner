<<<<<<< HEAD
import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import DynamicRunForm from '../components/DynamicRunForm.jsx';
import InputFormBuilder from '../components/InputFormBuilder.jsx';
import StepEditorCard from '../components/StepEditorCard.jsx';
import WorkflowSummaryPanel from '../components/WorkflowSummaryPanel.jsx';

const initial = { workflowName: 'New Workflow', description: '', inputs: {}, inputSchema: {}, steps: [] };
export default function WorkflowEditor(){
  const [mode,setMode]=useState('json'); const [workflow,setWorkflow]=useState(initial); const [text,setText]=useState(JSON.stringify(initial,null,2)); const [validation,setValidation]=useState(null); const [message,setMessage]=useState('');
  const parsed=useMemo(()=>{ try{return JSON.parse(text);}catch{return null;} },[text]);
  function sync(next){ setWorkflow(next); setText(JSON.stringify(next,null,2)); }
  async function validate(){ const target=mode==='json'?parsed:workflow; if(!target){ setValidation({valid:false,errors:[{field:'json',message:'Invalid JSON'}]}); return; } setValidation(await window.appAPI.validateWorkflow(target)); }
  function switchMode(nextMode){ if(nextMode==='visual'){ if(!parsed){ setMessage('Fix JSON before switching to visual mode.'); return; } setWorkflow(parsed); } else setText(JSON.stringify(workflow,null,2)); setMode(nextMode); }
  function updateStep(index,next){ const steps=[...(workflow.steps??[])]; steps[index]=next; sync({...workflow,steps}); }
  function move(index,delta){ const steps=[...(workflow.steps??[])]; const target=index+delta; if(target<0||target>=steps.length) return; [steps[index],steps[target]]=[steps[target],steps[index]]; sync({...workflow,steps}); }
  function addStep(){ sync({...workflow,steps:[...(workflow.steps??[]),{id:`step_${(workflow.steps??[]).length+1}`,tool:'mock',mode:'single',prompt:'Use {{topic}}',saveAs:`output_${(workflow.steps??[]).length+1}`}]}); }
  function addGroup(){ sync({...workflow,steps:[...(workflow.steps??[]),{id:`group_${(workflow.steps??[]).length+1}`,mode:'parallel',label:'Parallel Group',steps:[{id:'parallel_a',tool:'mock',mode:'single',prompt:'Prompt A {{topic}}',saveAs:'parallel_a_output'},{id:'parallel_b',tool:'mock',mode:'single',prompt:'Prompt B {{topic}}',saveAs:'parallel_b_output'}]}]}); }
  async function run(target){ const result=await window.appAPI.runWorkflow(target ?? (mode==='json'?parsed:workflow)); setMessage(`Run ${result.runId} finished with ${result.status}`); }
  return <div className="grid twoColumn"><Card title="Workflow Editor"><div className="buttonRow"><button className="secondaryButton" onClick={()=>switchMode('json')}>JSON mode</button><button className="secondaryButton" onClick={()=>switchMode('visual')}>Visual step mode</button><button className="secondaryButton" onClick={validate}>Validate</button><button className="primaryAction" onClick={()=>run()}>Run Workflow</button></div>{mode==='json'?<textarea className="workflowTextarea" value={text} onChange={e=>setText(e.target.value)}/>:<div><input value={workflow.workflowName} onChange={e=>sync({...workflow,workflowName:e.target.value})}/><textarea value={workflow.description??''} onChange={e=>sync({...workflow,description:e.target.value})}/><InputFormBuilder value={workflow.inputSchema??{}} onChange={inputSchema=>sync({...workflow,inputSchema,inputs:Object.fromEntries(Object.entries(inputSchema).map(([k,v])=>[k,v.default??'']))})}/><div className="buttonRow"><button className="secondaryButton" onClick={addStep}>Add Step</button><button className="secondaryButton" onClick={addGroup}>Add Parallel Group</button></div>{(workflow.steps??[]).map((step,index)=>step.mode==='parallel'?<div className="card compact" key={step.id}><h3>{step.label??step.id}</h3><pre>{JSON.stringify(step,null,2)}</pre></div>:<StepEditorCard key={index} step={step} context={workflow.inputs} onChange={next=>updateStep(index,next)} onDelete={()=>sync({...workflow,steps:workflow.steps.filter((_,i)=>i!==index)})} onMoveUp={()=>move(index,-1)} onMoveDown={()=>move(index,1)}/>)}</div>}{validation?<pre>{JSON.stringify(validation,null,2)}</pre>:null}{message?<div className="emptyState">{message}</div>:null}</Card><Card title="Workflow Summary & Run Form"><WorkflowSummaryPanel workflow={mode==='json'?(parsed??initial):workflow} validation={validation}/><DynamicRunForm workflow={mode==='json'?(parsed??initial):workflow} onRun={run} onPreview={(wf)=>setText(JSON.stringify(wf,null,2))}/></Card></div>;
=======
import React from 'react';
import Card from '../components/Card.jsx';

export default function WorkflowEditor() {
  return (
    <Card title="Workflow Editor">
      <p>Command 2 adds validation and execution from the Run Panel. A full saved-workflow editor will be expanded later.</p>
      <textarea className="editorPreview" readOnly value={'{\n  "workflowName": "New Workflow",\n  "inputs": {},\n  "steps": []\n}'} />
    </Card>
  );
>>>>>>> origin/main
}
