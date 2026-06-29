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

export async function launchBrowser(options = {}) {
  if (browserState.context) return getBrowserStatus();
  if (browserState.launchingPromise) return browserState.launchingPromise;

  browserState.status = 'launching';
  browserState.lastError = null;
  const profilePath = ensureProfileDir(resolveProfilePath(options.profilePath));
  browserState.profilePath = profilePath;

  browserState.launchingPromise = (async () => {
    try {
      const chromium = await loadChromium();
      logger.info('Launching persistent Chromium context', { profilePath });
      const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        viewport: options.viewport ?? { width: 1366, height: 900 },
        acceptDownloads: true,
        chromiumSandbox: false,
        ignoreHTTPSErrors: true,
        timeout: options.timeout ?? 60000,
        args: getChromiumLaunchArgs(options.args ?? [])
      });

      browserState.context = context;
      browserState.status = 'running';
      context.on('close', () => {
        logger.info('Browser context closed');
        browserState.context = null;
        browserState.status = 'closed';
      });
      return getBrowserStatus();
    } catch (error) {
      const normalized = normalizeBrowserError(error);
      logger.error('Browser launch failed', normalized);
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
  if (!browserState.context) {
    browserState.status = 'closed';
    return getBrowserStatus();
  }

  try {
    await browserState.context.close();
    browserState.context = null;
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
