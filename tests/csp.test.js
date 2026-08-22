const fs = require('fs');
const path = require('path');
const { ALLOWED_FONT_HOSTS } = require('../src/context/DesignContext');

function cspOf(htmlPath) {
  const html = fs.readFileSync(path.join(__dirname, '..', htmlPath), 'utf8');
  const match = html.match(
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
  );
  expect(match).not.toBeNull();
  return match[1];
}

function directive(csp, name) {
  const dir = csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `));
  return dir ? dir.split(/\s+/).slice(1) : [];
}

describe.each(['index.html', 'public/404.html'])('CSP meta tag (%s)', (page) => {
  const csp = cspOf(page);

  test(`style-src allows exactly ${ALLOWED_FONT_HOSTS[0]} plus inline styles`, () => {
    expect(directive(csp, 'style-src')).toEqual(
      expect.arrayContaining([`https://${ALLOWED_FONT_HOSTS[0]}`, "'unsafe-inline'"]),
    );
  });

  test(`font-src allows exactly ${ALLOWED_FONT_HOSTS[1]}`, () => {
    expect(directive(csp, 'font-src')).toEqual(
      expect.arrayContaining([`https://${ALLOWED_FONT_HOSTS[1]}`]),
    );
  });

  test('locks down scripts, objects, and framing vectors', () => {
    expect(directive(csp, 'default-src')).toContain("'self'");
    expect(directive(csp, 'script-src')).toEqual(["'self'"]);
    expect(directive(csp, 'object-src')).toEqual(["'none'"]);
    expect(directive(csp, 'base-uri')).toEqual(["'self'"]);
    expect(directive(csp, 'form-action')).toEqual(["'self'"]);
    expect(csp).toContain('upgrade-insecure-requests');
  });
});
