import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import copilotSpaceInstructions from '../../../docs/copilot-spaces-instructions.md?raw';
import { Dialog, Field, Select, Toggle } from '../../components/ui';
import { t } from '../../i18n';
import type { CopilotDataInput } from '../../lib/export/copilotData';
import { buildCopilotPrompt, COPILOT_TASKS, copilotTaskLabel, type CopilotTask } from '../../lib/export/copilotPrompt';
import { downloadText } from '../../lib/utils/download';
import { fmtInt } from '../../lib/utils/format';
import { useAnalysis } from '../../state/analysis';
import { describeFilters } from '../../state/filterChips';
import { CopyButton } from './CopyButton';

/** A rough rule: about four characters make one token. */
const CHARACTERS_PER_TOKEN = 4;

export function AskCopilotDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dataset, store, models, settings, taxonomy, analysis, github, filters } = useAnalysis();
  const [task, setTask] = useState<CopilotTask>('leadership');
  const [includeNames, setIncludeNames] = useState(false);
  useEffect(() => {
    if (!open) setIncludeNames(false);
  }, [open]);

  const input = useMemo<CopilotDataInput | null>(() => {
    if (!open) return null;
    const chips = describeFilters(filters, store, taxonomy);
    return {
      analysis,
      store,
      models,
      settings,
      taxonomy,
      github,
      label: dataset.label,
      filters: chips.filter((chip) => chip.id !== 'search').map((chip) => ({ group: chip.group, value: chip.value, user: chip.id.startsWith('users:') })),
      searchOmitted: chips.some((chip) => chip.id === 'search'),
      sample: Boolean(dataset.sample),
    };
  }, [open, analysis, store, models, settings, taxonomy, github, filters, dataset]);
  const built = useMemo(() => (input ? buildCopilotPrompt({ input, task, includeNames }) : null), [input, task, includeNames]);
  const prompt = built?.text ?? '';
  const options = COPILOT_TASKS.map((value) => ({ value, label: t(copilotTaskLabel(value)) }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('Prepare a prompt for GitHub Copilot')}
      widthClass="w-[min(760px,calc(100vw-2rem))]"
      footer={
        <>
          <button type="button" className="btn me-auto" onClick={() => downloadText('github-copilot-usage-lens-space-instructions.md', copilotSpaceInstructions, 'text/markdown;charset=utf-8')}>
            <Download size={14} aria-hidden /> {t('Download Space instructions')}
          </button>
          <button type="button" className="btn" onClick={() => downloadText(`github-copilot-usage-lens-prompt-${task}.md`, prompt, 'text/markdown;charset=utf-8')}>
            <Download size={14} aria-hidden /> {t('Download prompt')}
          </button>
          <button type="button" className="btn" onClick={onClose}>
            {t('Close')}
          </button>
          <CopyButton label={t('Copy prompt')} getText={() => prompt} />
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-fg-muted">{t('Choose a task, review the prompt, then copy it into GitHub Copilot. This app does not send your data.')}</p>
        <Field label={t('What should GitHub Copilot do?')}>
          <Select value={task} onChange={setTask} options={options} order="given" aria-label={t('What should GitHub Copilot do?')} className="w-full" />
        </Field>
        <Toggle
          checked={includeNames}
          onChange={setIncludeNames}
          label={t('Include real user names')}
          description={t('Off by default. When off, names are replaced with labels such as {alias}, in tables and in text.', { alias: built?.aliasExample ?? 'user-01' })}
        />
        <p className="text-xs text-fg-muted">
          {t('The prompt holds the data this task needs in a compact form, with clear rules and an answer format. For the best answer, pick a reasoning model and the highest thinking level that your GitHub Copilot client offers.')}
        </p>
        <Field label={t('Prompt preview')} hint={t('{chars} characters, about {tokens} tokens', { chars: fmtInt(prompt.length), tokens: fmtInt(Math.ceil(prompt.length / CHARACTERS_PER_TOKEN)) })}>
          <textarea readOnly value={prompt} aria-label={t('Prompt preview')} className="input min-h-64 w-full resize-y font-mono text-xs leading-relaxed" />
        </Field>
      </div>
    </Dialog>
  );
}
