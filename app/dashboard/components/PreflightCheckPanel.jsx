import React from 'react';

export default function PreflightCheckPanel({ result, onRunCheck, onOpenBrowser, onOpenChatGPT, onOpenGemini }) {
  return (
    <div className="preflightPanel">
      <div className="stepHeader"><h3>Run Preflight Checks</h3><button className="secondaryButton" onClick={onRunCheck}>Run preflight check</button></div>
      {!result ? <p>Validate workflow readiness before running browser workflows.</p> : <>
        <p><strong>Can run:</strong> {result.canRun ? 'Yes' : 'No'} · <strong>Browser required:</strong> {result.browserRequired ? 'Yes' : 'No'}</p>
        <p><strong>Required tools:</strong> {(result.requiredTools ?? []).join(', ') || 'none'}</p>
        <p><strong>Required inputs:</strong> {(result.requiredInputs ?? []).join(', ') || 'none'}</p>
        {result.errors?.length ? <div className="errorBox"><strong>Errors block this run</strong><ul>{result.errors.map((error, index) => <li key={index}>{error.message}</li>)}</ul></div> : null}
        {result.warnings?.length ? <div className="warningBox"><strong>Warnings</strong><ul>{result.warnings.map((warning, index) => <li key={index}>{warning.message ?? warning}</li>)}</ul></div> : null}
      </>}
      <div className="buttonRow"><button className="secondaryButton" onClick={onOpenBrowser}>Open Browser Panel</button><button className="secondaryButton" onClick={onOpenChatGPT}>Open ChatGPT</button><button className="secondaryButton" onClick={onOpenGemini}>Open Gemini</button></div>
    </div>
  );
}
