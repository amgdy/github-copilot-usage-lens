import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RecommendationsPage from '../src/pages/RecommendationsPage';
import { AnalysisProvider } from '../src/state/analysis';
import { analyzeCsv, analyzeDemo, makeCsv, type Pipeline } from './helpers';
import { SEP_WEEKDAYS, terra } from './scenarios';

/**
 * The tab badges of the Recommendations page. The Seats badge counts the seats in the lists on that tab (idle, Enterprise seats
 * that fit Business and roster seats that never appear), not all seats, so it must say "to review" and never show a bare number
 * next to "Seats" that reads as the seat total.
 */

const render = (pipeline: Pipeline): string =>
  renderToStaticMarkup(
    createElement(AnalysisProvider, {
      dataset: { store: pipeline.store, prep: pipeline.prep, label: 'synthetic.csv', loadedAt: 0 },
      children: createElement(RecommendationsPage),
    }),
  );

const HINT = 'Seats in the lists on this tab: idle seats, Enterprise seats that fit Business and roster seats that never appear.';

/** The badge of the Seats tab: the text right after the "Seats" label. */
const seatsBadge = (html: string): RegExpMatchArray | null => html.match(/role="tab"[^>]*>(?:<svg[\s\S]*?<\/svg>)?Seats<span[^>]*title="([^"]*)"[^>]*>([^<]*)<\/span>/);

describe('Recommendations page: tab badges', () => {
  it('says "0 to review" on the Seats tab when two busy seats need no action', async () => {
    const days = SEP_WEEKDAYS.slice(0, 10);
    const pipeline = await analyzeCsv(makeCsv(days.flatMap((date) => [terra({ date, user: 'busy-1', gross: 1 }), terra({ date, user: 'busy-2', gross: 1 })])));
    const badge = seatsBadge(render(pipeline));
    expect(badge, 'Seats tab badge').not.toBeNull();
    expect(badge?.[2]).toBe('0 to review');
    expect(badge?.[1]).toBe(HINT);
  });

  it('counts the seats to review on the demo report', async () => {
    const pipeline = await analyzeDemo();
    const { idle, downgrade, unused } = pipeline.analysis.seats;
    const badge = seatsBadge(render(pipeline));
    expect(badge?.[2]).toBe(`${idle.length + downgrade.length + unused.length} to review`);
  });
});
