import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import ExportButtons from '../components/ExportButtons.jsx';
import ResultOutputViewer from '../components/ResultOutputViewer.jsx';
import RunSummaryCard from '../components/RunSummaryCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function RunHistory() {
  const [runs,setRuns]=useState([]); const [selected,setSelected]=useState(null); const [search,setSearch]=useState(''); const [status,setStatus]=useState('all'); const [sort,setSort]=useState('newest');
  async function load(){ setRuns(await window.appAPI.listRuns()); }
  useEffect(()=>{ load(); },[]);
  const filtered=useMemo(()=>runs.filter(r=>(status==='all'||r.status===status)&&`${r.workflowName} ${r.id}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='oldest'?String(a.startedAt).localeCompare(String(b.startedAt)):sort==='workflow'?String(a.workflowName).localeCompare(String(b.workflowName)):sort==='status'?String(a.status).localeCompare(String(b.status)):String(b.startedAt).localeCompare(String(a.startedAt))),[runs,search,status,sort]);
  async function openRun(runId){ setSelected(await window.appAPI.getRunState(runId)); }
  return <div className="grid twoColumn"><Card title="Run History"><SearchFilterBar search={search} onSearch={setSearch} status={status} onStatus={setStatus} sort={sort} onSort={setSort}/>{filtered.length===0?<div className="emptyState">No runs match your filters.</div>:filtered.map(run=><article className="runListItem" key={run.id} onClick={()=>openRun(run.id)}><strong>{run.workflowName}</strong><StatusBadge status={run.status}/><small>{run.id}</small><small>{run.startedAt}</small></article>)}</Card><div>{selected?<><RunSummaryCard run={selected}/><ExportButtons runId={selected.id}/><ResultOutputViewer run={selected}/></>:<Card title="Select a Run"><p>Choose a run to view details and exports.</p></Card>}</div></div>;
}
