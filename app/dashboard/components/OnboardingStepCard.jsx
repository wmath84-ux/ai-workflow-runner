import React from 'react';
import StatusBadge from './StatusBadge.jsx';

export default function OnboardingStepCard({ step, index, active, completed, onComplete }) {
  return (
    <article className={`stepCard ${active ? 'activePanel' : ''}`}>
      <div className="stepHeader">
        <h3>{index + 1}. {step.title}</h3>
        <StatusBadge status={completed ? 'completed' : active ? 'running' : 'pending'} />
      </div>
      <p>{step.description}</p>
      {step.actionLabel ? <p className="mutedText">Suggested action: {step.actionLabel}</p> : null}
      <button className="secondaryButton" onClick={() => onComplete?.(step.id)}>Mark Complete</button>
    </article>
  );
}
