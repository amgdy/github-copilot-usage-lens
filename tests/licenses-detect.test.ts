import { describe, expect, it } from 'vitest';
import { ColumnError, buildStore } from '../src/lib/csv/ingest';
import { SNIFF_CHARS, classifyUpload, looksLikeLicenseFile, parseLicenseFile } from '../src/lib/licenses';
import { CSV_HEADER, makeCsv, type RowSpec } from './helpers';

/** A seat the way GitHub writes it, with the full set of assignee fields (about 1.5 KB of JSON per seat). */
function bigSeat(login: string): Record<string, unknown> {
  const url = (path: string): string => `https://api.github.com/users/${login}${path}`;
  return {
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-02-01T09:00:00Z',
    pending_cancellation_date: null,
    last_activity_at: '2026-03-20T09:00:00Z',
    last_activity_editor: 'vscode/1.97.1/copilot-chat/0.24.1',
    last_authenticated_at: '2026-03-21T09:00:00Z',
    plan_type: 'business',
    assignee: {
      login,
      id: 1000,
      node_id: 'MDQ6VXNlcjEwMDA=',
      avatar_url: `https://avatars.githubusercontent.com/u/1000?v=4`,
      gravatar_id: '',
      url: url(''),
      html_url: `https://github.com/${login}`,
      followers_url: url('/followers'),
      following_url: url('/following{/other_user}'),
      gists_url: url('/gists{/gist_id}'),
      starred_url: url('/starred{/owner}{/repo}'),
      subscriptions_url: url('/subscriptions'),
      organizations_url: url('/orgs'),
      repos_url: url('/repos'),
      events_url: url('/events{/privacy}'),
      received_events_url: url('/received_events'),
      type: 'User',
      site_admin: false,
    },
    assigning_team: { id: 7, slug: 'core', name: 'core', description: null },
  };
}

const seats = (seatCount: number): Record<string, unknown>[] => Array.from({ length: seatCount }, (_, seatIndex) => bigSeat(`user${String(seatIndex).padStart(3, '0')}`));

const ACTIVITY = [
  '"Report_Time","Login","Last Authenticated At","Last Activity At","Last Surface Used"',
  '"2026-03-31 06:00:00 UTC","user001","2026-03-30T08:00:00Z","2026-03-29T10:15:00Z","vscode/1.97.1/copilot-chat/0.24.1"',
  '"2026-03-31 06:00:00 UTC","user002","","",""',
].join('\n');

const usageRows = (rowCount: number): RowSpec[] =>
  Array.from({ length: rowCount }, (_, rowIndex) => ({ date: `2026-03-${String((rowIndex % 28) + 1).padStart(2, '0')}`, user: `user${String(rowIndex % 17).padStart(3, '0')}`, gross: 1 + (rowIndex % 5) }));

const LICENSE_SAMPLES: Record<string, string> = {
  'REST object': JSON.stringify({ total_seats: 2, seats: seats(2) }),
  'pretty REST object': JSON.stringify({ total_seats: 2, seats: seats(2) }, null, 2),
  'REST object with BOM and spaces': `\uFEFF  \n${JSON.stringify({ total_seats: 2, seats: seats(2) })}`,
  'bare array': JSON.stringify(seats(3)),
  'pretty bare array': JSON.stringify(seats(3), null, 2),
  'slurped pages': JSON.stringify([{ total_seats: 3, seats: seats(2) }, { total_seats: 3, seats: seats(1) }]),
  'paginated pages': JSON.stringify({ total_seats: 4, seats: seats(2) }) + '\n' + JSON.stringify({ total_seats: 4, seats: seats(2) }),
  'NDJSON': seats(3).map((seat) => JSON.stringify(seat)).join('\n'),
  'one seat': JSON.stringify(seats(1)[0]),
  'empty answer': '{"total_seats":0,"seats":[]}',
  'Activity report': ACTIVITY,
  'Activity report with BOM': `\uFEFF${ACTIVITY}`,
  'Activity report with semicolons': ACTIVITY.replace(/","/g, '";"'),
  'CSV with plan and org': 'login,plan,org\nuser001,business,acme\nuser002,enterprise,acme\n',
  'CSV with username and plan_type': 'Username;Plan Type\nuser001;business\n',
  'CSV with dates but no date column': 'login,created_at,last_activity_at\nuser001,2025-01-01,2026-03-01\n',
  'one-column CSV': 'login\nuser001\nuser002\n',
  'login list': 'user001\nuser002\nuser003\n',
  'login list with comments': '# seats\nuser001\n// note\nuser002\n',
};

