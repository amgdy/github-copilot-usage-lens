import { useMemo } from 'react';
import { Card, DataTable, type Column } from '../../components/ui';
import { msg, t } from '../../i18n';
import type { AuditEvent } from '../../lib/collection';
import { fmtDay, parseIsoDay } from '../../lib/utils/date';

const ACTIONS: Record<string, string> = {
  budget_created: msg('Budget added'),
  budget_updated: msg('Budget changed'),
  budget_deleted: msg('Budget removed'),
};

/** "Budget changed" for "business.budget_updated". Unknown actions keep their GitHub name. */
function actionName(action: string): string {
  const key = action.slice(action.lastIndexOf('.') + 1);
  return key in ACTIONS ? t(ACTIONS[key]) : action;
}

/** Budget changes from the audit log, newest first. */
export function BudgetChangesCard({ changes }: { changes: AuditEvent[] }) {
  const rows = useMemo(() => changes.map((event, index) => ({ ...event, index })), [changes]);
  const columns = useMemo<Column<AuditEvent & { index: number }>[]>(
    () => [
      { key: 'day', header: t('Day'), value: (event) => event.day ?? '', render: (event) => (event.day ? fmtDay(parseIsoDay(event.day), true) : '–') },
      { key: 'action', header: t('Change'), value: (event) => actionName(event.action) },
      { key: 'org', header: t('Organization'), value: (event) => event.org ?? '–' },
      { key: 'user', header: t('Changed by'), value: (event) => event.user ?? '–' },
    ],
    [],
  );
  return (
    <Card title={t('Budget changes')} calc="budget-changes" subtitle={t('Budgets that were added, changed or removed, from the audit log.')}>
      {rows.length === 0 ? (
        <p className="text-sm text-fg-muted">{t('The audit log has no budget changes.')}</p>
      ) : (
        <DataTable rows={rows} columns={columns} rowKey={(event) => String(event.index)} pageSize={10} exportName="github-copilot-budget-changes" dense />
      )}
    </Card>
  );
}
