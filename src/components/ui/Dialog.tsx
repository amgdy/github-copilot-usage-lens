import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cx } from './cx';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** The buttons at the bottom, for example Cancel and the action. */
  footer: ReactNode;
  /** Gets the focus when the dialog opens. The dialog box gets it when this is not set. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** `alertdialog` when the dialog asks people to confirm an action. */
  role?: 'dialog' | 'alertdialog';
  /** Tailwind width classes. */
  widthClass?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modal box in the middle of the screen. Closes on Escape or a click on the backdrop, keeps Tab inside and restores focus on close. */
export function Dialog({ open, onClose, title, children, footer, initialFocus, role = 'dialog', widthClass = 'w-[min(480px,calc(100vw-2rem))]' }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // The latest onClose, so a new function on every render does not move the focus back to the start.
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    (initialFocus?.current ?? panel.current)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [open, initialFocus]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="anim-fade absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={() => close.current()} aria-hidden />
      <div
        ref={panel}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx('anim-fade relative flex max-h-[calc(100vh-2rem)] flex-col rounded-xl border border-border bg-bg shadow-drawer outline-none', widthClass)}
      >
        <header className="border-b border-border bg-surface px-4 py-3">
          <h2 id={titleId} className="font-display text-base">
            {title}
          </h2>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-4 py-3">{footer}</footer>
      </div>
    </div>,
    document.body,
  );
}
