# Stan projektu

> Czytaj na początku każdej sesji. Aktualizuj po każdym kroku. Najnowsze wpisy dziennika są na górze.

## Bieżąca sytuacja
| Pole | Wartość |
|---|---|
| Wersja dokumentacji | 1.1 |
| Wersja programu | — (brak wydań) |
| Bieżący etap | 1 |
| Status etapu | REALIZACJA |
| Plan etapu | `docs/etapy/ETAP-1-plan.md` (ZATWIERDZONY 2026-11-01) |
| Bieżący krok | 1.1 (nierozpoczęty; wymaga odpowiedzi na P12) |
| Gałąź robocza | `etap-1` |

## Etapy
| Etap | Status | Plan | Raport weryfikacji | Wersja |
|---|---|---|---|---|
| 1 | REALIZACJA | `docs/etapy/ETAP-1-plan.md` | — | — |
| 2 | NIEROZPOCZĘTY | — | — | — |
| 3 | NIEROZPOCZĘTY | — | — | — |
| 4 | NIEROZPOCZĘTY | — | — | — |
| 5 | NIEROZPOCZĘTY | — | — | — |

## Kroki bieżącego etapu
Statusy: OCZEKUJE, W TOKU, UKOŃCZONY.

| Krok | Nazwa | Zakres (ID) | Status | Commit |
|---|---|---|---|---|
| 1.0 | Szkielet projektu i CI | PLAT-01–03 (K1), NF-01 (K1, K2 częściowo), UI-01, UI-02 (infrastruktura) | UKOŃCZONY (CI zielone: przebieg 41352386876) | 02efcb7, abae05a |
| 1.1 | Prototypy ryzyk technicznych | przygotowanie: TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04 | OCZEKUJE | |
| 1.2 | Rdzeń dokumentu i API wtyczek | WAR-01, WAR-06, WAR-12 (v1) | OCZEKUJE | |
| 1.3 | Historia i operacje na warstwach | DAN-03, WAR-02–05 | OCZEKUJE | |
| 1.4 | Wejście i pisanie | WEJ-01–06, RYS-01, RYS-02, NF-04 | OCZEKUJE | |
| 1.5 | Zapis i odczyt lekcji | DAN-01, DAN-02 | OCZEKUJE | |
| 1.6 | Edycja rysunku | RYS-03, RYS-04, RYS-12–14 | OCZEKUJE | |
| 1.7 | Figury, przyrządy, narzędzia matematyczne | RYS-05–11 | OCZEKUJE | |
| 1.8 | Obszar tablicy i tła | OBS-01, OBS-02, TLO-01, TLO-04–08 | OCZEKUJE | |
| 1.9 | Multimedia z plików | MM-01–04, MM-06–08 | OCZEKUJE | |
| 1.10 | Funkcje systemowe | TLO-02, TLO-03, MM-05, MM-09 | OCZEKUJE | |
| 1.11 | Eksport, język i motywy | DAN-04, DAN-05, UI-01, UI-02 | OCZEKUJE | |
| 1.12 | Interfejs pracy i prezentacji | UI-03–08, INT-01 | OCZEKUJE | |
| 1.13 | Wtyczki zewnętrzne | WAR-07–11, WAR-12 (dokumentacja końcowa) | OCZEKUJE | |
| 1.14 | Wydanie i wydajność | NF-02, NF-03, NF-05, domknięcie PLAT-01–03, NF-01 | OCZEKUJE | |

## Następne działania
1. Właściciel: podać brakujące dane sprzętu (P12), potrzebne do kroku 1.1.
2. W **nowym wątku**: `/realizuj-krok 1.1`.

## Otwarte pytania
- P12 (sprzęt testowy), część otwarta: dystrybucja Linuksa i sesja (X11/Wayland), tablet z Androidem i wersja systemu, model tabletu graficznego, urządzenie z ekranem dotykowym do R12 (laptop referencyjny go nie ma). Laptop referencyjny zapisany w planie (P12). **Potrzebne przed krokiem 1.1.**

## Blokery
Brak.

