import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import LogViewer from '../components/LogViewer.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';

export default function Logs(){ const [logs,setLogs]=useState([]); const [search,setSearch]=useState(''); const [level,setLevel]=useState('all'); async function load(){ setLogs(await window.appAPI.listLogs({ search, level })); } useEffect(()=>{ load(); },[]); return <div className="grid"><Card title="Logs"><SearchFilterBar search={search} onSearch={setSearch} status={level} onStatus={setLevel}/><div className="buttonRow"><button className="secondaryButton" onClick={load}>Refresh</button><button className="dangerButton secondaryButton" onClick={async()=>{ if(window.confirm('Clear logs?')){ await window.appAPI.clearLogs(); await load(); }}}>Clear Logs</button></div></Card><LogViewer logs={logs}/></div>; }
