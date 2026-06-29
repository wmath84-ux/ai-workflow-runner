import React from 'react';
export default function DangerZone({ children }) { return <section className="card"><h2>Danger Zone</h2><div className="errorBox">These actions can modify app data. Confirm before continuing.</div>{children}</section>; }
