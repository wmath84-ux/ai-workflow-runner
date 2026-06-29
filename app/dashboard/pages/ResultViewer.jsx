import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import ExportButtons from '../components/ExportButtons.jsx';
import ResultOutputViewer from '../components/ResultOutputViewer.jsx';
import RunSummaryCard from '../components/RunSummaryCard.jsx';

export default function ResultViewer() { const [runId,setRunId]=useState(''); const [run,setRun]=useState(null); const [error,setError]=useState(''); async function load(){ try{ setRun(await window.appAPI.getRunState(runId)); setError(''); } catch(e){ setError(e.message); } } return <div className="grid"><Card title="Result Viewer"><div className="buttonRow"><input className="inlineInput" placeholder="run_xxx" value={runId} onChange={e=>setRunId(e.target.value)}/><button className="primaryAction" onClick={load}>Open Run</button></div>{error?<div className="errorBox">{error}</div>:null}</Card>{run?<><RunSummaryCard run={run}/><ExportButtons runId={run.id}/><ResultOutputViewer run={run}/></>:null}</div>; }
