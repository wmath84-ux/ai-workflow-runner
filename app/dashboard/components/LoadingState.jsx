import React from 'react';
export default function LoadingState({ message = 'Loading…' }) { return <div className="loadingState" role="status">{message}</div>; }
