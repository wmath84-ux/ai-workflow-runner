import React from 'react';
import Card from './Card.jsx';
import StatusBadge from './StatusBadge.jsx';
export default function RunSummaryCard({ run }) { if(!run) return null; const steps=run.steps??[]; return <Card title="Run Summary"><p><strong>Workflow:</strong> {run.workflowName}</p><p><strong>Run ID:</strong> {run.id ?? run.runId}</p><p><strong>Status:</strong> <StatusBadge status={run.status}/></p><p><strong>Steps:</strong> {steps.length} · completed {steps.filter(s=>s.status==='completed').length} · failed {steps.filter(s=>s.status==='failed').length}</p><p><strong>Started:</strong> {run.startedAt ?? 'n/a'} · <strong>Finished:</strong> {run.completedAt ?? run.finishedAt ?? 'n/a'}</p></Card>; }
