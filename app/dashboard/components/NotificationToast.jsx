import React from 'react';
export default function NotificationToast({ message, type = 'info', onClose }) { if (!message) return null; return <div className={`toast ${type}`} role="status"><span>{message}</span>{onClose ? <button aria-label="Dismiss notification" onClick={onClose}>×</button> : null}</div>; }
