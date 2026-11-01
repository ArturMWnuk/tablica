// License policy for npm dependencies (NF-01): every dependency must have a license compatible
// with GPL-3.0. The same list is mirrored for Cargo crates in src-tauri/deny.toml.

/** SPDX identifiers compatible with GPL-3.0 (FSF list of GPL-compatible licenses). */
export const ALLOWED_LICENSES = new Set([
  '0BSD',
  'Apache-2.0',
  'Artistic-2.0',
  'BlueOak-1.0.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSL-1.0',
  'CC-BY-4.0',
  'CC0-1.0',
  'GPL-2.0-or-later',
  'GPL-3.0-only',
  'GPL-3.0-or-later',
  'ISC',
  'LGPL-2.1-only',
  'LGPL-2.1-or-later',
  'LGPL-3.0-only',
  'LGPL-3.0-or-later',
  'MIT',
  'MIT-0',
  'MPL-2.0',
  'Python-2.0',
  'Unicode-3.0',
  'Unlicense',
  'Zlib',
]);

/**
 * Packages whose metadata has no valid SPDX expression, with the license verified by hand.
 * Key: package name, value: { license, reason }.
 * @type {Record<string, { license: string, reason: string }>}
 */
export const LICENSE_OVERRIDES = {};

/**
 * Checks whether an SPDX license expression is allowed.
 * Supports OR (any alternative allowed), AND (all parts allowed), WITH (exception keeps the
 * base license) and parentheses.
 * @param {string} expression
 * @returns {boolean}
 */
export function isAllowedExpression(expression) {
  const tokens = expression
    .replace(/[()]/g, (p) => ` ${p} `)
    .trim()
    .split(/\s+/);
  let position = 0;

  /** @returns {boolean} */
  function parseOr() {
    let result = parseAnd();
    while (tokens[position] === 'OR') {
      position++;
      const right = parseAnd();
      result = result || right;
    }
    return result;
  }

  /** @returns {boolean} */
  function parseAnd() {
    let result = parseTerm();
    while (tokens[position] === 'AND') {
      position++;
      const right = parseTerm();
      result = result && right;
    }
    return result;
  }

  /** @returns {boolean} */
  function parseTerm() {
    const token = tokens[position++];
    if (token === '(') {
      const result = parseOr();
      if (tokens[position++] !== ')') throw new Error(`Unbalanced parentheses in "${expression}"`);
      return result;
    }
    if (token === undefined) throw new Error(`Unexpected end of "${expression}"`);
    if (tokens[position] === 'WITH') position += 2;
    return ALLOWED_LICENSES.has(token.replace(/\+$/, '-or-later'));
  }

  const result = parseOr();
  if (position !== tokens.length) throw new Error(`Cannot parse license "${expression}"`);
  return result;
}

/**
 * @typedef {{ name: string, versions: string[], license: string }} PackageLicense
 */

/**
 * Finds packages violating the policy in the output of `pnpm licenses list --json`
 * (an object mapping a license to the packages that use it).
 * @param {Record<string, Array<{ name: string, versions?: string[], version?: string }>>} report
 * @returns {PackageLicense[]}
 */
export function findViolations(report) {
  /** @type {PackageLicense[]} */
  const violations = [];
  for (const [license, packages] of Object.entries(report)) {
    for (const pkg of packages) {
      const override = LICENSE_OVERRIDES[pkg.name];
      const effective = override ? override.license : license;
      let allowed;
      try {
        allowed = isAllowedExpression(effective);
      } catch {
        allowed = false;
      }
      if (!allowed) {
        violations.push({
          name: pkg.name,
          versions: pkg.versions ?? (pkg.version ? [pkg.version] : []),
          license: effective,
        });
      }
    }
  }
  return violations;
}
