const REPORT_PAGE_PATH = 'src/report/index.html';

export function getReportUrl(auditId: string): string {
  return chrome.runtime.getURL(`${REPORT_PAGE_PATH}?auditId=${encodeURIComponent(auditId)}`);
}

export async function openReportTab(auditId: string): Promise<void> {
  const targetUrl = getReportUrl(auditId);
  const tabs = await chrome.tabs.query({ url: `${chrome.runtime.getURL(REPORT_PAGE_PATH)}*` });

  const existing = tabs.find((tab) => tab.url?.includes(`auditId=${encodeURIComponent(auditId)}`));
  if (existing?.id) {
    await chrome.tabs.update(existing.id, { active: true });
    if (existing.windowId) {
      await chrome.windows.update(existing.windowId, { focused: true });
    }
    return;
  }

  await chrome.tabs.create({ url: targetUrl });
}
