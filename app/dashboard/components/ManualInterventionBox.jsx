import React from 'react';

export default function ManualInterventionBox({ message, onOpenChatGPT, onRetry }) {
  return (
    <section className="manualInterventionBox">
      <h3>Manual intervention required</h3>
      <p>{message}</p>
      <p><strong>Note:</strong> Complete the required action manually in the opened browser window, then return here and click Retry Paused Step.</p>
      <div className="buttonRow">
        <button className="secondaryButton" onClick={onOpenChatGPT}>Open ChatGPT</button>
        <button className="primaryAction" onClick={onRetry}>Retry Paused Step</button>
      </div>
    </section>
  );
}
