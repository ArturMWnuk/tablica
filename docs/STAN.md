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
| Bieżący krok | 1.4 (następny); 1.1 W TOKU (Linux i Android czekają na P12) |
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
| 1.1 | Prototypy ryzyk technicznych | przygotowanie: TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04 | W TOKU (Windows gotowy: 14/14 sprawdzeń; Linux i Android po P12) | (ten commit) |
| 1.2 | Rdzeń dokumentu i API wtyczek | WAR-01, WAR-06, WAR-12 (v1) | UKOŃCZONY (WAR-06 K1 dla gumki i zaznaczania w 1.6, P16) | 655784b |
| 1.3 | Historia i operacje na warstwach | DAN-03, WAR-02–05 | UKOŃCZONY (weryfikacja: WARUNKOWO, `docs/raporty/ETAP-1-krok-1.3-weryfikacja.md`) | 0bdd68b |
| 1.3-poprawka | Domknięcie WAR-02 i DAN-03 po weryfikacji | WAR-02 (K1), WAR-03 (P17 a), DAN-03 (P17 b: dodawanie i usuwanie warstw), WAR-01 K3 (interfejs) | UKOŃCZONY | (ten commit) |
| 1.4 | Wejście i pisanie | WEJ-01–06, RYS-01, RYS-02, NF-04 | OCZEKUJE | |
| 1.5 | Zapis i odczyt lekcji | DAN-01, DAN-02 | OCZEKUJE | |
| 1.6 | Edycja rysunku | RYS-03, RYS-04, RYS-12–14, domknięcie WAR-06 (K1, P16) | OCZEKUJE | |
| 1.7 | Figury, przyrządy, narzędzia matematyczne | RYS-05–11 | OCZEKUJE | |
| 1.8 | Obszar tablicy i tła | OBS-01, OBS-02, TLO-01, TLO-04–08 | OCZEKUJE | |
| 1.9 | Multimedia z plików | MM-01–04, MM-06–08 | OCZEKUJE | |
| 1.10 | Funkcje systemowe | TLO-02, TLO-03, MM-05, MM-09 | OCZEKUJE | |
| 1.11 | Eksport, język i motywy | DAN-04, DAN-05, UI-01, UI-02 | OCZEKUJE | |
| 1.12 | Interfejs pracy i prezentacji | UI-03–08, INT-01 | OCZEKUJE | |
| 1.13 | Wtyczki zewnętrzne | WAR-07–11, WAR-12 (dokumentacja końcowa) | OCZEKUJE | |
| 1.14 | Wydanie i wydajność | NF-02, NF-03, NF-05, domknięcie PLAT-01–03, NF-01 | OCZEKUJE | |

## Następne działania
1. W **nowym wątku**: `/realizuj-krok 1.4` (opcjonalnie wcześniej `/weryfikuj-etap 1 krok 1.3-poprawka`).
2. Właściciel: zatwierdzić parametr D18 (progi stuknięcia: 350 ms, 12 px) w tabeli D planu.
3. Właściciel: naprawić środowisko laptopa: Visual Studio Installer → Build Tools 2022 → Napraw (brak `oldnames.lib`) oraz `pnpm exec playwright install chromium --force` (brak `icudtl.dat`).
4. Właściciel: podać brakujące dane sprzętu (P12), potem dokończyć krok 1.1 (Linux, Android, tablet graficzny).
5. Po P12: `/realizuj-krok 1.1` (Linux, Android, tablet graficzny); kroki 1.9 i 1.10 dopiero po domknięciu 1.1.

## Otwarte pytania
- P12 (sprzęt testowy), część otwarta: dystrybucja Linuksa i sesja (X11/Wayland), tablet z Androidem i wersja systemu, model tabletu graficznego, urządzenie z ekranem dotykowym do R12 (laptop referencyjny go nie ma). Laptop referencyjny zapisany w planie (P12). **Potrzebne do dokończenia kroku 1.1** (część Windows wykonana 2026-11-10 za zgodą właściciela).

