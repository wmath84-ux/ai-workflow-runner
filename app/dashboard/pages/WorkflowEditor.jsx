import React from 'react';
import Card from '../components/Card.jsx';

export default function WorkflowEditor() {
  return (
    <Card title="Workflow Editor">
      <p>Command 2 adds validation and execution from the Run Panel. A full saved-workflow editor will be expanded later.</p>
      <textarea className="editorPreview" readOnly value={'{\n  "workflowName": "New Workflow",\n  "inputs": {},\n  "steps": []\n}'} />
    </Card>
  );
}
