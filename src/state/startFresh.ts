import { t } from '../i18n/core';
import type { Collection } from '../lib/collection/types';
import { useUploadNotice } from '../pages/data/uploads';
import { deleteSavedData } from './savedData';
import { datasetLabel, useApp, type Dataset } from './store';

/** What "Start fresh" closes, one line each, so people see it before they agree. */
export function closingLines(dataset: Pick<Dataset, 'label' | 'labelVars' | 'sample'> | null, collection: Pick<Collection, 'fileName'> | null): string[] {
  const lines: string[] = [];
  if (dataset) lines.push(dataset.sample ? t('The sample report') : t('Usage report: {name}', { name: datasetLabel(dataset) }));
  if (collection) lines.push(t('GitHub data file: {name}', { name: collection.fileName }));
  return lines;
}

/**
 * Closes everything loaded in this tab and shows the start page. The next report opens on the overview. With
 * `deleteSaved`, every setting saved in this browser is deleted too, and the app opens again from the start so the
 * theme, the colors and the language go back to their defaults.
 */
export function startFresh(deleteSaved: boolean): void {
  if (deleteSaved) {
    deleteSavedData();
    window.location.replace(window.location.pathname);
    return;
  }
  useApp.getState().closeData();
  useUploadNotice.getState().show(null);
  if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
}
