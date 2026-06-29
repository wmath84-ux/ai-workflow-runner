import React from 'react';
export default function EmptyState({ title = 'Nothing here yet', children, actionLabel, onAction }) { return <div className="emptyState"><strong>{title}</strong>{children ? <p>{children}</p> : null}{actionLabel ? <button className="secondaryButton" onClick={onAction}>{actionLabel}</button> : null}</div>; }
