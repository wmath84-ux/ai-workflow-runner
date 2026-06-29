import React from 'react';
export default function NotificationToast({ message, type = 'info' }) { return message ? <div className={`emptyState toast ${type}`}>{message}</div> : null; }
