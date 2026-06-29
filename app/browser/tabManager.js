import { getBrowserContext, openUrl } from './browserManager.js';
import { getConnector, getConnectorStartUrl } from '../connectors/connectorRegistry.js';

async function toTabInfo(page, index, extra = {}) {
  return {
    ...extra,
    url: page.url(),
    title: await page.title().catch(() => ''),
    index
  };
}

function getOpenPages() {
  return getBrowserContext()?.pages().filter((page) => !page.isClosed()) ?? [];
}

export async function openToolTab(toolName) {
  const connector = getConnector(toolName);
  const existing = await findPageByUrlPart(new URL(connector.startUrl).hostname);
  if (existing?.page) {
    await existing.page.bringToFront();
    return toTabInfo(existing.page, existing.index, { toolName, label: connector.label });
  }
  return openNewTab(connector.startUrl, { toolName, label: connector.label });
}

export async function openNewTab(url, extra = {}) {
  const tab = await openUrl(url);
  return { ...extra, ...tab };
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
