export async function withRetry(task) {
  // TODO: Add configurable retry policies in a future command.
  return task();
}
