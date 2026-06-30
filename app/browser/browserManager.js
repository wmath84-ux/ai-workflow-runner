import { spawn } from 'node:child_process';
import { browserState } from './browserState.js';
import { normalizeBrowserError } from './browserErrors.js';
import { ensureProfileDir, resolveProfilePath } from './profileManager.js';
import { logger } from '../shared/logger.js';

async function loadChromium() {
  const playwright = await import('playwright');
  return playwright.chromium;
}

function serializePage(page, index) {
  return {
    index,
    url: page.url(),
    title: '',
    closed: page.isClosed()
  };
}

function getChromiumLaunchArgs(extraArgs = []) {
  return [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-features=VizDisplayCompositor,UseChromeOSDirectVideoDecoder',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1366,900',
    ...extraArgs
  ];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRemoteBrowser(port, timeoutMs = 30000) {
  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return true;
    } catch (error) {
      lastError = error;
    }
    await sleep(500);
  }
  throw new Error(`Controlled browser did not expose CDP on port ${port}. ${lastError?.message ?? ''}`.trim());
}

function buildBrowserHostScript() {
  const args = JSON.stringify(getChromiumLaunchArgs([`--remote-debugging-port=${'${process.env.AWR_BROWSER_PORT}'}`]));
  return `
    import { chromium } from 'playwright';
    const profilePath = process.env.AWR_BROWSER_PROFILE;
    const port = process.env.AWR_BROWSER_PORT;
    const launchArgs = ${args}.map((arg) => arg.replace('\${process.env.AWR_BROWSER_PORT}', port));
    const context = await chromium.launchPersistentContext(profilePath, {
      headless: false,
      viewport: { width: 1366, height: 900 },
      acceptDownloads: true,
      chromiumSandbox: false,
      ignoreHTTPSErrors: true,
      args: launchArgs
    });
    if (context.pages().length === 0) await context.newPage();
    process.on('SIGTERM', async () => { try { await context.close(); } finally { process.exit(0); } });
    process.on('SIGINT', async () => { try { await context.close(); } finally { process.exit(0); } });
    await new Promise(() => {});
  `;
}

async function connectToHostedBrowser(port) {
  const chromium = await loadChromium();
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const context = browser.contexts()[0];
  if (!context) throw new Error('Connected to browser, but no browser context was available.');
  browserState.browser = browser;
  browserState.context = context;
  browserState.status = 'running';
  browser.on('disconnected', () => {
    logger.info('Controlled browser disconnected');
    browserState.browser = null;
    browserState.context = null;
    browserState.status = 'closed';
  });
  return context;
}

async function launchExternalBrowserHost({ profilePath, port }) {
  if (browserState.hostProcess && !browserState.hostProcess.killed) return;
  const child = spawn(process.execPath, ['--input-type=module', '-e', buildBrowserHostScript()], {
    cwd: process.cwd(),
    env: { ...process.env, AWR_BROWSER_PROFILE: profilePath, AWR_BROWSER_PORT: String(port) },
    stdio: 'ignore',
    detached: false
  });
  browserState.hostProcess = child;
  child.on('exit', () => {
    browserState.hostProcess = null;
    if (!browserState.browser && !browserState.context) browserState.status = 'closed';
  });
}

export async function launchBrowser(options = {}) {
  if (browserState.context) return getBrowserStatus();
  if (browserState.launchingPromise) return browserState.launchingPromise;

  browserState.status = 'launching';
  browserState.lastError = null;
  const profilePath = ensureProfileDir(resolveProfilePath(options.profilePath));
  const port = Number(options.remoteDebuggingPort ?? process.env.AWR_BROWSER_PORT ?? 9223);
  browserState.profilePath = profilePath;
  browserState.remoteDebuggingPort = port;

  browserState.launchingPromise = (async () => {
    try {
      logger.info('Launching external controlled Chromium host', { profilePath, port });
      await launchExternalBrowserHost({ profilePath, port });
      await waitForRemoteBrowser(port, options.timeout ?? 30000);
      const context = await connectToHostedBrowser(port);
      if (context.pages().filter((page) => !page.isClosed()).length === 0) await context.newPage();
      return getBrowserStatus();
    } catch (error) {
      const normalized = normalizeBrowserError(error);
      logger.error('Browser launch failed', normalized);
      browserState.browser = null;
      browserState.context = null;
      browserState.status = 'error';
      browserState.lastError = normalized;
      return getBrowserStatus();
    } finally {
      browserState.launchingPromise = null;
    }
  })();

  return browserState.launchingPromise;
}

export async function closeBrowser() {
  try {
    if (browserState.browser) await browserState.browser.close().catch(() => {});
    if (browserState.context && !browserState.browser) await browserState.context.close().catch(() => {});
    if (browserState.hostProcess && !browserState.hostProcess.killed) browserState.hostProcess.kill('SIGTERM');
    browserState.browser = null;
    browserState.context = null;
    browserState.hostProcess = null;
    browserState.status = 'closed';
    browserState.lastError = null;
  } catch (error) {
    browserState.lastError = normalizeBrowserError(error);
    browserState.status = 'error';
  }
  return getBrowserStatus();
}

export function getBrowserContext() {
  return browserState.context;
}

export function isBrowserRunning() {
  return Boolean(browserState.context) && browserState.status === 'running';
}

export async function getBrowserStatus() {
  const pages = browserState.context ? browserState.context.pages().filter((page) => !page.isClosed()).length : 0;
  return {
    running: isBrowserRunning(),
    status: browserState.status,
    profilePath: browserState.profilePath ?? resolveProfilePath(),
    remoteDebuggingPort: browserState.remoteDebuggingPort,
    pages,
    lastError: browserState.lastError
  };
}

export async function openUrl(url, options = {}) {
  if (!url || typeof url !== 'string') throw new Error('A valid URL is required.');
  if (!browserState.context) await launchBrowser(options);
  if (!browserState.context) throw new Error(browserState.lastError?.message ?? browserState.lastError ?? 'Browser is not running.');
  const page = await browserState.context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: options.timeout ?? 30000 });
  await page.bringToFront();
  return {
    url: page.url(),
    title: await page.title().catch(() => ''),
    index: browserState.context.pages().indexOf(page)
  };
}

export async function getActivePages() {
  if (!browserState.context) return [];
  const pages = browserState.context.pages().filter((page) => !page.isClosed());
  return Promise.all(pages.map(async (page, index) => ({
    ...serializePage(page, index),
    title: await page.title().catch(() => '')
  })));
}
