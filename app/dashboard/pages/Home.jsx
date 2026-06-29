import React from 'react';
import Card from '../components/Card.jsx';

export default function Home() {
  return (
    <div className="grid twoColumn">
      <Card title="Project foundation">
        <p>This starter app wires Electron, React, Vite, SQLite storage, and placeholder automation modules.</p>
      </Card>
      <Card title="Next build step">
        <p>Command 2 will add workflow JSON validation, variable resolution, and the first sequential step engine.</p>
      </Card>
    </div>
  );
}
