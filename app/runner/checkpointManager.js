export function createCheckpoint(runState) {
  // TODO: Persist resumable run checkpoints in a future command.
  return { ...runState, checkpointedAt: new Date().toISOString() };
}
