import React from 'react';
const labels = { pending: 'Pending', queued: 'Queued', running: 'Running', completed: 'Completed', paused: 'Paused', failed: 'Failed', cancelled: 'Cancelled', ready: 'Ready', not_ready: 'Not Ready', manual_action_required: 'Manual Action Required', ok: 'OK', warning: 'Warning', error: 'Error' };
export default function StatusBadge({ status = 'pending' }) { return <span className={`statusBadge ${status}`}>{labels[status] ?? status}</span>; }
