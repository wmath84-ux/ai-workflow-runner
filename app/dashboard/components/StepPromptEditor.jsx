import React from 'react';
import PromptInsertPanel from './PromptInsertPanel.jsx';
import VariablePicker from './VariablePicker.jsx';
import VariablePreviewPanel from './VariablePreviewPanel.jsx';
export default function StepPromptEditor({ prompt, onChange, context = {} }) { return <div><textarea className="workflowTextarea" value={prompt} onChange={e=>onChange(e.target.value)}/><PromptInsertPanel onInsert={(text)=>onChange(`${prompt}\n${text}`)}/><VariablePicker variables={Object.keys(context)} onInsert={(token)=>onChange(`${prompt}${token}`)}/><VariablePreviewPanel text={prompt} context={context}/></div>; }
