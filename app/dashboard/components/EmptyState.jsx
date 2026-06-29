import React from 'react';
export default function EmptyState({ children = 'Nothing to show yet.' }) { return <div className="emptyState">{children}</div>; }
