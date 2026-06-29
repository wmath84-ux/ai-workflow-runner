import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import WorkflowCard from '../components/WorkflowCard.jsx';
import WorkflowImportBox from '../components/WorkflowImportBox.jsx';
import WorkflowPreview from '../components/WorkflowPreview.jsx';

const templates = {
  empty: { workflowName: 'New Workflow', description: '', inputs: {}, steps: [] },
  mock: { workflowName: 'Mock Template', inputs: { topic: 'Gravity' }, steps: [{ id: 'step_1', tool: 'mock', mode: 'single', prompt: 'Explain {{topic}}', saveAs: 'output' }] },
  chatgpt: { workflowName: 'ChatGPT Template', inputs: { topic: 'Gravity' }, steps: [{ id: 'chatgpt_step', tool: 'chatgpt', mode: 'single', prompt: 'Explain {{topic}}', saveAs: 'chatgpt_output' }] },
  gemini: { workflowName: 'Gemini Template', inputs: { topic: 'Gravity' }, steps: [{ id: 'gemini_step', tool: 'gemini', mode: 'single', prompt: 'Explain {{topic}}', saveAs: 'gemini_output' }] },
  parallel: { workflowName: 'Parallel Template', inputs: { topic: 'Gravity' }, steps: [{ id: 'base', tool: 'mock', mode: 'single', prompt: 'Research {{topic}}', saveAs: 'base_output' }, { id: 'assets', mode: 'parallel', steps: [{ id: 'titles', tool: 'mock', mode: 'single', prompt: 'Titles from {{base_output}}', saveAs: 'titles' }, { id: 'summary', tool: 'mock', mode: 'single', prompt: 'Summary from {{base_output}}', saveAs: 'summary' }] }] }
};

export default function WorkflowLibrary() {
  const [workflows, setWorkflows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  async function load() { setWorkflows(await window.appAPI.listWorkflows()); }
  useEffect(() => { load(); }, []);

  async function preview(workflow) {
    const full = await window.appAPI.getWorkflow(workflow.id);
    setSelected(full?.definition ?? full);
  }

  async function saveSelected() {
    if (!selected) return;
    const saved = await window.appAPI.importWorkflow(selected);
    setMessage(`Saved workflow ${saved.name}.`);
    await load();
  }

  async function duplicate(workflow) {
    if (workflow.status === 'sample') {
      const full = await window.appAPI.getWorkflow(workflow.id);
      await window.appAPI.importWorkflow({ ...(full?.definition ?? full), workflowName: `${workflow.name} Copy` });
    } else {
      await window.appAPI.duplicateWorkflow(workflow.id);
    }
    setMessage('Workflow duplicated.');
    await load();
  }

  async function remove(workflow) {
    if (workflow.status === 'sample') { setMessage('Bundled sample workflows cannot be deleted.'); return; }
    if (!window.confirm(`Delete workflow "${workflow.name}" from the SQLite library?`)) return;
    await window.appAPI.deleteWorkflow(workflow.id);
    setMessage('Workflow deleted.');
    await load();
  }

  const filtered = workflows.filter((workflow) => `${workflow.name} ${workflow.description}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="grid twoColumn"><Card title="Workflow Library"><SearchFilterBar search={search} onSearch={setSearch}/><div className="buttonRow">{Object.entries(templates).map(([key,value])=><button className="secondaryButton" key={key} onClick={()=>setSelected(value)}>{key} template</button>)}</div>{filtered.map((workflow)=><div key={workflow.id} className="card compact"><WorkflowCard workflow={workflow} onLoad={preview}/><div className="buttonRow"><button className="secondaryButton" onClick={()=>duplicate(workflow)}>Duplicate</button><button className="secondaryButton" onClick={()=>remove(workflow)}>Delete</button></div></div>)}</Card><div><WorkflowImportBox onImport={setSelected}/>{message?<div className="emptyState">{message}</div>:null}{selected?<WorkflowPreview workflow={selected}/>:null}{selected?<div className="buttonRow"><button className="primaryAction" onClick={saveSelected}>Save to Library</button><button className="secondaryButton" onClick={()=>navigator.clipboard?.writeText(JSON.stringify(selected,null,2))}>Copy JSON</button></div>:null}{selected?<pre className="jsonPreview">{JSON.stringify(selected,null,2)}</pre>:null}</div></div>;
}
