import React from 'react';
export default function SettingsSection({ title, children, onReset }) { return <section className="card"><h2>{title}</h2>{children}<div className="buttonRow">{onReset ? <button className="secondaryButton" onClick={onReset}>Reset Section</button> : null}</div></section>; }
