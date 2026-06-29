import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import DiagnosticsPanel from '../components/DiagnosticsPanel.jsx';
export default function Diagnostics(){ const [last,setLast]=useState(''); return <div className="grid"><DiagnosticsPanel onExport={async(options)=>setLast(await window.appAPI.exportDiagnostics(options))}/>{last?<Card title="Last Diagnostics Export"><code>{last}</code><div><button className="secondaryButton" onClick={()=>window.appAPI.showInFolder(last)}>Show in folder</button></div></Card>:null}</div>; }
