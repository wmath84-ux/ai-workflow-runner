import React from 'react';
import Card from '../components/Card.jsx';

export default function WorkflowEditor() {
  return (
    <Card title="Workflow Editor">
      <p>Placeholder editor area for future JSON validation and workflow editing.</p>
      <textarea className="editorPreview" readOnly value={'{\n  "name": "New Workflow",\n  "steps": []\n}'} />
    </Card>
  );
}
