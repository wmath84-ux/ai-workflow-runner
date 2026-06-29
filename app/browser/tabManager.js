import { getBrowserContext, openUrl } from './browserManager.js';
import { getConnector, getConnectorStartUrl } from '../connectors/connectorRegistry.js';

async function toTabInfo(page, index, extra = {}, includePage = false) {
  const info = {
    ...extra,
    url: page.url(),
    title: await page.title().catch(() => ''),
    index
  };
  if (includePage) info.page = page;
  return info;
}

function getOpenPages() {
  return getBrowserContext()?.pages().filter((page) => !page.isClosed()) ?? [];
}

function hostFromUrl(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

export async function openToolTab(toolName, options = {}) {
  const connector = getConnector(toolName);
  return openUrlTab(connector.startUrl, {
    reuse: options.reuse ?? true,
    urlPart: options.urlPart || hostFromUrl(connector.startUrl),
    bringToFront: options.bringToFront ?? true,
    includePage: options.includePage ?? false,
    extra: { toolName, label: connector.label }
  });
}

export async function openUrlTab(url, options = {}) {
  const reuse = options.reuse ?? true;
  const urlPart = options.urlPart || hostFromUrl(url);
  if (reuse) {
    const existing = await findPageByUrlPart(urlPart);
    if (existing?.page) {
      if (options.bringToFront ?? true) await existing.page.bringToFront();
      return toTabInfo(existing.page, existing.index, options.extra ?? {}, options.includePage);
    }
  }
  const tab = await openUrl(url);
  const page = getOpenPages().at(tab.index) ?? getOpenPages().at(-1);
  if (page && options.includePage) return toTabInfo(page, tab.index, options.extra ?? {}, true);
  return { ...(options.extra ?? {}), ...tab };
}

export async function openNewTab(url, extra = {}) {
  return openUrlTab(url, { reuse: false, extra });
}

export async function findPageByUrlPart(urlPart) {
  const pages = getOpenPages();
  const index = pages.findIndex((page) => page.url().includes(urlPart));
  if (index === -1) return null;
  return { page: pages[index], index };
}

export async function listOpenTabs() {
  const pages = getOpenPages();
  return Promise.all(pages.map((page, index) => toTabInfo(page, index)));
}

export async function closeTabByUrlPart(urlPart) {
  const match = await findPageByUrlPart(urlPart);
  if (!match) throw new Error(`No open tab matched "${urlPart}".`);
  const info = await toTabInfo(match.page, match.index);
  await match.page.close();
  return { ...info, closed: true };
}

export async function bringTabToFrontByUrlPart(urlPart) {
  const match = await findPageByUrlPart(urlPart);
  if (!match) throw new Error(`No open tab matched "${urlPart}".`);
  await match.page.bringToFront();
  return toTabInfo(match.page, match.index);
}

export { getConnectorStartUrl };
