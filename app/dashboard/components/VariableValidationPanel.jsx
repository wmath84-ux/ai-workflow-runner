import React from 'react';
export default function VariableValidationPanel({ missing = [], variables = [] }) { return <div className="card compact"><h3>Variable Validation</h3><p>Detected: {variables.join(', ') || 'none'}</p>{missing.length?<div className="errorBox">Missing: {missing.join(', ')}</div>:<div className="successBox">No missing variables.</div>}</div>; }
