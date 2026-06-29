import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';

export default function Settings() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    window.aiWorkflowRunner?.getSettings?.().then(setSettings).catch(() => {});
  }, []);

  return (
    <Card title="Settings">
      <dl className="settingsList">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
        ))}
      </dl>
    </Card>
  );
}
