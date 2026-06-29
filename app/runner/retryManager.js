function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry(fn, options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : 1;
  const delayMs = Number.isInteger(options.delayMs) ? options.delayMs : 1000;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn({ attempt });
    } catch (error) {
      lastError = error;
      if (attempt >= retries) break;
      await options.onRetry?.({ attempt: attempt + 1, error });
      await delay(delayMs);
    }
  }

  throw lastError;
}