## Dziennik sesji
### 2026-11-01: Repozytorium GitHub i sprzęt referencyjny
- Repozytorium: `ArturMWnuk/tablica` (publiczne). Poprawiono adres w P13 i `Cargo.toml` oraz identyfikator aplikacji na `io.github.arturmwnuk.tablica`.
- Zdalny `main` miał commit z plikiem LICENSE w wersji AGPL-3.0, niezgodny z NF-01 / ADR-003. Na polecenie właściciela nadpisano go lokalnym `main` (force push).
- Wypchnięto `main` i `etap-1`. Poprawki CI: skrypt `licenses` kolidował z `pnpm licenses` (nowa nazwa `check:licenses`), `setup-android` tylko z platform-tools, wersja robocza 0.0.1 (Android odrzuca 0.0.0).
- CI zielone (przebieg 41352386876): kontrole, test dymny Linux, NSIS/MSI, AppImage/deb, APK arm64-v8a. Warunek ukończenia kroku 1.0 spełniony.
- P12: dane laptopa referencyjnego odczytane z systemu i zapisane w planie. Laptop nie ma ekranu dotykowego, nie jest podłączony tablet graficzny ani urządzenie z Androidem, nie ma natywnego Linuksa (WSL: tylko docker-desktop).

### 2026-11-01: Krok 1.0 — szkielet projektu i CI
- Monorepo pnpm: `app/` (Svelte 5 + TypeScript strict + Vite), `src-tauri/` (Tauri 2), okno z pustą tablicą oraz przełącznikami języka i motywu; LICENSE GPL-3.0.
- Jakość: ESLint (z regułą granic modułów `boundaries/dependencies` i własną regułą `tablica/no-raw-text` dla UI-01), Prettier, svelte-check, tsc, clippy, rustfmt.
- Testy: Vitest (42), Playwright Chromium + WebKit z atrapą API Tauri (14), cargo test (2), test dymny przez tauri-driver (1, zaliczony lokalnie na Windows).
- Licencje (NF-01): `scripts/check-licenses.mjs` (pnpm licenses + polityka SPDX, test z celowo błędną licencją) i cargo-deny (`src-tauri/deny.toml`).
- CI (`.github/workflows/ci.yml`): kontrole, test dymny na Linuksie, NSIS/MSI, AppImage/deb, APK arm64-v8a (debug). **Niepotwierdzone**: brak repozytorium GitHub, nic nie wypchnięto.
- Decyzje techniczne: Node 26 LTS (`.nvmrc`), pnpm 12, TypeScript 6.0 (typescript-eslint nie wspiera jeszcze TS 7), identyfikator aplikacji `io.github.arturwnuk.tablica`, Android minSdk 29 (P12: Android 10+). Kontrola licencji npm obejmuje także zależności deweloperskie.
- Środowisko lokalne: przenośny Node 26 w `%LOCALAPPDATA%\Programs\nodejs-portable` (systemowy Node 20.12 jest za stary), Visual Studio Build Tools 2022 (C++), cargo-deny, tauri-driver, msedgedriver 156. Brak lokalnego Android SDK — APK budowany tylko w CI.
- Statusy: PLAT-01–03, NF-01, UI-01, UI-02 w stanie W TOKU (domknięcie w krokach 1.11 i 1.14 zgodnie z planem).

### 2026-11-01: Zatwierdzenie planu etapu 1
- Właściciel zatwierdził plan etapu 1 ze wszystkimi rekomendacjami (P1–P14) i parametrami domyślnymi D1–D17.
- Zapisano ADR-006 (Svelte 5) oraz ADR-007–012 w `DECYZJE.md`. ADR-010 i ADR-012 do doprecyzowania po kroku 1.1.
- Utworzono gałąź `etap-1`, status etapu: REALIZACJA.
- Do uzupełnienia przez właściciela: dane sprzętu (P12).

### 2026-11-01: Planowanie etapu 1
- Utworzono projekt planu etapu 1: 73 ID (pokrycie sprawdzone skryptem względem MACIERZ), 15 kroków (1.0–1.14), kryteria akceptacji [A]/[R], 22 testy ręczne, 10 ryzyk.
- Zaproponowano ADR-006 (Svelte 5) oraz ADR-007–012.
- Dodano krok 1.1 (prototypy ryzyk platformowych) przed budową funkcji.

### 2026-11-01: Dokumentacja i workflow
- Utworzono dokumentację programu na podstawie wywiadu (wersja 1.0), następnie nadano wymaganiom identyfikatory (wersja 1.1).
- Utworzono workflow projektu: CLAUDE.md, WORKFLOW, MACIERZ, STAN, DECYZJE, szablony, komendy i agenta audytora.
- Zainicjowano lokalne repozytorium git (gałąź `main`) z `.gitignore` i `.gitattributes`.
