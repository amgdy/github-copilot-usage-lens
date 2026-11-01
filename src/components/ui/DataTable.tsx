import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown, Columns3, Download } from 'lucide-react';
import { downloadCsv } from '../../lib/utils/download';
import { fmtInt } from '../../lib/utils/format';
import { CalcInfo, CalcLegend, type CalcRef } from './CalcInfo';
import { cx } from './cx';
import { Popover, SearchInput, Select } from './Controls';
import { EmptyState } from './Primitives';
import { t } from '../../i18n';

type Cell = string | number | boolean | null | undefined;

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Plain value used for sorting, searching and the CSV export. */
  value: (row: T) => Cell;
  /** Custom cell content. Defaults to the plain value. */
  render?: (row: T) => ReactNode;
  /** `right` and `left` mean the end and start sides, so the table mirrors in Arabic. Use `right` (or `end`) for numbers. */
  align?: 'left' | 'right' | 'start' | 'end' | 'center';
  width?: string | number;
  sortable?: boolean;
  /** Tooltip for the header cell. */
  hint?: string;
  /** Id of the explanation of how the column is calculated. Shows a calculator icon in the header. */
  calc?: CalcRef;
  /** Footer cell: static content, or a function of all rows that match the search. */
  total?: ReactNode | ((rows: T[]) => ReactNode);
  /** Start hidden; the user can enable the column from the Columns menu. */
  hidden?: boolean;
  csvHeader?: string;
  noCsv?: boolean;
  /** The key figure of the table, such as usage or billed: shown semibold so the eye finds it first. Use it on one column. */
  strong?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  defaultSort?: { key: string; dir: 'asc' | 'desc' };
  pageSize?: number;
  /** Show the search box. Pass a function to control what text is searched. */
  searchable?: boolean | ((row: T) => string);
  searchPlaceholder?: string;
  /** Shows the CSV export button; the value is the file name without extension. */
  exportName?: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  selectedKey?: string | number | null;
  emptyText?: ReactNode;
  dense?: boolean;
  /** Extra controls placed left of the search box. */
  toolbar?: ReactNode;
  /** Vertical scroll with a sticky header once the table is taller than this. */
  maxHeight?: number | string;
  /** Hides the column chooser. */
  fixedColumns?: boolean;
  className?: string;
}

const PAGE_SIZES = [10, 25, 50, 100, 250];

type Side = 'start' | 'end' | 'center';
const sideOf = (align: Column<unknown>['align']): Side => (align === 'right' || align === 'end' ? 'end' : align === 'center' ? 'center' : 'start');
const SIDE_TEXT: Record<Side, string> = { start: 'text-start', end: 'text-end', center: 'text-center' };

function compare(a: Cell, b: Cell): number {
  const firstNumber = typeof a === 'number' ? a : typeof a === 'boolean' ? Number(a) : NaN;
  const secondNumber = typeof b === 'number' ? b : typeof b === 'boolean' ? Number(b) : NaN;
  if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber)) return firstNumber - secondNumber;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
}

const isBlank = (value: Cell): boolean => value === null || value === undefined || value === '' || (typeof value === 'number' && !Number.isFinite(value));