## Blokery
Brak.

## Dziennik sesji
### 2026-11-19: Krok 1.3-poprawka — domknięcie WAR-02 i DAN-03
- WAR-02 K1: `Board.execute` odrzuca polecenia wtyczki na ukrytej warstwie (także ze skrótów i paneli), jak na zablokowanej; dokumentacja API uzupełniona (typy bez zmian, API 1.0.0).
- P17 a: cofanie i ponawianie kroku zmieniającego zawartość zablokowanej lub ukrytej warstwy (oraz dodanie / usunięcie zablokowanej) jest wstrzymane, historia bez zmian, komunikat `notice.historyLocked` / `notice.historyHidden` pokazywany raz (`Notices.addOnce`). Kolejność i krycie cofają się normalnie.
- P17 b: dodawanie warstwy wybranego typu nad aktywną i usuwanie warstwy w panelu, przez historię (`LayerStructureEntry` przenosi ten sam rekord z danymi, więc uszkodzona warstwa i warstwa bez wtyczki wracają bez strat). Zablokowanej i ostatniej warstwy nie da się usunąć. `Board.addLayer` przechodzi teraz przez historię i ustawia nową warstwę jako aktywną.
- DAN-03: scalona zmiana suwaka, która wraca do wartości początkowej, jest usuwana z historii (`HistoryEntry.isEmpty`).
- D18 (progi stuknięcia 350 ms / 12 px) dopisany do tabeli D jako propozycja do zatwierdzenia. Test „ukryta warstwa nie jest renderowana” przepisany: sprawdza przesunięcie kamery zamiast cofania (cofanie na ukrytej warstwie jest teraz wstrzymane zgodnie z P17 a).
- Kontrole: lint, typy, Vitest 146/146, licencje, build web, Playwright WebKit 21/21; Chromium nieuruchamialny (znany brak danych ICU); rustfmt, clippy, cargo test 2/2 (obejście `oldnames.lib`).

### 2026-11-19: Decyzja P17
- (a) Właściciel: cofanie i ponawianie **nie** działa na zablokowanej ani ukrytej warstwie. Ustalono sposób: krok zmieniający zawartość takiej warstwy jest wstrzymany z komunikatem (historia i jej chronologia P4 bez zmian); kolejność i krycie cofają się normalnie.
- (b) Właściciel powierzył decyzję: dodawanie i usuwanie warstw z cofaniem w panelu warstw, w kroku 1.3-poprawka (zasady w planie).
- DAN-03 i WAR-03 wracają do W TOKU do czasu kroku 1.3-poprawka. Zapisano w planie (krok 1.3-poprawka, tabela pytań) i w MACIERZ.

### 2026-11-19: Weryfikacja kroku 1.3
- Audytor: wynik **WARUNKOWO** (`docs/raporty/ETAP-1-krok-1.3-weryfikacja.md`). DAN-03, WAR-03, WAR-04, WAR-05 OK; WAR-02 CZĘŚCIOWO: ukryta warstwa przyjmuje polecenia wtyczki ze skrótów i paneli (blokowane jest tylko wejście wskaźnika). Kontrole zielone (Vitest 132/132, WebKit 19/19).
- Uwagi audytora: P17 a uznana za rozsądną (do potwierdzenia), P17 b to luka planu (brak kroku z dodawaniem i usuwaniem warstw); kryterium „test każdego narzędzia na zablokowanej warstwie” warto dziedziczyć w krokach 1.4–1.7; drobne: pusty krok cofania po powrocie suwaka, progi stuknięcia poza tabelą D.
- Właściciel zgodził się na krok **1.3-poprawka** (dopisany do planu i tabeli kroków). WAR-02 wraca do W TOKU do czasu poprawki.

