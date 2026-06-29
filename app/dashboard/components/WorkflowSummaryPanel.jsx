import React from 'react';
import WorkflowPreview from './WorkflowPreview.jsx';
export default function WorkflowSummaryPanel({ workflow, validation }) { return <div><WorkflowPreview workflow={workflow}/>{validation?<pre>{JSON.stringify(validation,null,2)}</pre>:null}</div>; }
