import React from 'react';

export default function RunQueuePanel({ queueStatus, onRefresh, onCancel, onClearCompleted }) {
  const items = queueStatus?.items ?? [];
  return (
    <section className="card queuePanel">
      <h2>Run Queue</h2>
      <div className="buttonRow">
        <button className="secondaryButton" onClick={onRefresh}>Refresh Queue</button>
        <button className="secondaryButton" onClick={onClearCompleted}>Clear Completed Queue Items</button>
      </div>
      {items.length === 0 ? <div className="emptyState">No queued runs yet.</div> : items.map((item) => (
        <article className="runListItem" key={item.id}>
          <strong>{item.workflowName}</strong>
          <span>{item.status}</span>
          <small>{item.id}</small>
          {item.status === 'queued' ? <button className="secondaryButton dangerButton" onClick={() => onCancel(item.id)}>Cancel</button> : null}
        </article>
      ))}
    </section>
  );
}
