function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runMockStep({ step, resolvedPrompt, context }) {
  await delay(500);
  return {
    output: `Mock output for step "${step.id}"\n\nPrompt received:\n${resolvedPrompt}`,
    raw: {
      stepId: step.id,
      tool: step.tool,
      contextKeys: Object.keys(context ?? {}),
      createdAt: new Date().toISOString()
    }
  };
}
