// Fails (exit code 1) when any npm dependency has a license incompatible with GPL-3.0 (NF-01).
import { execSync } from 'node:child_process';
import { findViolations } from './license-policy.mjs';

const output = execSync('pnpm licenses list --json', {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const report = JSON.parse(output);
const violations = findViolations(report);
const total = Object.values(report).reduce((sum, packages) => sum + packages.length, 0);

if (violations.length > 0) {
  console.error(`License check failed: ${violations.length} of ${total} packages not allowed.`);
  for (const v of violations) {
    console.error(`  ${v.name}@${v.versions.join(',')}: ${v.license}`);
  }
  console.error('Allowed licenses and overrides: scripts/license-policy.mjs');
  process.exit(1);
}

console.log(`License check passed: ${total} packages, all GPL-3.0 compatible.`);
