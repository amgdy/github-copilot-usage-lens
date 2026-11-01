import { useEffect, useState, type RefObject } from 'react';

interface Tip {
  lines: string[];
  x: number;
  y: number;
  below: boolean;
}

/** Room the tip needs above an element; nearer the top of the map it shows below the element instead. */
const ROOM_ABOVE = 48;
/** Keeps the tip this far from the sides of the map. */
const EDGE = 80;

/**
 * A small label over the glass under the pointer or the keyboard focus, read from its `data-tip` (lines split by a new
 * line). It listens on the map itself, so moving over the map renders only the tip.
 */
export function HoverTip({ figure }: { figure: RefObject<HTMLElement | null> }) {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    const element = figure.current;
    if (element === null) return;
    const show = (event: Event) => {
      const source = event.target instanceof Element ? event.target.closest('[data-tip]') : null;
      const text = source?.getAttribute('data-tip');
      if (source === null || source === undefined || !text || !element.contains(source)) {
        setTip(null);
        return;
      }
      const frame = element.getBoundingClientRect();
      const rect = source.getBoundingClientRect();
      const below = rect.top - frame.top < ROOM_ABOVE;
      const center = rect.left + rect.width / 2 - frame.left;
      setTip({
        lines: text.split('\n'),
        x: Math.max(Math.min(EDGE, frame.width / 2), Math.min(frame.width - Math.min(EDGE, frame.width / 2), center)),
        y: below ? rect.bottom - frame.top + 6 : rect.top - frame.top - 6,
        below,
      });
    };
    const hide = () => setTip(null);
    element.addEventListener('pointerover', show);
    element.addEventListener('focusin', show);
    element.addEventListener('pointerleave', hide);
    element.addEventListener('focusout', hide);
    return () => {
      element.removeEventListener('pointerover', show);
      element.removeEventListener('focusin', show);
      element.removeEventListener('pointerleave', hide);
      element.removeEventListener('focusout', hide);
    };
  }, [figure]);

  if (tip === null) return null;
  return (
    <div
      className="no-print pointer-events-none absolute z-30 max-w-[14rem] rounded-[4px] border border-border bg-surface px-2 py-1 text-xs"
      style={{ left: tip.x, top: tip.y, transform: `translate(-50%, ${tip.below ? '0' : '-100%'})` }}
      role="presentation"
    >
      {tip.lines.map((line, index) => (
        <p key={index} className={index === 0 ? 'truncate font-semibold' : 'num text-fg-muted'}>
          {line}
        </p>
      ))}
    </div>
  );
}
