import { describe, expect, it } from 'vitest';
import { API_VERSION, isApiCompatible, parseVersion, validateManifest } from './index';

const validManifest = {
  id: 'layer-example',
  version: '1.2.3',
  apiVersion: '1.0.0',
  translations: {
    pl: { name: 'Przykład', description: 'Warstwa przykładowa.' },
    en: { name: 'Example', description: 'Example layer.' },
  },
};

describe('WAR-12: API versioning', () => {
  it('WAR-12: API version is a SemVer string', () => {
    expect(parseVersion(API_VERSION)).toBeDefined();
  });

  it('WAR-12: parses versions and rejects invalid ones', () => {
    expect(parseVersion('1.20.3')).toEqual({ major: 1, minor: 20, patch: 3 });
    expect(parseVersion('2.0.0-beta.1')).toEqual({ major: 2, minor: 0, patch: 0 });
    expect(parseVersion('1.0')).toBeUndefined();
    expect(parseVersion('01.0.0')).toBeUndefined();
    expect(parseVersion('x')).toBeUndefined();
  });

  it('WAR-12: same major and older or equal minor version is compatible', () => {
    expect(isApiCompatible('1.0.0', '1.0.0')).toBe(true);
    expect(isApiCompatible('1.0.5', '1.3.0')).toBe(true);
    expect(isApiCompatible('1.2.0', '1.3.1')).toBe(true);
  });

  it('WAR-12: different major or newer minor version is incompatible', () => {
    expect(isApiCompatible('2.0.0', '1.9.0')).toBe(false);
    expect(isApiCompatible('0.9.0', '1.0.0')).toBe(false);
    expect(isApiCompatible('1.4.0', '1.3.0')).toBe(false);
    expect(isApiCompatible('nonsense', '1.0.0')).toBe(false);
  });
});

describe('WAR-12: manifest validation', () => {
  it('WAR-12: accepts a valid manifest', () => {
    expect(validateManifest(validManifest)).toEqual([]);
    expect(validateManifest({ ...validManifest, permissions: [] })).toEqual([]);
  });

  it('WAR-12: reports every invalid field', () => {
    expect(validateManifest(null)).toEqual(['not-an-object']);
    expect(validateManifest([])).toEqual(['not-an-object']);
    expect(
      validateManifest({
        id: 'Bad Id',
        version: '1',
        apiVersion: 'x',
        translations: { pl: { name: 'A', description: 'B' } },
        permissions: ['network'],
      }),
    ).toEqual(['id', 'version', 'apiVersion', 'translations', 'permissions']);
  });

  it('WAR-12: translations must contain a name and a description in PL and EN', () => {
    const missingDescription = {
      ...validManifest,
      translations: { ...validManifest.translations, en: { name: 'Example' } },
    };
    expect(validateManifest(missingDescription)).toEqual(['translations']);
    const notText = {
      ...validManifest,
      translations: { ...validManifest.translations, pl: { name: 1, description: 'x' } },
    };
    expect(validateManifest(notText)).toEqual(['translations']);
  });
});
