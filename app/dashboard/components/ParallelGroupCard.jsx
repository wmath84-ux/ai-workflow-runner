import React from 'react';
import StepStatusList from './StepStatusList.jsx';

export default function ParallelGroupCard({ group, steps = [] }) {
  const childSteps = steps.filter((step) => step.parentGroupId === group.groupId);
  const completed = childSteps.filter((step) => step.status === 'completed').length;
  const failed = childSteps.filter((step) => step.status === 'failed').length;
  const paused = childSteps.find((step) => step.status === 'paused');
  return (
    <section className="parallelGroupCard">
      <h3>{group.label || group.groupId}</h3>
      <p><strong>Status:</strong> {group.status} · <strong>Completed:</strong> {completed}/{childSteps.length} · <strong>Failed:</strong> {failed}</p>
      {paused ? <p><strong>Paused child:</strong> {paused.stepKey}</p> : null}
      <StepStatusList steps={childSteps} />
    </section>
  );
}
