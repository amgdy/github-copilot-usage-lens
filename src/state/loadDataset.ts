import { msg, t, type Vars } from '../i18n/core';
import { prepareStore } from '../lib/analytics/prepare';
import type { TextSource } from '../lib/csv/ingest';
import { ingestSources } from '../lib/csv/ingestClient';
import type { Collection } from '../lib/collection/types';
import type { DataStore } from '../lib/types';
import { useApp } from './store';

/** A dataset name. With `vars`, `text` is English with {placeholders} that is translated when shown. */
export interface LabelText {
  text: string;
  vars?: Vars;
}

export function labelFromNames(names: string[]): LabelText {
  if (names.length === 1) return { text: names[0] };
  if (names.length === 2) return { text: `${names[0]} + ${names[1]}` };
  return { text: msg('{n} files'), vars: { n: names.length } };
}

const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export interface LoadOptions {
  /** A file batch owns the loading state until its other files finish. */
  keepLoading?: boolean;
  /** Marks the dataset as the made-up sample report. */
  sample?: boolean;
  /** Builds the made-up GitHub data of the sample from its usage report. */
  sampleGitHub?: (store: DataStore) => Collection;
}

/** Parses the sources, prepares them for analysis and makes them the active dataset. Resolves true on success. */
export async function loadSources(sources: TextSource[], label: LabelText = labelFromNames(sources.map((source) => source.name)), options: LoadOptions = {}): Promise<boolean> {
  const { setLoading, setError, setDataset, dataVersion } = useApp.getState();
  const isCurrent = () => useApp.getState().dataVersion === dataVersion;
  setError(null);
  setLoading({ label: t('Reading…'), fraction: 0, rows: 0 });
  try {
    const store = await ingestSources(sources, {
      onProgress: (progress) => {
        if (!isCurrent()) return;
        setLoading({
          label: progress.fileCount > 1 ? t('Reading {file} ({i} of {n})', { file: progress.file, i: progress.fileIndex + 1, n: progress.fileCount }) : t('Reading {file}', { file: progress.file }),
          fraction: progress.fraction,
          rows: progress.rows,
        });
      },
    });
    if (!isCurrent()) return false;
    if (store.n === 0) throw new Error(t('No usage rows were found. Is this an AI usage report export (CSV)?'));
    setLoading({ label: t('Preparing the analysis…'), fraction: 1, rows: store.n });
    await nextFrame();
    if (!isCurrent()) return false;
    const prepared = prepareStore(store);
    const sampleGitHub = options.sample && options.sampleGitHub ? options.sampleGitHub(store) : undefined;
    setDataset({
      store,
      prep: prepared,
      label: label.text,
      labelVars: label.vars,
      loadedAt: Date.now(),
      ...(options.sample ? { sample: true } : {}),
      ...(sampleGitHub ? { sampleGitHub } : {}),
    });
    return true;
  } catch (error) {
    if (isCurrent()) setError(error instanceof Error ? error.message : String(error));
    return false;
  } finally {
    if (isCurrent() && !options.keepLoading) setLoading(null);
  }
}

export function loadFiles(files: File[], options: LoadOptions = {}): Promise<boolean> {
  return loadSources(files.map((file) => ({ name: file.name, data: file })), undefined, options);
}