describe('classifyUpload: usage reports are never license files', () => {
  const COLUMN_SETS: string[][] = [
    [...CSV_HEADER],
    ['date', 'username', 'gross_amount'],
    ['date', 'username', 'quantity'],
    ['date', 'username', 'model', 'net_amount'],
    ['date', 'model', 'gross_amount'],
    ['date', 'gross_amount'],
    ['date', 'username'],
    ['username', 'quantity'],
    ['date', 'username', 'organization', 'total_monthly_quota'],
  ];

  it('knows the real usage header, with and without a BOM, for every set of columns', () => {
    for (const columns of COLUMN_SETS) {
      for (const withByteOrderMark of [true, false]) {
        const text = makeCsv(usageRows(6), { columns, bom: withByteOrderMark });
        const label = `${columns.join(',')} bom=${withByteOrderMark}`;
        expect(classifyUpload(text), label).toBe('usage');
        expect(looksLikeLicenseFile(text), label).toBe(false);
        expect(classifyUpload(text, 'AIUsageReport_1_abc.csv'), label).toBe('usage');
        expect(classifyUpload(text, 'usage.txt'), label).toBe('usage');
        expect(parseLicenseFile(text).kind, label).toBe('unknown');
      }
    }
  });

  it('knows a large usage report, judged by its first kilobytes only', () => {
    const text = makeCsv(usageRows(4000));
    expect(text.length).toBeGreaterThan(SNIFF_CHARS * 20);
    expect(classifyUpload(text)).toBe('usage');
    expect(looksLikeLicenseFile(text)).toBe(false);
  });

  it('knows header spellings: case, spaces, quotes, other delimiters', () => {
    const headers = [
      'date,username,gross_amount',
      'Date,Username,Gross Amount',
      'DATE;USERNAME;GROSS_AMOUNT',
      '"Date"\t"User Name"\t"Quantity"',
      'usage_date,user,quantity',
      'Day,Login,Net Amount',
      '\uFEFFdate,username,model',
      '"date","username","product","sku","model"',
      'username,model',
      'login,gross_amount',
      'login,org,quantity',
    ];
    for (const header of headers) {
      const text = `${header}\n2026-03-01,user001,1\n`;
      expect(classifyUpload(text), header).toBe('usage');
      expect(looksLikeLicenseFile(text), header).toBe(false);
    }
  });

  it('treats a date next to a login as a usage report, even without the amount columns', () => {
    for (const header of ['date,login', 'date,user', 'date;username;org', 'usage_date,login,plan']) {
      expect(classifyUpload(`${header}\n2026-03-01,user001\n`), header).toBe('usage');
    }
  });

  it('never calls a part of a usage report a license file', () => {
    const text = makeCsv(usageRows(40));
    for (let prefixLength = 0; prefixLength <= 600; prefixLength++) {
      const part = text.slice(0, prefixLength);
      expect(classifyUpload(part), `prefix ${prefixLength}`).not.toBe('license');
      expect(classifyUpload(part, 'x.csv'), `prefix ${prefixLength} .csv`).not.toBe('license');
    }
    for (let prefixLength = 600; prefixLength < text.length; prefixLength += 97) expect(classifyUpload(text.slice(0, prefixLength)), `prefix ${prefixLength}`).toBe('usage');
  });

  it('never calls a usage report with any of its rows removed a license file', () => {
    const lines = makeCsv(usageRows(8)).split('\n');
    for (let drop = 1; drop < lines.length; drop++) {
      const text = lines.filter((_, lineIndex) => lineIndex !== drop).join('\n');
      expect(classifyUpload(text), `drop ${drop}`).toBe('usage');
    }
  });
});

describe('classifyUpload: license files are never usage reports', () => {
  it('knows every license format', () => {
    for (const [name, text] of Object.entries(LICENSE_SAMPLES)) {
      expect(classifyUpload(text), name).toBe('license');
      expect(looksLikeLicenseFile(text), name).toBe(true);
      expect(classifyUpload(text, 'seats.json'), name).not.toBe('usage');
      expect(classifyUpload(text, 'copilot_activity_report.csv'), name).not.toBe('usage');
      expect(parseLicenseFile(text).kind, name).not.toBe('unknown');
    }
  });

  it('the usage ingest rejects every license file, so a license file cannot load as a usage report', async () => {
    for (const [name, text] of Object.entries(LICENSE_SAMPLES)) {
      await expect(buildStore([{ name: `${name}.csv`, data: text }]), name).rejects.toBeInstanceOf(ColumnError);
    }
  });

  it('knows a license file from its first kilobytes: a large REST file, and one cut in the middle of a record', () => {
    const text = JSON.stringify({ total_seats: 5000, seats: seats(5000) });
    expect(text.length).toBeGreaterThan(SNIFF_CHARS * 100);
    expect(classifyUpload(text)).toBe('license');
    for (const cutPosition of [60, 200, 1500, SNIFF_CHARS - 1, SNIFF_CHARS + 1, 6000]) {
      expect(classifyUpload(text.slice(0, cutPosition)), `cut ${cutPosition}`).toBe('license');
    }
    const flat = [seats(60)[59]].concat(seats(60)).map((seat) => JSON.stringify(seat)).join('\n');
    expect(classifyUpload(flat.slice(0, 5000))).toBe('license');
  });

  it('knows a large Activity report and a large login list', () => {
    const rows = Array.from({ length: 5000 }, (_, rowIndex) => `"2026-03-31 06:00:00 UTC","user${rowIndex}","2026-03-30T08:00:00Z","2026-03-29T10:15:00Z","vscode/1.97.1/copilot-chat/0.24.1"`);
    expect(classifyUpload([ACTIVITY.split('\n')[0], ...rows].join('\n'))).toBe('license');
    const list = Array.from({ length: 50_000 }, (_, loginIndex) => `user${loginIndex}`).join('\n');
    expect(classifyUpload(list)).toBe('license');
    expect(classifyUpload(list, 'logins.txt')).toBe('license');
  });

  it('reads a plain list by its name when the layout is ambiguous', () => {
    const line = 'user001, user002, user003';
    expect(classifyUpload(line, 'logins.txt')).toBe('license');
    expect(classifyUpload(line, 'seats.list')).toBe('license');
    expect(classifyUpload(line)).toBe('unknown');
    expect(classifyUpload('user001', 'logins.txt')).toBe('license');
    expect(classifyUpload('user001')).toBe('unknown');
    expect(classifyUpload('user001\nuser002')).toBe('license');
  });

  it('does not take a list with too much junk for a license file', () => {
    expect(classifyUpload('user001\nfoo.bar\nuser@example.com\n')).toBe('unknown');
    expect(classifyUpload('foo.bar user@example.com -bad user001 x.y', 'notes.txt')).toBe('unknown');
  });
});

