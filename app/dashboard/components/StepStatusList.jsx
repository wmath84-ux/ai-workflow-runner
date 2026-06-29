import React from 'react';

export default function StepStatusList({ steps = [] }) {
  if (!steps.length) return <div className="emptyState">No steps have run yet.</div>;
  return (
    <ol className="stepStatusList">
      {steps.map((step) => (
        <li key={step.id ?? step.stepKey} className={`stepStatus ${step.status} ${step.parentGroupId ? 'childStep' : ''}`}>
          <span>{step.parentGroupId ? `${step.parentGroupId} / ` : ''}{step.stepKey ?? step.id}</span>
          <strong>{step.status}</strong>
        </li>
      ))}
    </ol>
  );
}
