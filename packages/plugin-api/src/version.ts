/**
 * Version of the plugin API implemented by this package (SemVer).
 *
 * - A new **major** version means an incompatible change (it needs an ADR).
 * - A new **minor** version only adds features; plugins written for an older minor
 *   version keep working.
 */
export const API_VERSION = '1.0.0';

/** A parsed semantic version. */
export interface SemVer {
  /** Major version: incompatible changes. */
  readonly major: number;
  /** Minor version: new, compatible features. */
  readonly minor: number;
  /** Patch version: fixes. */
  readonly patch: number;
}

const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/** Parses a version like `1.2.3` (pre-release and build suffixes are accepted and ignored). */
export function parseVersion(version: string): SemVer | undefined {
  const match = SEMVER.exec(version);
  if (!match) return undefined;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

/**
 * Tells whether a plugin that requires API version `required` can run on API version `provided`.
 * The major versions must be equal and the provided minor version must not be older.
 */
export function isApiCompatible(required: string, provided: string = API_VERSION): boolean {
  const need = parseVersion(required);
  const have = parseVersion(provided);
  if (!need || !have) return false;
  return need.major === have.major && need.minor <= have.minor;
}
