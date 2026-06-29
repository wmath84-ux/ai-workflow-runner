import React from 'react';

export default function RunLog({ messages = [] }) {
  return (
    <div className="runLog" aria-live="polite">
      {messages.length === 0 ? <span>Run logs will appear here.</span> : messages.map((message, index) => <p key={`${message}-${index}`}>{message}</p>)}
    </div>
  );
}
