import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import RunLog from '../components/RunLog.jsx';
import StepStatusList from '../components/StepStatusList.jsx';
import ManualInterventionBox from '../components/ManualInterventionBox.jsx';
import RunQueuePanel from '../components/RunQueuePanel.jsx';
import ParallelGroupCard from '../components/ParallelGroupCard.jsx';
import DynamicRunForm from '../components/DynamicRunForm.jsx';
import VariablePreviewPanel from '../components/VariablePreviewPanel.jsx';
import PreflightCheckPanel from '../components/PreflightCheckPanel.jsx';

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

function localValidateWorkflow(workflow) {
  const errors = [];
  if (!workflow || typeof workflow !== 'object') errors.push({ field: 'workflow', message: 'Workflow must be an object.' });
  if (!workflow?.workflowName) errors.push({ field: 'workflowName', message: 'workflowName is required.' });
  if (!Array.isArray(workflow?.steps) || workflow.steps.length === 0) errors.push({ field: 'steps', message: 'At least one step is required.' });
  for (const [index, step] of (workflow?.steps ?? []).entries()) {
    if (!step.id) errors.push({ field: `steps.${index}.id`, message: 'Step id is required.' });
    if (!step.tool) errors.push({ field: `steps.${index}.tool`, message: 'Step tool is required.' });
    if (!step.prompt) errors.push({ field: `steps.${index}.prompt`, message: 'Step prompt is required.' });
    if (!step.saveAs) errors.push({ field: `steps.${index}.saveAs`, message: 'Step saveAs is required.' });
  }
  return { valid: errors.length === 0, errors };
}

function resolvePrompt(prompt, inputs, completedOutputs) {
  return String(prompt ?? '').replace(/{{\s*([^}]+)\s*}}/g, (_match, key) => {
    const name = key.trim();
    return completedOutputs[name] ?? inputs?.[name] ?? `{{${name}}}`;
  });
}

function localMockRun(workflow) {
  const completedOutputs = {};
  const steps = [];
  for (const [index, step] of workflow.steps.entries()) {
    const resolvedPrompt = resolvePrompt(step.prompt, workflow.inputs ?? {}, completedOutputs);
    const output = `[Mock output for ${step.id}]\n\nPrompt used:\n${resolvedPrompt}`;
    completedOutputs[step.saveAs] = output;
    steps.push({
      id: `${Date.now()}-${index}`,
      stepKey: step.id,
      status: 'completed',
      output: { saveAs: step.saveAs, output },
      completedAt: new Date().toISOString()
    });
  }
  return {
    runId: `local-${Date.now()}`,
    workflowName: workflow.workflowName,
    status: 'completed',
    completedOutputs,
    finalOutputPath: 'local browser/electron mock result',
    steps,
    groups: []
  };
}

async function callAppApi(methodName, ...args) {
  const method = window.appAPI?.[methodName];
  if (typeof method !== 'function') throw new Error(`${methodName} is not available in this preview.`);
  return method(...args);
}

