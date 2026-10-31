import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Landing } from '../src/components/Landing';
import { BrandLink } from '../src/components/layout/Sidebar';

/** The start page has two ways in: your own files, or a sample report made from invented data. */
describe('start page', () => {
  const html = renderToStaticMarkup(createElement(Landing));
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const guide = text.slice(text.indexOf('Which files you can use'));

  it('lets people choose or drop their own files and says which types it takes', () => {
    expect(text).toContain('Drop your files here');
    expect(text).toContain('Choose files');
    expect(html).toMatch(/<input[^>]*type="file"[^>]*multiple/);
    const dropZone = text.slice(text.indexOf('Drop your files here'), text.indexOf('Choose files'));
    for (const type of ['.csv', '.json', '.txt', '.ndjson', '.ndjson.gz']) expect(dropZone).toContain(` ${type} `);
  });

  it('offers one sample report and says it is made up', () => {
    expect(text.match(/View a sample report/g)).toHaveLength(1);
    expect(text).toContain('The sample uses made-up people and numbers.');
  });

  it('puts your own files first and the sample second', () => {
    expect(text.indexOf('Choose files')).toBeLessThan(text.indexOf('View a sample report'));
  });

  it('puts the ways to open a report right after the title, so phones show them first', () => {
    expect(text.indexOf('See where your GitHub Copilot AI credits go')).toBeLessThan(text.indexOf('Choose files'));
    expect(text.indexOf('View a sample report')).toBeLessThan(text.indexOf('What you get'));
  });

  it('has a button, not a link, that leads to the file guide, so the address does not change', () => {
    expect(html).toMatch(/<button[^>]*>.*?Which file do I need\?<\/button>/s);
    expect(html).toMatch(/<h2 id="landing-files"[^>]*tabindex="-1"/);
  });

  it('lists the files in order: the usage report first, then the license list, then the GitHub data file', () => {
    expect(guide.indexOf('AI usage report')).toBeGreaterThan(-1);
    expect(guide.indexOf('AI usage report')).toBeLessThan(guide.indexOf('License list'));
    expect(guide.indexOf('License list')).toBeLessThan(guide.indexOf('GitHub data file'));
    expect(guide).toContain('Start here');
    expect(guide.match(/What it gives/g)).toHaveLength(3);
    expect(guide.match(/Where to get it/g)).toHaveLength(3);
  });

  it('shows the steps of the collector script in a closed section', () => {
    expect(html).toMatch(/<details[^>]*>\s*<summary[^>]*>.*Show the steps/s);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(text).toContain('curl -fsSL https://raw.githubusercontent.com/');
    expect(text).toContain('bash scripts/collect.sh');
  });

  it('shows the logo as the current page, with a name that says where it goes', () => {
    expect(html).toMatch(/<a [^>]*href="#\/"[^>]*aria-current="page"[^>]*aria-label="GitHub Copilot Usage Lens: start page"/);
  });

  it('never names or links files from the samples folder', () => {
    expect(html).not.toMatch(/samples\/|AIUsageReport_/);
  });
});

describe('logo link', () => {
  it('is a real link to the start page that keyboards and screen readers can use', () => {
    const html = renderToStaticMarkup(createElement(BrandLink));
    expect(html).toMatch(/^<a [^>]*href="#\/"/);
    expect(html).toContain('aria-label="GitHub Copilot Usage Lens: start page"');
    expect(html).toContain('title="Go to the start page"');
    expect(html).not.toContain('aria-current');
  });
});
