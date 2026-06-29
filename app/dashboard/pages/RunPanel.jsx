import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import RunLog from '../components/RunLog.jsx';
import StepStatusList from '../components/StepStatusList.jsx';

const sampleWorkflow = {
  workflowName: 'YouTube Video Full Package',
  description: 'Creates research, script, titles, and final package.',
  inputs: { topic: "Newton's Laws of Motion" },
  steps: [
    { id: 'research', tool: 'mock', mode: 'single', prompt: 'Research this topic deeply: {{topic}}', saveAs: 'research_output' },
    { id: 'script', tool: 'mock', mode: 'single', prompt: 'Using this research, write a complete video script: {{research_output}}', saveAs: 'script_output' },
    { id: 'final_package', tool: 'mock', mode: 'single', prompt: 'Combine everything into one final package:\nResearch: {{research_output}}\nScript: {{script_output}}', saveAs: 'final_package' }
  ]
};

export default function RunPanel() {
  const [workflowText, setWorkflowText] = useState(JSON.stringify(sampleWorkflow, null, 2));
  const [validation, setValidation] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const parsedWorkflow = useMemo(() => {
    try { return { workflow: JSON.parse(workflowText), error: null }; }
    catch (error) { return { workflow: null, error: `Invalid JSON: ${error.message}` }; }
  }, [workflowText]);

  async function validateCurrentWorkflow() {
    setRunResult(null);
    if (parsedWorkflow.error) {
      setValidation({ valid: false, errors: [{ field: 'json', message: parsedWorkflow.error }] });
      return null;
    }
    try {
      const result = await window.appAPI.validateWorkflow(parsedWorkflow.workflow);
      setValidation(result);
      return result;
    } catch (error) {
      setValidation({ valid: false, errors: [{ field: 'workflow', message: error.message }] });
      return null;
    }
  }

  async function runCurrentWorkflow() {
    const validationResult = await validateCurrentWorkflow();
    if (!validationResult?.valid) return;
    setIsRunning(true);
    setLogs(['Workflow run started. Steps execute sequentially with the mock runner.']);
    try {
      const result = await window.appAPI.runWorkflow(parsedWorkflow.workflow);
      setRunResult(result);
      setLogs((current) => [...current, `Run ${result.runId} finished with status ${result.status}.`]);
    } catch (error) {
      setLogs((current) => [...current, `Run failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="grid twoColumn runPanelGrid">
      <Card title="Run Workflow">
        <p>Paste a workflow JSON document, validate it, then execute it with the safe mock runner.</p>
        <textarea className="workflowTextarea" value={workflowText} onChange={(event) => setWorkflowText(event.target.value)} />
        <div className="buttonRow">
          <button className="secondaryButton" onClick={validateCurrentWorkflow} disabled={isRunning}>Validate Workflow</button>
          <button className="primaryAction" onClick={runCurrentWorkflow} disabled={isRunning}>{isRunning ? 'Running…' : 'Run Workflow'}</button>
        </div>
      </Card>

      <Card title="Validation & Status">
        {validation ? (
          validation.valid ? <div className="successBox">Workflow is valid.</div> : (
            <div className="errorBox">
              <strong>Validation errors</strong>
              <ul>{validation.errors.map((error, index) => <li key={index}><code>{error.field}</code>: {error.message}</li>)}</ul>
            </div>
          )
        ) : <div className="emptyState">Validation results will appear here.</div>}
        <RunLog messages={logs} />
        <StepStatusList steps={runResult?.steps ?? []} />
      </Card>

      {runResult ? (
        <Card title="Completed Outputs">
          <p><strong>Run ID:</strong> {runResult.runId}</p>
          <p><strong>Status:</strong> {runResult.status}</p>
          {runResult.finalOutputPath ? <p><strong>Final output:</strong> <code>{runResult.finalOutputPath}</code></p> : null}
          <div className="outputList">
            {Object.entries(runResult.completedOutputs ?? {}).map(([key, value]) => (
              <details key={key}>
                <summary>{key}</summary>
                <pre>{value}</pre>
              </details>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
