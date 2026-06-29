import React from 'react';

export default function OpenToolButton({ toolName, children, onOpen }) {
  return <button className="secondaryButton" onClick={() => onOpen?.(toolName)}>{children ?? `Open ${toolName}`}</button>;
}
