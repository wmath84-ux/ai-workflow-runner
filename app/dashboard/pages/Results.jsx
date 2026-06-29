import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import ResultOutputViewer from '../components/ResultOutputViewer.jsx';
import RunSummaryCard from '../components/RunSummaryCard.jsx';

export default function Results() { const [runs,setRuns]=useState([]); const [selected,setSelected]=useState(null); useEffect(()=>{ window.appAPI.listRuns().then(setRuns).catch(()=>{}); },[]); async function open(runId){ setSelected(await window.appAPI.getRunState(runId)); } return <div className="grid twoColumn"><Card title="Results"><p>Select a run to view saved outputs.</p>{runs.map(run=><button className="runListItem" key={run.id} onClick={()=>open(run.id)}><strong>{run.workflowName}</strong><span>{run.status}</span><small>{run.id}</small></button>)}</Card><div>{selected?<><RunSummaryCard run={selected}/><ResultOutputViewer run={selected}/></>:<Card title="No run selected"><p>Choose a run from the list.</p></Card>}</div></div>; }
