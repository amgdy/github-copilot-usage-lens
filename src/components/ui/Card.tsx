import type { ReactNode } from 'react';
import { BarChart3 } from 'lucide-react';
import { EChart, type ChartClick, type EChartsOption } from '../charts/EChart';
import { CalcInfo, CalcLine, type CalcRef } from './CalcInfo';
import { cx } from './cx';
import { Figures } from './Figure';
import { EmptyState } from './Primitives';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Set to false for tables and charts that should touch the card edges. */
  padded?: boolean;
  /** Id (or ids) of the explanation of how the numbers in this card are calculated. Every chart needs one. */
  calc?: CalcRef;
}

export function Card({ title, subtitle, actions, footer, children, className, bodyClassName, padded = true, calc }: CardProps) {
  return (
    <section className={cx('card flex min-w-0 flex-col', className)}>
      {title || actions || calc ? (
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-border-muted px-4 py-2.5">
          {title || subtitle || calc ? (
            <div className="min-w-0 flex-1 basis-40">
              {title || calc ? (
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  {title}
                  {calc ? <CalcInfo id={calc} /> : null}
                </h3>
              ) : null}
              {subtitle ? (
                <p className="mt-0.5 text-xs text-fg-muted">
                  <Figures text={subtitle} />
                </p>
              ) : null}
              <CalcLine id={calc} className="mt-1" />
            </div>
          ) : null}
          {actions ? <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cx('min-w-0 flex-1', padded && 'p-4', bodyClassName)}>{children}</div>
      {footer ? <footer className="border-t border-border-muted px-4 py-2 text-xs text-fg-muted">{footer}</footer> : null}
    </section>
  );
}

export interface ChartCardProps extends Omit<CardProps, 'children' | 'padded'> {
  option: EChartsOption;
  height?: number | string;
  onClick?: (event: ChartClick) => void;
  /** File name (without extension). The default uses the stable calculation id. */
  exportName?: string;
  /** Alt text for the chart. */
  label?: string;
  /** Shows a message instead of the chart, e.g. when there is no data. */
  empty?: string | false;
}

const slug = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

/** A card with a single ECharts chart. */
export function ChartCard({ option, height = 280, onClick, exportName, label, empty, ...card }: ChartCardProps) {
  const calcId = typeof card.calc === 'string' ? card.calc : card.calc?.[0];
  const name = exportName ?? `github-copilot-${slug(calcId ?? (typeof card.title === 'string' ? card.title : 'chart')) || 'chart'}`;
  return (
    <Card {...card} bodyClassName="px-2 py-3">
      {empty ? (
        <div style={{ minHeight: typeof height === 'number' ? Math.min(height, 200) : 160 }} className="flex items-center justify-center">
          <EmptyState icon={<BarChart3 size={22} />} title={empty} />
        </div>
      ) : (
        <EChart option={option} height={height} onClick={onClick} exportName={name} label={label ?? (typeof card.title === 'string' ? card.title : undefined)} />
      )}
    </Card>
  );
}
