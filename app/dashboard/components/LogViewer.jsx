import React from 'react';
export default function LogViewer({ logs=[] }) { return <div className="grid">{logs.map(log=><details className="card" key={log.id}><summary>[{log.level}] {log.message}</summary><pre>{JSON.stringify(log,null,2)}</pre></details>)}</div>; }