describe('classifyUpload: other files', () => {
  it('leaves everything else to the caller and does not throw', () => {
    const others = [
      '',
      '   ',
      '\uFEFF',
      'hello',
      'name,age\nAda,36\nBo,40\n',
      '{"foo":1}',
      '[1,2,3]',
      '[{"a":1}]',
      '<html><body>hi</body></html>',
      '\u0000\u0001\u0002\u0003',
      '"',
      ',,,,',
      'date\n2026-03-01\n',
      'gross_amount\n1\n',
      'x'.repeat(10_000),
    ];
    for (const text of others) {
      for (const name of [undefined, 'a.csv', 'a.json', 'a.txt']) {
        let kind: string | undefined;
        expect(() => {
          kind = classifyUpload(text, name);
        }, `${text.slice(0, 20)} ${name}`).not.toThrow();
        expect(['usage', 'license', 'unknown']).toContain(kind);
      }
    }
    expect(classifyUpload('name,age\nAda,36\nBo,40\n')).toBe('unknown');
    expect(classifyUpload('{"foo":1}')).toBe('unknown');
    expect(classifyUpload('')).toBe('unknown');
    expect(classifyUpload('date\n2026-03-01\n')).toBe('unknown');
  });

  it('only reads the first kilobytes, so a huge file costs the same as a small one', () => {
    const samples = [
      `{"total_seats":1,"seats":[{"assignee":{"login":"user001"}}]}${' '.repeat(20_000_000)}`,
      `"date","username","gross_amount"\n${'x'.repeat(20_000_000)}`,
      `login\n${'user001\n'.repeat(2_000_000)}`,
    ];
    for (const text of samples) {
      let best = Infinity;
      for (let i = 0; i < 3; i++) {
        const startMs = performance.now();
        classifyUpload(text);
        best = Math.min(best, performance.now() - startMs);
      }
      expect(best).toBeLessThan(100);
    }
  });
});

describe('classifyUpload: GitHub data files', () => {
  const headerLine = JSON.stringify({ kind: 'header', format: 'github-copilot-usage-lens-data', version: 1, scope: 'enterprise', startedAt: '2026-10-02T08:00:00Z' });
  const seatLine = JSON.stringify({ kind: 'seat', scope: 'enterprise', target: 'octocorp', record: { assignee: { login: 'user001' }, plan_type: 'business', last_activity_at: null } });

  it('knows the file by its header line, with and without a BOM', () => {
    expect(classifyUpload(`${headerLine}\n`)).toBe('collection');
    expect(classifyUpload(`\uFEFF${headerLine}\n${seatLine}\n`, 'usage-lens-data.ndjson')).toBe('collection');
    expect(classifyUpload(`${headerLine}\r\n${seatLine}\r\n`, 'data.txt')).toBe('collection');
  });

  it('never takes the seat records that follow the header for a license file', () => {
    const text = [headerLine, ...Array.from({ length: 200 }, () => seatLine)].join('\n');
    expect(classifyUpload(text)).toBe('collection');
    expect(classifyUpload(text, 'seats.json')).toBe('collection');
  });

  it('needs both the header kind and the format on the first line', () => {
    expect(classifyUpload(JSON.stringify({ kind: 'header', format: 'something-else' }))).toBe('unknown');
    expect(classifyUpload(JSON.stringify({ format: 'github-copilot-usage-lens-data' }))).toBe('unknown');
    expect(classifyUpload(`${seatLine}\n${headerLine}\n`)).not.toBe('collection');
    expect(classifyUpload(`"date","username"\n${headerLine}\n`)).not.toBe('collection');
  });
});
