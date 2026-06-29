import React from 'react';
import OpenToolButton from './OpenToolButton.jsx';

export default function ToolLoginCard({ connector, onOpen }) {
  return (
    <article className="toolLoginCard">
      <div>
        <h3>{connector.label}</h3>
        <p><code>{connector.startUrl}</code></p>
        <small>Login manually once. This app will reuse the same browser profile later.</small>
      </div>
      {connector.implemented ? <OpenToolButton toolName={connector.name} onOpen={onOpen}>Open Login Page</OpenToolButton> : <button className="secondaryButton" disabled>Coming in later command</button>}
    </article>
  );
}