### 2026-11-19: Krok 1.3 — historia i operacje na warstwach
- `History` (rdzeń): limit kroków (domyślnie 50, zakres 10–500 wg D6, przy przekroczeniu usuwana najstarsza operacja), scalanie zmian ciągłych (`merge` + `seal`: przesunięcie suwaka krycia to jeden krok), czyszczenie ponowień po nowej operacji.
- Ustawienia warstwy w rdzeniu (`visible`, `locked`, `opacity`) zapisywane w serializacji dokumentu (pola opcjonalne, dla starszych danych wartości domyślne). Kolejność i krycie przez historię, widoczność i blokada poza nią (D12). Ukryta warstwa: kontener niewidoczny, bez `render()` i bez zdarzeń narzędzi; zablokowana: `execute` wtyczki ignorowane, narzędzia bez zdarzeń.
- Skróty Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z obsługuje rdzeń i są zarezerwowane (wtyczka dostaje komunikat o konflikcie); pola tekstowe zachowują własne cofanie. Gesty D3: rozpoznawanie stuknięcia wieloma palcami (`TapGestureRecognizer`, ruch > 12 px lub dotyk > 350 ms to nie stuknięcie); integracja z pełnym potokiem wejścia w kroku 1.4.
- Interfejs: przyciski cofnij/ponów, pole „Kroki cofania” (zapamiętywane na urządzeniu), panel warstw (od góry stosu: wybór aktywnej, widoczność, blokada, w górę / w dół, przeciąganie uchwytem, suwak krycia).
- API wtyczek bez zmian typów (nadal 1.0.0); dokumentacja `LayerHandle.execute`, `LayerView.render` i `ToolDefinition` uzupełniona o zachowanie przy zablokowanej i ukrytej warstwie; przewodnik i referencja zaktualizowane.
- Kontrole: lint, typy, Vitest 132/132, licencje npm, build web, Playwright WebKit 19/19; Chromium 0/19 (znany brak danych ICU / `icudtl.dat`, środowisko); rustfmt, clippy, cargo test 2/2 (z obejściem `oldnames.lib`).
- Interpretacje do potwierdzenia: P17.

### 2026-11-19: Decyzja P16
- Właściciel przyjął propozycję: test WAR-06 K1 z gumką (oba tryby) i zaznaczaniem powstaje w kroku 1.6, wtedy WAR-06 dostaje ZAIMPL.; do tego czasu W TOKU. Zapisano w planie (sekcja 1, krok 1.6, tabela pytań) i w MACIERZ.

