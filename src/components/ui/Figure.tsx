import { Fragment, type ReactNode } from 'react';
import { localizeDigits } from '../../i18n';
import { splitFigures } from '../../lib/utils/figures';
import { cx } from './cx';

/** A figure that answers the question on screen, such as an amount or a limit: semibold, with even-width digits. */
export function Fig({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('fig', className)}>{children}</span>;
}

/**
 * A sentence with its money, percent and multiple figures set in `Fig`, so they stand out in a line of text. A figure typed
 * into the English text, such as "$20 per seat", gets the digits the reader chose too. Anything that is not a string is shown
 * as it is.
 */
export function Figures({ text }: { text: ReactNode }) {
  if (typeof text !== 'string') return <>{text}</>;
  const parts = splitFigures(text);
  if (!parts.some((part) => part.figure)) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => (part.figure ? <Fig key={index}>{localizeDigits(part.text)}</Fig> : <Fragment key={index}>{part.text}</Fragment>))}
    </>
  );
}
