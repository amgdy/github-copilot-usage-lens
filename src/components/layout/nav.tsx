import {
  BookOpen,
  Building2,
  CalendarDays,
  Cpu,
  Database,
  Gauge,
  HandCoins,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Settings2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { PageId } from '../../state/router';
import { msg, t } from '../../i18n';

export interface NavItem {
  id: PageId;
  label: string;
  Icon: LucideIcon;
  /** One-line explanation shown as a tooltip and on the page header. */
  hint: string;
  group: 'Insights' | 'Drill down' | 'Act' | 'Data';
}

/** Labels, hints and group names are English text keys. Translate them with t() when shown. */
export const NAV: NavItem[] = [
  { id: 'overview', label: msg('Overview'), Icon: LayoutDashboard, hint: msg('Summary for managers: usage, pool health and the top actions'), group: 'Insights' },
  { id: 'spend', label: msg('Usage and pool'), Icon: Wallet, hint: msg('Included credits, usage, overage, forecast and budgets'), group: 'Insights' },
  { id: 'budgets', label: msg('Budgets'), Icon: HandCoins, hint: msg('AI budgets at GitHub: how much is used, which run out and who is stopped'), group: 'Insights' },
  { id: 'recommendations', label: msg('Recommendations'), Icon: Lightbulb, hint: msg('Actions sorted by value, a savings simulator and a playbook'), group: 'Act' },
  { id: 'licenses', label: msg('Licenses'), Icon: KeyRound, hint: msg('Seats from your license list: who uses them, who does not, and seats you can free up'), group: 'Act' },
  { id: 'users', label: msg('Users'), Icon: Users, hint: msg('Rankings, tokens, Auto use and details for each user'), group: 'Drill down' },
  { id: 'segments', label: msg('Segments'), Icon: Layers, hint: msg('User groups: usage tiers, personas and habits'), group: 'Drill down' },
  { id: 'models', label: msg('Models'), Icon: Cpu, hint: msg('Models, vendors, Auto use and the Auto discount'), group: 'Drill down' },
  { id: 'efficiency', label: msg('Efficiency'), Icon: Gauge, hint: msg('Cache, context size and model choice checks'), group: 'Drill down' },
  { id: 'organization', label: msg('Organization'), Icon: Building2, hint: msg('Organizations, cost centers, repositories and chargeback'), group: 'Drill down' },
  { id: 'patterns', label: msg('Patterns'), Icon: CalendarDays, hint: msg('Weekday pattern, calendar and unusual days'), group: 'Drill down' },
  { id: 'data', label: msg('Data'), Icon: Database, hint: msg('Files, quality checks and raw rows'), group: 'Data' },
  { id: 'settings', label: msg('Settings'), Icon: Settings2, hint: msg('Limits, license list, budget, model prices and theme'), group: 'Data' },
  { id: 'methodology', label: msg('Methodology'), Icon: BookOpen, hint: msg('How every number in the report is calculated'), group: 'Data' },
];

export const NAV_GROUPS: NavItem['group'][] = ['Insights', 'Act', 'Drill down', 'Data'];

/** Group names in the current language. */
export const groupLabel = (group: NavItem['group']): string =>
  ({ Insights: t('Insights'), Act: t('Act'), 'Drill down': t('Drill down'), Data: t('Data') })[group];

export const navItem = (id: PageId): NavItem => NAV.find((item) => item.id === id) ?? NAV[0];