export default function RunPanel() {
  const [workflowText, setWorkflowText] = useState(JSON.stringify(sampleWorkflow, null, 2));
  const [validation, setValidation] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [browserStatus, setBrowserStatus] = useState(null);
  const [genericUrl, setGenericUrl] = useState('https://example.com');
  const [queueStatus, setQueueStatus] = useState(null);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [dynamicWorkflow, setDynamicWorkflow] = useState(null);
  const [preflight, setPreflight] = useState(null);
  const [allowWarningRun, setAllowWarningRun] = useState(false);

  useEffect(() => {
    window.appAPI?.listWorkflows?.().then((items) => setSavedWorkflows(Array.isArray(items) ? items : [])).catch(() => {});
    window.appAPI?.listTemplates?.().then((items) => setTemplates(Array.isArray(items) ? items : [])).catch(() => {});
  }, []);

  const parsedWorkflow = useMemo(() => {
    try {
      return { workflow: JSON.parse(workflowText), error: null };
    } catch (error) {
      return { workflow: null, error: `Invalid JSON: ${error.message}` };
    }
  }, [workflowText]);

  async function refreshBrowserStatus() {
    try {
      setBrowserStatus(await callAppApi('getBrowserStatus'));
    } catch (error) {
      setLogs((current) => [...current, error.message]);
    }
  }

  async function openTool(toolName) {
    setLogs((current) => [...current, `Opening ${toolName}...`]);
    try {
      await callAppApi('openTool', toolName);
      await refreshBrowserStatus();
      setLogs((current) => [...current, `${toolName} opened for manual browser preparation.`]);
    } catch (error) {
      setLogs((current) => [...current, `${toolName} open failed: ${error.message}`]);
    }
  }

  async function validateCurrentWorkflow() {
    setRunResult(null);
    setLogs((current) => [...current, 'Validate Workflow button clicked.']);
    if (parsedWorkflow.error) {
      const result = { valid: false, errors: [{ field: 'json', message: parsedWorkflow.error }] };
      setValidation(result);
      return result;
    }

    try {
      const result = await callAppApi('validateWorkflow', parsedWorkflow.workflow);
      const normalized = result && typeof result === 'object' ? result : localValidateWorkflow(parsedWorkflow.workflow);
      setValidation(normalized);
      setLogs((current) => [...current, normalized.valid ? 'Workflow is valid.' : 'Workflow has validation errors.']);
      return normalized;
    } catch (error) {
      const fallback = localValidateWorkflow(parsedWorkflow.workflow);
      setValidation(fallback);
      setLogs((current) => [...current, `App validation unavailable, used local validation: ${error.message}`, fallback.valid ? 'Workflow is valid.' : 'Workflow has validation errors.']);
      return fallback;
    }
  }

  async function runPreflight(workflow = parsedWorkflow.workflow) {
    if (!workflow) return null;
    try {
      const result = await callAppApi('runWorkflowPreflightChecks', workflow);
      const normalized = result && typeof result === 'object' ? result : { ok: true, canRun: true, errors: [], warnings: [] };
      setPreflight(normalized);
      setAllowWarningRun(false);
      return normalized;
    } catch (error) {
      const result = { ok: true, canRun: true, errors: [], warnings: [{ type: 'fallback_preflight', message: `Preflight fallback used: ${error.message}` }] };
      setPreflight(result);
      return result;
    }
  }

  async function ensureReadyForRun(workflow) {
    const validationResult = await validateCurrentWorkflow();
    if (!validationResult?.valid) return false;
    const preflightResult = await runPreflight(workflow);
    if (!preflightResult?.canRun) return false;
    if (preflightResult.warnings?.length && !allowWarningRun) {
      setLogs((current) => [...current, 'Preflight produced warnings. For this mock test, click Run Now again to continue.']);
      setAllowWarningRun(true);
      return false;
    }
    return true;
  }

  async function retryPausedStep() {
    if (!runResult?.runId) return;
    setIsRunning(true);
    setLogs((current) => [...current, `Retrying paused step for run ${runResult.runId}.`]);
    try {
      const result = await callAppApi('retryPausedStep', runResult.runId);
      setRunResult(result);
      setLogs((current) => [...current, `Retry finished with status ${result.status}.`]);
    } catch (error) {
      setLogs((current) => [...current, `Retry failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  }

  async function refreshQueue() {
    try {
      const result = await callAppApi('getRunQueueStatus');
      setQueueStatus(result ?? { items: [] });
    } catch (error) {
      setQueueStatus({ items: [] });
      setLogs((current) => [...current, error.message]);
    }
  }

  async function enqueueCurrentWorkflow() {
    if (!await ensureReadyForRun(parsedWorkflow.workflow)) return;
    try {
      await callAppApi('enqueueWorkflowRun', parsedWorkflow.workflow);
      await refreshQueue();
      setLogs((current) => [...current, 'Workflow added to queue.']);
    } catch (error) {
      setLogs((current) => [...current, `Queue unavailable: ${error.message}`]);
    }
  }

  async function resumeCurrentWorkflow() {
    if (!runResult?.runId) return;
    setIsRunning(true);
    try {
      setRunResult(await callAppApi('resumeWorkflow', runResult.runId));
    } catch (error) {
      setLogs((current) => [...current, `Resume failed: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  }

  async function loadSavedWorkflow(id) {
    if (!id) return;
    try {
      const workflow = await callAppApi('getWorkflow', id);
      const definition = workflow?.definition ?? workflow;
      setWorkflowText(JSON.stringify(definition, null, 2));
      setDynamicWorkflow(definition);
    } catch (error) {
      setLogs((current) => [...current, `Could not load workflow: ${error.message}`]);
    }
  }

  async function loadTemplate(id) {
    if (!id) return;
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setDynamicWorkflow({ ...template.templateJson, inputSchema: template.inputSchema, templateId: template.id });
  }

  async function runWorkflowObject(workflow) {
    setWorkflowText(JSON.stringify(workflow, null, 2));
    await runCurrentWorkflow(workflow);
  }

  async function runCurrentWorkflow(workflowOverride = null) {
    const workflow = workflowOverride ?? parsedWorkflow.workflow;
    setLogs((current) => [...current, 'Run Now button clicked.']);
    if (!workflow) {
      setValidation({ valid: false, errors: [{ field: 'json', message: parsedWorkflow.error ?? 'Workflow JSON is missing.' }] });
      return;
    }
    if (!await ensureReadyForRun(workflow)) return;

    setIsRunning(true);
    setLogs((current) => [...current, 'Workflow run started.']);
    try {
      const result = await callAppApi('runWorkflow', workflow);
      const normalized = result && typeof result === 'object' ? result : localMockRun(workflow);
      setRunResult(normalized);
      setLogs((current) => [...current, `Run ${normalized.runId} finished with status ${normalized.status}.`]);
    } catch (error) {
      const fallback = localMockRun(workflow);
      setRunResult(fallback);
      setLogs((current) => [...current, `App runner unavailable, used local mock runner: ${error.message}`, `Run ${fallback.runId} finished with status ${fallback.status}.`]);
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
          <button className="secondaryButton" onClick={async () => { setLogs((current) => [...current, 'Launch Browser button clicked.']); try { await callAppApi('launchBrowser'); await refreshBrowserStatus(); } catch (error) { setLogs((current) => [...current, `Launch browser failed: ${error.message}`]); } }}>Launch Browser</button>
          <button className="secondaryButton" onClick={() => openTool('chatgpt')}>Open ChatGPT</button>
          <button className="secondaryButton" onClick={() => openTool('gemini')}>Open Gemini</button>
          <button className="secondaryButton" onClick={() => openTool('claude')}>Open Claude</button>
          <button className="secondaryButton" onClick={() => openTool('perplexity')}>Open Perplexity</button>
          <input className="inlineInput" value={genericUrl} onChange={(event) => setGenericUrl(event.target.value)} />
          <button className="secondaryButton" onClick={async () => { setLogs((current) => [...current, 'Open Generic URL button clicked.']); try { await callAppApi('openUrl', genericUrl); await refreshBrowserStatus(); } catch (error) { setLogs((current) => [...current, `Open URL failed: ${error.message}`]); } }}>Open Generic URL</button>
        </div>
      </Card>

      <Card title="Run From Library or Template">
        <p>Select a saved workflow or template, fill inputs dynamically, then run or queue.</p>
        <div className="buttonRow">
          <select value={selectedWorkflowId} onChange={async (event) => { setSelectedWorkflowId(event.target.value); await loadSavedWorkflow(event.target.value); }}>
            <option value="">Saved workflow...</option>
            {savedWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}
          </select>
          <select value={selectedTemplateId} onChange={async (event) => { setSelectedTemplateId(event.target.value); await loadTemplate(event.target.value); }}>
            <option value="">Template...</option>
            {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
          </select>
        </div>
        {dynamicWorkflow ? <DynamicRunForm workflow={dynamicWorkflow} onRun={runWorkflowObject} onPreview={(workflow) => setWorkflowText(JSON.stringify(workflow, null, 2))} /> : <div className="emptyState">Choose a workflow/template to show the dynamic input form.</div>}
        {parsedWorkflow.workflow ? <VariablePreviewPanel text={JSON.stringify(parsedWorkflow.workflow.inputs ?? {}, null, 2)} context={parsedWorkflow.workflow.inputs ?? {}} /> : null}
      </Card>

      <Card title="Run Preflight">
        <PreflightCheckPanel result={preflight} onRunCheck={() => runPreflight()} onOpenBrowser={() => setLogs((current) => [...current, 'Open Browser Panel from the sidebar for browser preparation.'])} onOpenChatGPT={() => openTool('chatgpt')} onOpenGemini={() => openTool('gemini')} />
        {preflight?.warnings?.length && preflight?.canRun ? <button className="secondaryButton" onClick={() => setAllowWarningRun(true)}>Continue anyway for warnings only</button> : null}
      </Card>

      <Card title="Run Workflow JSON">
        <p>Paste a workflow JSON document, validate it, then execute it with the safe mock runner.</p>
        <textarea className="workflowTextarea" value={workflowText} onChange={(event) => setWorkflowText(event.target.value)} />
        <div className="buttonRow">
          <button className="secondaryButton" onClick={validateCurrentWorkflow} disabled={isRunning}>Validate Workflow</button>
          <button className="primaryAction" onClick={() => runCurrentWorkflow()} disabled={isRunning}>{isRunning ? 'Running…' : 'Run Now'}</button>
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
              <ul>{(validation.errors ?? []).map((error, index) => <li key={index}><code>{error.field}</code>: {error.message}</li>)}</ul>
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

      <RunQueuePanel queueStatus={queueStatus} onRefresh={refreshQueue} onCancel={async (id) => { try { await callAppApi('cancelQueuedRun', id); } catch {} await refreshQueue(); }} onClearCompleted={async () => { try { await callAppApi('clearCompletedQueueItems'); } catch {} await refreshQueue(); }} />

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
