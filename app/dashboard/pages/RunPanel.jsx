import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import RunLog from '../components/RunLog.jsx';
import StepStatusList from '../components/StepStatusList.jsx';
import ManualInterventionBox from '../components/ManualInterventionBox.jsx';
import RunQueuePanel from '../components/RunQueuePanel.jsx';
import ParallelGroupCard from '../components/ParallelGroupCard.jsx';

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
  const [browserStatus, setBrowserStatus] = useState(null);
  const [genericUrl, setGenericUrl] = useState('https://example.com');
  const [queueStatus, setQueueStatus] = useState(null);

  const parsedWorkflow = useMemo(() => {
    try { return { workflow: JSON.parse(workflowText), error: null }; }
    catch (error) { return { workflow: null, error: `Invalid JSON: ${error.message}` }; }
  }, [workflowText]);

  async function refreshBrowserStatus() {
    try { setBrowserStatus(await window.appAPI.getBrowserStatus()); } catch (error) { setLogs((current) => [...current, error.message]); }
  }

  async function openTool(toolName) {
    try {
      await window.appAPI.openTool(toolName);
      await refreshBrowserStatus();
      setLogs((current) => [...current, `${toolName} opened for manual browser preparation.`]);
    } catch (error) {
      setLogs((current) => [...current, error.message]);
    }
  }

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

  async function retryPausedStep() {
    if (!runResult?.runId) return;
    setIsRunning(true);
    setLogs((current) => [...current, `Retrying paused step for run ${runResult.runId}.`]);
    try {
      const result = await window.appAPI.retryPausedStep(runResult.runId);
      setRunResult(result);
      setLogs((current) => [...current, `Retry finished with status ${result.status}.`]);
    } catch (error) {
      setLogs((current) => [...current, `Retry failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  }

  async function refreshQueue() {
    try { setQueueStatus(await window.appAPI.getRunQueueStatus()); } catch (error) { setLogs((current) => [...current, error.message]); }
  }

  async function enqueueCurrentWorkflow() {
    const validationResult = await validateCurrentWorkflow();
    if (!validationResult?.valid) return;
    try {
      await window.appAPI.enqueueWorkflowRun(parsedWorkflow.workflow);
      await refreshQueue();
      setLogs((current) => [...current, 'Workflow added to queue.']);
    } catch (error) { setLogs((current) => [...current, error.message]); }
  }

  async function resumeCurrentWorkflow() {
    if (!runResult?.runId) return;
    setIsRunning(true);
    try { setRunResult(await window.appAPI.resumeWorkflow(runResult.runId)); }
    catch (error) { setLogs((current) => [...current, `Resume failed: ${error.message}`]); }
    finally { setIsRunning(false); }
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
      <Card title="Workflow Mode Info">
        <p><strong>Mock:</strong> runs without a browser. <strong>ChatGPT/Gemini/Generic:</strong> require the persistent browser. ChatGPT and Gemini require manual login.</p>
        <p>For Gemini workflows, make sure Gemini is logged in inside the persistent browser. Generic connector needs a valid URL and safe selectors for best results.</p>
      </Card>

      <Card title="Browser Preparation">
        <p>Use these controls before running a ChatGPT workflow. The app will not automate login.</p>
        <p><strong>Status:</strong> {browserStatus?.status ?? 'unknown'} · <strong>Tabs:</strong> {browserStatus?.pages ?? 0}</p>
        <div className="buttonRow">
          <button className="secondaryButton" onClick={async () => { await window.appAPI.launchBrowser(); await refreshBrowserStatus(); }}>Launch Browser</button>
          <button className="secondaryButton" onClick={() => openTool('chatgpt')}>Open ChatGPT</button>
          <button className="secondaryButton" onClick={() => openTool('gemini')}>Open Gemini</button>
          <button className="secondaryButton" onClick={() => openTool('claude')}>Open Claude</button>
          <button className="secondaryButton" onClick={() => openTool('perplexity')}>Open Perplexity</button>
          <input className="inlineInput" value={genericUrl} onChange={(event) => setGenericUrl(event.target.value)} />
          <button className="secondaryButton" onClick={async () => { await window.appAPI.openUrl(genericUrl); await refreshBrowserStatus(); }}>Open Generic URL</button>
        </div>
      </Card>

      <Card title="Run Workflow">
        <p>Paste a workflow JSON document, validate it, then execute it with the safe mock runner.</p>
        <textarea className="workflowTextarea" value={workflowText} onChange={(event) => setWorkflowText(event.target.value)} />
        <div className="buttonRow">
          <button className="secondaryButton" onClick={validateCurrentWorkflow} disabled={isRunning}>Validate Workflow</button>
          <button className="primaryAction" onClick={runCurrentWorkflow} disabled={isRunning}>{isRunning ? 'Running…' : 'Run Now'}</button>
          <button className="secondaryButton" onClick={enqueueCurrentWorkflow} disabled={isRunning}>Add To Queue</button>
          <button className="secondaryButton" onClick={retryPausedStep} disabled={isRunning || runResult?.status !== 'paused'}>Retry Paused Step</button>
          <button className="secondaryButton" onClick={resumeCurrentWorkflow} disabled={isRunning || !runResult?.runId}>Resume Workflow</button>
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
        {runResult ? <div className="runSummaryBox">
          <p><strong>Current run status:</strong> {runResult.status}</p>
          {runResult.pausedStepId ? <p><strong>Paused step:</strong> {runResult.pausedStepId}</p> : null}
          {runResult.reason ? <p><strong>Paused reason:</strong> {runResult.reason}</p> : null}
          {runResult.message ? <p><strong>Message:</strong> {runResult.message}</p> : null}
        </div> : null}
        {runResult?.status === 'paused' ? <ManualInterventionBox message={runResult.message} onOpenChatGPT={() => openTool('chatgpt')} onRetry={retryPausedStep} /> : null}
        <RunLog messages={logs} />
        <StepStatusList steps={runResult?.steps ?? []} />
        {(runResult?.groups ?? []).map((group) => <ParallelGroupCard key={group.id} group={group} steps={runResult?.steps ?? []} />)}
      </Card>

      <RunQueuePanel queueStatus={queueStatus} onRefresh={refreshQueue} onCancel={async (id) => { await window.appAPI.cancelQueuedRun(id); await refreshQueue(); }} onClearCompleted={async () => { await window.appAPI.clearCompletedQueueItems(); await refreshQueue(); }} />

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
