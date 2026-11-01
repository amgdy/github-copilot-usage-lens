import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EnrichmentCard } from '../src/pages/data/EnrichmentCard';
import { LicenseImport } from '../src/pages/licenses/LicenseImport';

const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('license export guidance', () => {
  it('recommends the activity report before the advanced REST API on the Data page', () => {
    const text = textOf(renderToStaticMarkup(createElement(EnrichmentCard)));

    expect(text.indexOf('GitHub Copilot activity report')).toBeLessThan(text.indexOf('Seat list from the GitHub REST API'));
    expect(text).toContain('Recommended for most admins');
    expect(text).toContain('Advanced');
    expect(text).toContain('Check the scope and seat count before acting.');
  });

  it('shows no-code UI steps first and keeps CLI commands under the advanced details', () => {
    const html = renderToStaticMarkup(createElement(LicenseImport, { compact: false }));
    const text = textOf(html);
    const advancedAt = text.indexOf('Advanced: seat assignments API (JSON)');

    expect(text).toContain('Download the activity report in GitHub. No command is needed.');
    expect(text).toContain('Organization: open Settings, GitHub Copilot, Access');
    expect(text).toContain('Enterprise: open Billing and licensing, Licensing');
    expect(text.indexOf('Compare its seat count with GitHub before acting.')).toBeLessThan(advancedAt);
    expect(advancedAt).toBeGreaterThan(-1);
    expect(text.indexOf('gh api --paginate /orgs/ORG/copilot/billing/seats')).toBeGreaterThan(advancedAt);
    expect(text).toContain('activity older than 90 days also appears blank.');
    expect(text).toContain('It does not avoid the 90-day activity limit.');
  });

  it('points to collector commands and explains cost center assignments already used', () => {
    const text = textOf(renderToStaticMarkup(createElement(EnrichmentCard)));
    expect(text).toContain('Run the collector script with the command from the GitHub data file card, then load its file.');
    expect(text).toContain('The Budgets page lists each budget');
    expect(text).toContain('The Budgets page uses their user, team and organization assignments');
    expect(text).toContain('shows their included credit pool controls.');
    expect(text).not.toContain('Not read yet');
  });
});