### 2026-11-10: Krok 1.2 — rdzeń dokumentu i API wtyczek
- `packages/plugin-api` (`@tablica/plugin-api` 1.0.0): manifest i jego walidacja, zgodność wersji API (SemVer: ta sama wersja główna, poboczna nie nowsza), `LayerPlugin` (cykl życia `activate` / `mountLayer` / `render` / `unmount`), serializacja z `schemaVersion` i migracją w `deserialize`, polecenia cofania, narzędzia, skróty, panele, tłumaczenia, `LayerAccessError`.
- Rdzeń `app/src/lib/core/`: `BoardDocument`, `Camera`, `History` (minimalna: wykonaj / cofnij / ponów; limit, scalanie i interfejs w 1.3), `PluginManager` (walidacja, zgodność API, leniwe ładowanie), `LayerHost` (stos kontenerów DOM), rejestry narzędzi, skrótów i paneli, komunikaty dla użytkownika (`Notices.svelte`), klasa `Board` spinająca całość. Błąd wtyczki oznacza warstwę (albo całą wtyczkę) jako uszkodzoną, dane zostają do zapisu.
- Szkielety wtyczek `layer-background`, `layer-media`, `layer-drawing` (bez funkcji, tylko kontenery) oraz wtyczka testowa `test-fixture-layer` (narzędzia, skrót, panel, tłumaczenia, migracja formatu 1 → 2, polecenia cofania).
- Punkt wejścia przeniesiony do `app/src/composition/` (`main.ts`, `builtin.ts`): jedyne miejsce, które zna konkretne warstwy. Reguła lint: element `composition` może importować rdzeń i warstwy; rdzeń i API nie importują warstw; warstwy tylko `@tablica/plugin-api` (granice ścieżek + `no-restricted-imports` dla nazw pakietów).
- Dokumentacja API: `docs/api/README.md`, przewodnik `docs/api/jak-napisac-warstwe.md`, referencja `docs/api/referencja/` generowana z typów (`pnpm docs:api`, TypeDoc z kontrolą braku opisów). Test pilnuje aktualności referencji.
- Nowe zależności deweloperskie (licencje sprawdzone, kontrola licencji zielona): `happy-dom` (MIT, środowisko DOM dla testów), `typedoc` (Apache-2.0), `typedoc-plugin-markdown` (MIT).
- Kontrole: lint, typy, Vitest 89/89, licencje npm, build web, Playwright WebKit 8/8; Chromium 0/8 (znany brak `icudtl.dat`, środowisko); dla porównania te same testy na systemowym Edge (silnik WebView2, jednorazowa konfiguracja poza repozytorium) 8/8; rustfmt, clippy i cargo test 2/2 zielone (z obejściem `oldnames.lib` przez zmienną `LIB`).
- Odstępstwo: WAR-06 K1 (P16). WAR-12 zostaje W TOKU zgodnie z planem (domknięcie w 1.13).

### 2026-11-10: Decyzja P15
- Właściciel zgodził się rozpocząć krok 1.2 przed domknięciem kroku 1.1 na Linuksie i Androidzie (krok 1.2 nie zależy od wyników prototypów).

### 2026-11-10: Krok 1.1, część Windows — prototypy ryzyk technicznych
- Decyzja właściciela: przy otwartym P12 najpierw część Windows; Linux i Android po uzupełnieniu sprzętu. Krok pozostaje W TOKU.
- `spikes/platform/`: osobny crate Tauri (poza programem) z prototypami: przezroczysta nakładka z trybem przepuszczania, mini-pasek w osobnym oknie, skrót Ctrl+Shift+Spacja, zrzut fragmentu (xcap) z zaznaczaniem i Esc, YouTube IFrame API, MP4 H.264, rysik i opóźnienie.
- Przebieg automatyczny na Windows (prawdziwe wejście: SendInput, syntetyczne pióro Windows Ink): 14/14 sprawdzeń zaliczonych. Opóźnienie zdarzenie → segment p95 0,7 ms (próg NF-04: 4 ms). Raport: `docs/etapy/ETAP-1-prototypy.md`; ADR-010 i ADR-012 uzupełnione o wyniki Windows.
- Nowe zależności (tylko w prototypie, licencje sprawdzone cargo-deny): `tauri-plugin-global-shortcut`, `xcap`, `windows-sys`, `base64`, `serde_json`. `tauri-plugin-global-shortcut` zapisany w ADR-010 jako rozwiązanie dla D9.
- ESLint ignoruje katalogi `spikes/*/target` i `spikes/*/gen`; `.gitignore`: zrzuty i nagrania z `spikes/platform/results` nie trafiają do repozytorium.
- Problemy środowiska: brak `oldnames.lib` (x64) w MSVC Build Tools (obejście w sesji: pusty plik przez zmienną `LIB`), brak `icudtl.dat` w Playwright Chromium 1248 (7 testów e2e Chromium nie startuje; WebKit 7/7 zaliczone). Pozostałe kontrole zielone: lint, typy, Vitest 42/42, licencje, build, clippy, rustfmt, cargo test 2/2.
- Gałąź `etap-1` jest pobrana w głównym katalogu, więc praca na gałęzi worktree `claude/realizuj-krok-1-1-1a275c` (z `etap-1`); do przeniesienia na `etap-1` przez fast-forward.

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
