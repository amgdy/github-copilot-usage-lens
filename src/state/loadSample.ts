import { msg, t } from '../i18n/core';
import { loadSources } from './loadDataset';
import { useApp } from './store';

/** Name of the made-up file, as shown on the Data page. */
export const SAMPLE_FILE_NAME = 'sample-usage-report.csv';

const pad = (value: number) => String(value).padStart(2, '0');
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** The sample covers the two months before this one and this month up to yesterday, so it looks like a fresh export. */
export function sampleRange(today = new Date()): { start: string; end: string } {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const start = new Date(end.getFullYear(), end.getMonth() - 2, 1);
  return { start: isoDay(start), end: isoDay(end) };
}

/**
 * Loads a made-up report. The people, organizations and numbers are invented in this browser tab, so no real
 * report is read. The generator is downloaded only when someone asks for the sample.
 */
export async function loadSample(): Promise<boolean> {
  const { setLoading, setError } = useApp.getState();
  setError(null);
  setLoading({ label: t('Making a sample report…'), fraction: 0, rows: 0 });
  try {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    const [{ generateDemo }, { sampleCollection }] = await Promise.all([import('../lib/demo/generate'), import('../lib/demo/github')]);
    const { csv } = generateDemo(sampleRange());
    // Empty vars make the top bar translate the name when the language changes.
    return await loadSources([{ name: SAMPLE_FILE_NAME, data: csv }], { text: msg('Sample report (made-up data)'), vars: {} }, {
      sample: true,
      sampleGitHub: (store) => sampleCollection(store),
    });
  } catch (error) {
    setError(error instanceof Error ? error.message : String(error));
    setLoading(null);
    return false;
  }
}