/** Sortable, searchable, paginated table with column chooser and CSV export. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  defaultSort,
  pageSize: initialPageSize = 25,
  searchable,
  searchPlaceholder = t('Search table…'),
  exportName,
  onRowClick,
  rowClassName,
  selectedKey,
  emptyText = t('No rows to show.'),
  dense,
  toolbar,
  maxHeight,
  fixedColumns,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(defaultSort ?? null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((column) => column.hidden).map((column) => column.key)));

  const visible = useMemo(() => columns.filter((column) => !hidden.has(column.key)), [columns, hidden]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return rows;
    const text =
      typeof searchable === 'function'
        ? searchable
        : (row: T) =>
            visible
              .map((column) => column.value(row))
              .filter((value) => !isBlank(value))
              .join(' ');
    return rows.filter((row) => {
      const rowText = text(row).toLowerCase();
      return terms.every((term) => rowText.includes(term));
    });
  }, [rows, query, searchable, visible]);

  const sorted = useMemo(() => {
    const sortColumn = sort ? columns.find((column) => column.key === sort.key) : undefined;
    if (!sort || !sortColumn) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const keyed = filtered.map((row, index) => ({ r: row, i: index, v: sortColumn.value(row) }));
    keyed.sort((a, b) => {
      const aIsBlank = isBlank(a.v);
      const bIsBlank = isBlank(b.v);
      if (aIsBlank || bIsBlank) return aIsBlank === bIsBlank ? a.i - b.i : aIsBlank ? 1 : -1;
      return compare(a.v, b.v) * dir || a.i - b.i;
    });
    return keyed.map((keyedRow) => keyedRow.r);
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => {
    if (page > pages - 1) setPage(pages - 1);
  }, [page, pages]);
  const current = Math.min(page, pages - 1);
  const shown = sorted.slice(current * pageSize, current * pageSize + pageSize);

  const toggleSort = (column: Column<T>) => {
    if (column.sortable === false) return;
    setSort((currentSort) => {
      if (currentSort?.key === column.key) return { key: column.key, dir: currentSort.dir === 'desc' ? 'asc' : 'desc' };
      const sample = rows.find((row) => !isBlank(column.value(row)));
      const numeric = sample !== undefined && typeof column.value(sample) !== 'string';
      return { key: column.key, dir: numeric ? 'desc' : 'asc' };
    });
    setPage(0);
  };

  const exportCsv = () => {
    const cols = visible.filter((column) => !column.noCsv);
    downloadCsv(
      exportName ?? 'table',
      cols.map((column) => column.csvHeader ?? (typeof column.header === 'string' ? column.header : column.key)),
      sorted.map((row) => cols.map((column) => column.value(row) ?? '')),
    );
  };

  const hasTotals = visible.some((column) => column.total !== undefined);
  const showToolbar = searchable || exportName || toolbar || !fixedColumns;
  const cellPadding = dense ? 'py-1' : 'py-2';

  return (
    <div className={cx('min-w-0', className)}>
      {showToolbar ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {toolbar}
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {searchable ? <SearchInput value={query} onChange={(nextQuery) => { setQuery(nextQuery); setPage(0); }} placeholder={searchPlaceholder} className="w-56" /> : null}
            {!fixedColumns && columns.length > 4 ? (
              <Popover
                trigger={(_open, toggle) => (
                  <button type="button" className="btn btn-sm" onClick={toggle} title={t('Choose columns')}>
                    <Columns3 size={14} /> {t('Columns')}
                  </button>
                )}
              >
                <div className="max-h-72 min-w-44 overflow-auto p-1">
                  {columns.map((column) => (
                    <label key={column.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-surface-3">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={!hidden.has(column.key)}
                        onChange={() =>
                          setHidden((currentHidden) => {
                            const nextHidden = new Set(currentHidden);
                            if (nextHidden.has(column.key)) nextHidden.delete(column.key);
                            else nextHidden.add(column.key);
                            return nextHidden;
                          })
                        }
                      />
                      <span className="truncate">{column.csvHeader ?? (typeof column.header === 'string' ? column.header : column.key)}</span>
                    </label>
                  ))}
                </div>
              </Popover>
            ) : null}
            {exportName ? (
              <button type="button" className="btn btn-sm" onClick={exportCsv} title={t('Download the filtered rows as CSV')}>
                <Download size={14} /> {t('CSV')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-auto rounded-lg border border-border" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full min-w-max text-start text-sm">
          <thead>
            <tr>
              {visible.map((column) => {
                const active = sort?.key === column.key;
                const sortable = column.sortable !== false;
                const side = sideOf(column.align);
                const head = sortable ? (
                  <button type="button" onClick={() => toggleSort(column)} className={cx('inline-flex items-center gap-1 hover:text-fg', side === 'end' && 'flex-row-reverse', active && 'text-fg')}>
                    {column.header}
                    {active ? sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ChevronsUpDown size={12} className="opacity-40" />}
                  </button>
                ) : (
                  column.header
                );
                return (
                  <th
                    key={column.key}
                    scope="col"
                    title={column.hint}
                    style={{ width: column.width }}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cx('sticky top-0 z-10 whitespace-nowrap border-b border-border bg-surface-2 px-3 py-2 text-xs font-medium text-fg-muted', SIDE_TEXT[side])}
                  >
                    {column.calc ? (
                      <span className={cx('inline-flex items-center gap-1', side === 'end' && 'flex-row-reverse')}>
                        {head}
                        <CalcInfo id={column.calc} />
                      </span>
                    ) : (
                      head
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (event) => (event.key === 'Enter' ? onRowClick(row) : undefined) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cx(onRowClick && 'cursor-pointer', 'hover:bg-surface-2', selectedKey === key && 'bg-accent-soft', rowClassName?.(row))}
                >
                  {visible.map((column) => {
                    const side = sideOf(column.align);
                    return (
                      <td key={column.key} className={cx('border-b border-border-muted px-3', cellPadding, SIDE_TEXT[side], side === 'end' && 'num', column.strong && 'font-semibold text-fg', column.className)}>
                        {column.render ? column.render(row) : (column.value(row) ?? '–')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {!shown.length ? (
              <tr>
                <td colSpan={Math.max(1, visible.length)}>
                  <EmptyState title={emptyText} />
                </td>
              </tr>
            ) : null}
          </tbody>
          {hasTotals && sorted.length ? (
            <tfoot>
              <tr>
                {visible.map((column, index) => (
                  <td key={column.key} className={cx('sticky bottom-0 border-t border-border bg-surface-2 px-3 py-2 text-xs font-semibold', sideOf(column.align) === 'end' && 'num text-end')}>
                    {column.total === undefined ? (index === 0 ? t('Total') : '') : typeof column.total === 'function' ? column.total(sorted) : column.total}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <CalcLegend
        className="mt-2"
        items={visible.filter((column) => column.calc).map((column) => ({ label: column.csvHeader ?? (typeof column.header === 'string' ? column.header : column.key), calc: column.calc as CalcRef }))}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-fg-muted">
        <span>
          {sorted.length === 0
            ? t('0 rows')
            : t('{from} to {to} of {total}', {
                from: fmtInt(current * pageSize + 1),
                to: fmtInt(Math.min(sorted.length, (current + 1) * pageSize)),
                total: fmtInt(sorted.length),
              })}
          {filtered.length !== rows.length ? ` ${t('(filtered from {n})', { n: fmtInt(rows.length) })}` : ''}
        </span>
        <div className="flex items-center gap-2">
          <Select
            aria-label={t('Rows per page')}
            className="!py-0.5 text-xs"
            value={pageSize}
            onChange={(nextPageSize) => { setPageSize(nextPageSize); setPage(0); }}
            order="given"
            options={PAGE_SIZES.map((size) => ({ value: size, label: t('{n} per page', { n: size }) }))}
          />
          <button type="button" className="btn btn-sm" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label={t('Previous page')}>
            <ChevronLeft size={14} className="rtl:-scale-x-100" />
          </button>
          <span className="num">
            {current + 1} / {pages}
          </span>
          <button type="button" className="btn btn-sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label={t('Next page')}>
            <ChevronRight size={14} className="rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </div>
  );
}
