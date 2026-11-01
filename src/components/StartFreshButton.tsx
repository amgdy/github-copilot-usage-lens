import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../i18n';
import { savedKeys } from '../state/savedData';
import { closingLines, startFresh } from '../state/startFresh';
import { useApp } from '../state/store';
import { Dialog, Toggle, cx } from './ui';

interface ButtonProps {
  /** "link" for a quiet text link, "button" for a normal button. */
  look?: 'link' | 'button';
  className?: string;
  /** Runs before the question opens, for example to close the menu the button sits in. */
  onOpen?: () => void;
}

/** Asks "Start fresh?" in the one dialog of the app shell. Turned off while files are loading. */
export function StartFreshButton({ look = 'button', className, onOpen }: ButtonProps) {
  const open = useApp((state) => state.setStartFreshOpen);
  const busy = useApp((state) => state.loading !== null);
  return (
    <button
      type="button"
      disabled={busy}
      className={cx(
        look === 'link' ? 'inline-flex items-center gap-1 text-fg-muted underline-offset-2 hover:text-accent hover:underline disabled:opacity-50' : 'btn',
        className,
      )}
      onClick={() => {
        onOpen?.();
        open(true);
      }}
      title={t('Close the loaded files and go back to the start page.')}
    >
      <RotateCcw size={look === 'link' ? 11 : 14} aria-hidden /> {t('Start fresh')}
    </button>
  );
}

/**
 * Closes everything loaded in this tab after one question, and can also delete the settings saved in this browser.
 * It lists what is closed, so nobody loses a report by surprise. Cancel has the focus, so Enter does not close anything.
 */
export function StartFreshDialog() {
  const open = useApp((state) => state.startFreshOpen);
  const setOpen = useApp((state) => state.setStartFreshOpen);
  const dataset = useApp((state) => state.dataset);
  const collection = useApp((state) => state.collection);
  const cancel = useRef<HTMLButtonElement>(null);
  const [deleteSaved, setDeleteSaved] = useState(false);
  if (!open) return null;

  const close = () => {
    setOpen(false);
    setDeleteSaved(false);
  };
  const hasSaved = savedKeys().length > 0;
  const lines = closingLines(dataset, collection);
  return (
    <Dialog
      open
      onClose={close}
      role="alertdialog"
      title={t('Start fresh')}
      initialFocus={cancel}
      footer={
        <>
          <button ref={cancel} type="button" className="btn" onClick={close}>
            {t('Cancel')}
          </button>
          <button type="button" className="btn btn-danger" onClick={() => startFresh(deleteSaved && hasSaved)}>
            <RotateCcw size={14} aria-hidden /> {deleteSaved ? t('Start fresh and delete settings') : t('Start fresh')}
          </button>
        </>
      }
    >
      <p className="text-sm">{t('Close everything loaded in this tab and go back to the start page.')}</p>
      {lines.length > 0 ? (
        <>
          <h3 className="eyebrow mt-3">{t('What is closed')}</h3>
          <ul className="mt-1.5 space-y-1 text-sm">
            {lines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-xs bg-fg-subtle" aria-hidden />
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <p className="mt-3 text-xs text-fg-muted">{t('Nothing is deleted at GitHub or on your computer. You can load the same files again.')}</p>
      <div className="mt-3 border-t border-border pt-3">
        {hasSaved ? (
          <Toggle
            checked={deleteSaved}
            onChange={setDeleteSaved}
            label={t('Also delete the settings saved in this browser')}
            description={t('Your license list, budget, thresholds, price changes, theme, colors and language go back to the defaults. Export a settings file first if you may want them back.')}
          />
        ) : (
          <p className="text-xs text-fg-muted">{t('No settings are saved in this browser.')}</p>
        )}
      </div>
    </Dialog>
  );
}
