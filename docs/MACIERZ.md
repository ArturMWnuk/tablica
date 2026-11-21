# Macierz śledzenia wymagań

> Zgodna z dokumentacją w wersji **1.1**. Statusy i zasady zmian: `docs/WORKFLOW.md`, sekcja 5.
> Kolumna **Testy**: nazwy plików testów lub `ręczny: <nr z raportu>`. Kolumna **Uwagi**: odstępstwa, odwołania do ZW i raportów.

## Podsumowanie
| Etap | Wymagań | ZAIMPL. | ZWERYF. | Status etapu |
|---|---|---|---|---|
| 1 | 73 | 15 | 0 | REALIZACJA |
| 2 | 6 | 0 | 0 | NIEROZPOCZĘTY |
| 3 | 13 | 0 | 0 | NIEROZPOCZĘTY |
| 4 | 15 | 0 | 0 | NIEROZPOCZĘTY |
| 5 | 3 | 0 | 0 | NIEROZPOCZĘTY |
| **Razem** | **110** | **15** | **0** | |

Wykluczenia WYK-01 – WYK-05 nie są implementowane. Audytor sprawdza w każdym etapie, czy nie zostały naruszone.

## Etap 1
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| PLAT-01 | Windows | W TOKU | `.github/workflows/ci.yml` (build-desktop: NSIS, MSI); `e2e/shell.spec.ts`; `src-tauri/src/lib.rs` (`plat_01_*`) | K1 przygotowane w kroku 1.0, potwierdzone w CI (przebieg 41352386876). Lokalnie: `tauri build` NSIS+MSI i test dymny `e2e-app/smoke.test.mjs` zaliczone na Windows 11. K2 ręczny R01. Domknięcie: 1.14 |
| PLAT-02 | Linux | W TOKU | `.github/workflows/ci.yml` (build-desktop: AppImage, deb; smoke); `e2e-app/smoke.test.mjs` | K1 przygotowane w kroku 1.0, potwierdzone w CI (przebieg 41352386876). K2 ręczny R02. Domknięcie: 1.14 |
| PLAT-03 | Android | W TOKU | `.github/workflows/ci.yml` (build-android: APK arm64-v8a) | K1 przygotowane w kroku 1.0, potwierdzone w CI (przebieg 41352386876). APK debug do czasu klucza wydania (1.14). K2 ręczny R03. Domknięcie: 1.14 |
| WEJ-01 | Tablet z Androidem i rysikiem | ZAIMPL. | `app/src/composition/input.test.ts` (WEJ-01); `e2e/drawing.spec.ts` (WEJ-01); ręczny: R10 | Krok 1.4: K1 (potok wejścia `InputRouter` rozpoznaje pen / touch / mouse i kieruje zdarzenia do aktywnego narzędzia). K2 ręczny R10 (po P12) |
| WEJ-02 | Tablet graficzny | W TOKU | `app/src/composition/input.test.ts` (WEJ-05: nacisk, nachylenie, przyciski rysika); ręczny: R11 | Krok 1.1 (prototyp): Windows OK, `docs/etapy/ETAP-1-prototypy.md`; Linux/Android czekają na P12. Krok 1.4: tablet graficzny przechodzi przez ten sam potok co rysik (nacisk, nachylenie). Przyciski rysika wg D4: pierwszy (menu kontekstowe, UI-06) nie rysuje do kroku 1.12, drugi (gumka) czeka na gumkę z kroku 1.6 (P18 a, przyjęte 2026-11-20). Ryzyko do R11 na Linuksie: WebKit podaje `tiltX` 90 dla pióra bez danych o nachyleniu; program traktuje dokładnie ±90° jako brak danych |
| WEJ-03 | Ekran dotykowy | ZAIMPL. | `app/src/composition/input.test.ts` (WEJ-03); ręczny: R12 | Krok 1.4: K1 (jeden palec rysuje, dopóki nie użyto rysika, D4), K2 (dwa palce: przesuwanie i pinch bez rysowania; kreska pierwszego palca porzucana), gesty D3 przeniesione do potoku wejścia. K3 ręczny R12 (po P12: urządzenie dotykowe). Po użyciu rysika pojedynczy palec przesuwa widok (P18 b, przyjęte 2026-11-20) |
| WEJ-04 | Mysz i klawiatura | ZAIMPL. | `app/src/composition/input.test.ts` (WEJ-04); `e2e/drawing.spec.ts` (WEJ-04); ręczny: W5, W5a–W5e z raportu kroku 1.4-poprawka | Krok 1.4: K1 (lewy przycisk = narzędzie, kółko przewija, Ctrl + kółko powiększa, środkowy przycisk i Spacja + przeciągnięcie przesuwają; powiększenie w zakresie D5), K2 (e2e: każde narzędzie paska używalne myszą). Weryfikacja kroku 1.4: K1 częściowo, Spacja + przeciągnięcie rysowało w Chromium/Edge, gdy fokus został na przycisku paska (`docs/raporty/ETAP-1-krok-1.4-weryfikacja.md`). Krok 1.4-poprawka: przycisk kliknięty myszą, rysikiem lub palcem oddaje fokus stronie (`app/src/lib/ui/focus.ts`), przycisk uruchomiony z klawiatury zachowuje fokus i Spację; e2e w Edge i WebKit (pióro, zakreślacz: Spacja + przeciągnięcie przesuwa widok, jedno cofnięcie usuwa jedyną kreskę). Weryfikacja kroku 1.4-poprawka: WARUNKOWO, w Edge suwak grubości i pole wyboru D4 po użyciu myszą zatrzymują fokus i Spacja + przeciągnięcie rysuje (`docs/raporty/ETAP-1-krok-1.4-poprawka-weryfikacja.md`). Testy ręczne właściciela 2026-11-21 (WebView2): W5 i W5a zaliczone, W5b i W5c niezaliczone, czyli ograniczenie potwierdzone na platformie docelowej; właściciel wybrał krok poprawkowy. Krok 1.4-poprawka-2: fokus oddaje stronie każda kliknięta kontrolka, która nie służy do pisania (suwak, pole wyboru, przełącznik, selektor koloru), a pola tekstowe i listy zachowują swoje klawisze; e2e w Chromium i WebKit dla suwaka grubości i pola wyboru D4 (sprawdzone, że bez poprawki padają w Chromium). W5b i W5c do powtórzenia po tej poprawce; W5d (Android) i W5e (Linux) po P12 |
| WEJ-05 | Nacisk, nachylenie, gumka rysika | W TOKU | `packages/layer-drawing/src/stroke.test.ts` (WEJ-05); `app/src/composition/input.test.ts` (WEJ-05); ręczny: R10, R11 | Krok 1.4: K1 (nacisk 1,0 daje 2,29× grubości przy 0,25), K2 (mysz i palec: nacisk 0,5, grubość nominalna), K4 (D2: liniowo od 45° do 1,5× przy 90°). K3: mechanizm przełączania na gumkę na czas kontaktu sprawdzony narzędziem testowym; warstwa rysunkowa nie ma jeszcze gumki (RYS-03/04, krok 1.6), więc w programie końcówka gumki na razie nie rysuje. P18 a (przyjęte 2026-11-20): domknięcie K3 w kroku 1.6, wtedy ZAIMPL.; D2 liniowo (P18 c) |
| WEJ-06 | Odrzucanie dotyku dłoni | ZAIMPL. | `app/src/composition/input.test.ts` (WEJ-06); ręczny: R13 | Krok 1.4: K1 (dotyk ignorowany przy kontakcie rysika, w zasięgu (hover) i do 500 ms po jego ostatnim zdarzeniu; dłoń przy lądowaniu rysika przerywa kreskę palca), K2 (D4: po użyciu rysika palec nie rysuje; przełącznik w pasku ustawień, zapamiętywany na urządzeniu). K3 ręczny R13 (po P12) |
| WAR-01 | Wiele warstw nałożonych | ZAIMPL. | `app/src/composition/layers.test.ts` (WAR-01); `app/src/lib/core/core.test.ts` (WAR-01); `e2e/shell.spec.ts` (WAR-01); `e2e/layers-history.spec.ts` (WAR-01) | Krok 1.2: K1–K3 (dokument z uporządkowaną listą warstw, wspólna kamera, stos kontenerów DOM, dowolna liczba warstw jednego typu wg P3). Krok 1.3-poprawka: dodawanie warstwy wybranego typu w panelu warstw (`app/src/composition/history-layers.test.ts`, `e2e/layers-history.spec.ts`). Krok 1.3-poprawka-3: odczyt stanu panelu nie czyta stanu, który sam zapisuje, więc panel nie zapętla efektów przy wczytaniu wtyczek (e2e „WAR-01: the panel lists the layer types without an effect loop”). Krok 1.3-poprawka-4 (P20): numer warstwy nadawany trwale przy dodaniu (pierwsza warstwa typu bez numeru, kolejne 2, 3…, numery nieużywane ponownie, zapisywane w lekcji), więc przesunięcie w stosie nie zmienia nazw (`app/src/lib/core/core.test.ts`, e2e „WAR-01: moving a layer in the panel does not rename it (P20)”) |
| WAR-02 | Ukrywanie/pokazywanie warstwy | ZAIMPL. | `app/src/composition/history-layers.test.ts` (WAR-02); `e2e/layers-history.spec.ts` (WAR-02) | Krok 1.3: K1 (ukryta warstwa nie jest renderowana i nie dostaje zdarzeń narzędzi), K2 (stan w serializacji dokumentu; zapis pliku `.tablica` w kroku 1.5). Poza historią cofania (D12). Weryfikacja kroku 1.3 (WARUNKOWO): ukryta warstwa przyjmuje polecenia wtyczki ze skrótów i paneli; domknięte w kroku 1.3-poprawka: ukryta warstwa odrzuca polecenia wtyczki (test skrótu wtyczki testowej) |
| WAR-03 | Blokowanie warstwy | ZAIMPL. | `app/src/composition/history-layers.test.ts` (WAR-03); `e2e/layers-history.spec.ts` (WAR-03) | Krok 1.3: K1 (oba narzędzia i skrót wtyczki testowej nic nie zmieniają na zablokowanej warstwie; rdzeń ignoruje polecenia wtyczki), K2 (panel pokazuje blokadę, stan w serializacji). Poza historią cofania (D12). Decyzja P17 a (2026-11-19): cofanie i ponawianie zmian zawartości zablokowanej i ukrytej warstwy jest wstrzymane z komunikatem, zablokowanej warstwy nie da się usunąć (krok 1.3-poprawka). Kryterium „test każdego narzędzia” dotyczy też narzędzi z kroków 1.4–1.7 (zalecenie audytu). Weryfikacja poprawki (WARUNKOWO): komunikat bez numeru warstwy, brak testu ponowienia na ukrytej warstwie; domknięte w kroku 1.3-poprawka-2: komunikat podaje nazwę warstwy z numerem jak panel (testy „WAR-03: the message gives…”, e2e „WAR-03: a held-back step names the layer…”), test ponowienia wstrzymanego na ukrytej warstwie |
| WAR-04 | Zmiana kolejności warstw | ZAIMPL. | `app/src/composition/history-layers.test.ts` (WAR-04); `e2e/layers-history.spec.ts` (WAR-04) | Krok 1.3: K1 (przyciski i przeciąganie w panelu), K2 (stan w serializacji, cofanie wg D12). Krok 1.3-poprawka-4 (P20): przesunięcie warstwy nie zmienia jej nazwy ani nazw pozostałych |
| WAR-05 | Przezroczystość warstwy | ZAIMPL. | `app/src/composition/history-layers.test.ts` (WAR-05); `e2e/layers-history.spec.ts` (WAR-05) | Krok 1.3: K1 (suwak 0–100 %, krok 5 %), K2 (stan w serializacji, cofanie wg D12; przesunięcie suwaka to jeden krok cofania) |
| WAR-06 | Izolacja warstw | W TOKU | `app/src/composition/layers.test.ts` (WAR-06); `app/src/lib/core/core.test.ts` (WAR-06) | Krok 1.2: K2 i K3 spełnione. K1: mechanizm sprawdzony narzędziem „wyczyść warstwę” wtyczki testowej (porównanie serializacji pozostałych warstw); test z gumką (oba tryby) i zaznaczaniem możliwy dopiero w kroku 1.6, gdy te narzędzia powstaną. Decyzja P16 (2026-11-19): test K1 z gumką i zaznaczaniem w kroku 1.6, wtedy ZAIMPL. |
| WAR-07 | Wybór instalowanych warstw | — | | |
| WAR-08 | Dodawanie warstw bez reinstalacji | — | | |
| WAR-09 | Instalacja warstwy z pliku | — | | |
| WAR-10 | Katalog warstw online | — | | |
| WAR-11 | Niezależne wersje i aktualizacje warstw | — | | |
| WAR-12 | Stabilne, udokumentowane API wtyczek | W TOKU | `packages/plugin-api/src/api.test.ts`; `tools/eslint-rules/boundaries.test.ts`; `tools/api-docs.test.ts`; `app/src/composition/layers.test.ts` (WAR-12); `app/src/lib/core/core.test.ts` (WAR-12) | Krok 1.2: K1–K4 w wersji v1 (API 1.0.0, `docs/api/`, wtyczka testowa `packages/test-fixture-layer`). Krok 1.4: API 1.1.0 (zgodne wstecz: `tilt`, `predicted`, `ToolPointerSample`), warstwa rysunkowa może mieć zewnętrzne biblioteki (perfect-freehand, ADR-007), ale z pakietów programu tylko `@tablica/plugin-api`. Domknięcie (dokumentacja końcowa): 1.13 |
| RYS-01 | Pióro z naciskiem | ZAIMPL. | `packages/layer-drawing/src/stroke.test.ts` (RYS-01); `app/src/composition/drawing.test.ts` (RYS-01, WAR-03); `e2e/drawing.spec.ts` (RYS-01, wzorzec `e2e/reference/pen-stroke.png`); ręczny: R10–R12 | Krok 1.4: K1 (grubość wg WEJ-05), K2 (paleta 13 kolorów, dowolny kolor: próbnik i kod hex, 6 grubości gotowych, suwak 1–50 px), K3 (obrys perfect-freehand z naciskiem i wygładzaniem; porównanie maski z wzorcem, IoU ≥ 0,9, WebKit i Edge). Kreska = jeden krok cofania; test narzędzia na zablokowanej i ukrytej warstwie (WAR-03 K1). K4 ręczny |
| RYS-02 | Zakreślacz | ZAIMPL. | `packages/layer-drawing/src/stroke.test.ts` (RYS-02); `app/src/composition/drawing.test.ts` (RYS-02, WAR-03); `e2e/drawing.spec.ts` (RYS-02) | Krok 1.4: K1 (krycie 40 %, stała grubość, nakładające się części jednej kreski nie ciemnieją: test obrazu), K2 (mieszanie „multiply”: czarna kreska pod zakreśleniem zostaje czarna: test obrazu) |
| RYS-03 | Gumka: cała kreska | — | | |
| RYS-04 | Gumka: fragment | — | | |
| RYS-05 | Figury | — | | |
| RYS-06 | Linijka | — | | |
| RYS-07 | Ekierka | — | | |
| RYS-08 | Kątomierz | — | | |
| RYS-09 | Cyrkiel | — | | |
| RYS-10 | Układ współrzędnych | — | | |
| RYS-11 | Oś liczbowa | — | | |
| RYS-12 | Wskaźnik laserowy | — | | |
| RYS-13 | Tekst z klawiatury | — | | |
| RYS-14 | Zaznaczanie i edycja elementów | — | | |
| TLO-01 | Jednolity kolor | — | | |
| TLO-02 | Przezroczyste (Windows/Linux, 2 tryby) | — | | Krok 1.1 (prototyp, bez zmiany statusu): Windows OK, `docs/etapy/ETAP-1-prototypy.md`; Linux/Android czekają na P12 |
| TLO-03 | Przezroczyste (Android, zrzut ekranu) | — | | Krok 1.1: prototyp MediaProjection czeka na P12 (tablet z Androidem) |
| TLO-04 | Kratka | — | | |
| TLO-05 | Linie | — | | |
| TLO-06 | Papier milimetrowy | — | | |
| TLO-07 | Układ współrzędnych | — | | |
| TLO-08 | Własny obraz | — | | |
| OBS-01 | Nieskończone płótno | — | | |
| OBS-02 | Tryb stron | — | | |
| MM-01 | PNG, JPG, SVG, GIF | — | | |
| MM-02 | MP4 | — | | Krok 1.1 (prototyp, bez zmiany statusu): Windows OK, `docs/etapy/ETAP-1-prototypy.md`; Linux/Android czekają na P12 |
| MM-03 | MP3, WAV | — | | |
| MM-04 | PDF | — | | |
| MM-05 | YouTube | — | | Krok 1.1 (prototyp, bez zmiany statusu): Windows OK, `docs/etapy/ETAP-1-prototypy.md`; Linux/Android czekają na P12 |
| MM-06 | Transformacje multimediów | — | | |
| MM-07 | Sterowanie odtwarzaniem | — | | |
| MM-08 | Rysowanie po multimediach | — | | |
| MM-09 | Zrzut fragmentu ekranu | — | | Krok 1.1 (prototyp, bez zmiany statusu): Windows OK, `docs/etapy/ETAP-1-prototypy.md`; Linux/Android czekają na P12 |
| UI-01 | Język PL/EN | W TOKU | `app/src/lib/i18n/core.test.ts`; `tools/eslint-rules/no-raw-text.test.ts`; `e2e/shell.spec.ts`; `app/src/composition/layers.test.ts` (UI-01) | Krok 1.2: tłumaczenia wtyczek w manifestach, test parytetu PL/EN manifestów. Krok 1.0: infrastruktura (pliki tłumaczeń, test parytetu kluczy, reguła lint `tablica/no-raw-text`, przełączanie bez restartu, D10). Pełne tłumaczenia: 1.11 |
| UI-02 | Motywy interfejsu | W TOKU | `app/src/lib/theme/tokens.test.ts`; `e2e/shell.spec.ts` | Krok 1.0: infrastruktura (tokeny kolorów, jasny/ciemny/systemowy D11, test kontrastu tokenów). Domknięcie: 1.11 |
| UI-03 | Szybki pasek ulubionych | — | | |
| UI-04 | Konfigurowalne skróty | — | | |
| UI-05 | Tryb standardowy | — | | |
| UI-06 | Tryb prezentacji | — | | |
| UI-07 | Jeden ekran | — | | |
| UI-08 | Dwa monitory | — | | |
| DAN-01 | Zapis lekcji | ZAIMPL. | `app/src/lib/files/lesson-format.test.ts` (DAN-01); `app/src/composition/lesson-file.test.ts` (DAN-01); `app/src/lib/core/history.test.ts` (DAN-01); `e2e/lesson-file.spec.ts` (DAN-01); `src-tauri/src/files.rs` (dan_01_*); ręczny: zapis i odczyt w aplikacji Tauri, Q4 i ostatnia część P2 | Krok 1.5: K1 (plik `.tablica` = ZIP: `manifest.json`, `document.json`, `layers/<id>.json`, `assets/`; round-trip warstw, ich ustawień i numerów, kresek pióra i zakreślacza, danych wtyczki testowej i widoku; strony, tła, multimedia i notatki powstaną w krokach 1.8, 1.9, 1.12 i dostaną test round-trip jako kryterium dziedziczone), K2 (wersja układu w `manifest.json`, wersja schematu `document.json` z migracjami krok po kroku; plik z nowszej wersji daje komunikat; dane nowszej wersji wtyczki zachowane bez zmian), K3 (zapis atomowy w Rust: plik tymczasowy, `sync_all`, zamiana; uszkodzony plik daje komunikat), K4 (menu Plik: Nowa, Otwórz, Zapisz, Zapisz jako, Ostatnie pliki; Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Shift+S zarezerwowane dla programu). Dane nieznanych wtyczek i nieznane wpisy archiwum przechodzą bez zmian |
| DAN-02 | Autozapis | ZAIMPL. | `app/src/composition/lesson-file.test.ts` (DAN-02); ręczny: przywrócenie po zabiciu procesu w aplikacji Tauri | Krok 1.5: K1 (domyślnie co 2 min, test z kontrolowanym zegarem; 1–60 min albo wyłączony, D7, zapamiętywane na urządzeniu), K2 (P5: osobna kopia `autosave.tablica` w katalogu odzyskiwania danych aplikacji, plik lekcji zmienia się tylko przy „Zapisz”; zapis usuwa kopię), K3 (kopia pozostawiona przez sesję bez prawidłowego zamknięcia: przy starcie pytanie o przywrócenie; zamknięcie okna pyta o niezapisane zmiany i usuwa kopię) |
| DAN-03 | Cofanie/ponawianie (50) | ZAIMPL. | `app/src/lib/core/history.test.ts` (DAN-03); `app/src/composition/history-layers.test.ts` (DAN-03); `e2e/layers-history.spec.ts` (DAN-03) | Krok 1.3: K1 (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, przyciski, gesty D3), K2 (limit 50, test 50/51, ustawienie 10–500 wg D6), K3 (wspólna historia chronologiczna wg P4), K4 (wtyczka testowa tylko przez wspólną historię; skróty cofania zarezerwowane). Krok 1.3-poprawka (P17): dodawanie i usuwanie warstw w panelu przez historię (dane, także uszkodzonej warstwy, wracają bez strat), wstrzymanie cofania na zablokowanej i ukrytej warstwie z komunikatem, suwak bez pustego kroku; progi stuknięcia D18 do zatwierdzenia. Weryfikacja poprawki (WARUNKOWO): przypadki brzegowe (awaria wtyczki przy usuniętej warstwie, cofnięcie dodania przed wczytaniem) i luki w testach; domknięte w kroku 1.3-poprawka-2: awaria wtyczki zachowuje najnowsze dane i stan „uszkodzona” także warstw usuniętych, które da się przywrócić cofnięciem; warstwa dodana i cofnięta przed wczytaniem wtyczki dostaje właściwy stan (także przy nieudanym wczytaniu); testy ponowienia dodania i usunięcia (także warstwy uszkodzonej i bez wtyczki) z porównaniem serializacji; e2e wyłączonego usuwania ostatniej warstwy |
| DAN-04 | Eksport PDF | — | | |
| DAN-05 | Eksport PNG | — | | |
| INT-01 | Zgodność z udostępnianiem ekranu | — | | |
| NF-01 | GPL-3.0, zgodne licencje | W TOKU | `scripts/license-policy.test.ts`; `scripts/check-licenses.mjs`; `src-tauri/deny.toml`; `src-tauri/src/lib.rs` (`nf_01_*`) | Weryfikowane w każdym etapie. Krok 1.0: K1 (kontrola npm i Cargo w CI), K2 bez listy w „O programie”. Krok 1.4: kontrola npm obejmuje zależności wszystkich pakietów obszaru roboczego (`--recursive`; wcześniej tylko pakietu głównego), nowa zależność perfect-freehand 1.2.2 (MIT). Domknięcie: 1.14 |
| NF-02 | Instalatory na GitHub Releases | — | | |
| NF-03 | Płynność na sprzęcie docelowym | — | | Weryfikowane w każdym etapie. Krok 1.2: moduły wtyczek ładowane leniwie, przy pierwszej warstwie danego typu (test w `app/src/composition/layers.test.ts`) |
| NF-04 | Brak opóźnienia rysowania | ZAIMPL. | `app/src/composition/input.test.ts` (NF-04); `packages/layer-drawing/src/stroke.test.ts` (NF-04); `e2e/drawing.spec.ts` (NF-04); ręczny: R10, R11 | Krok 1.1 (prototyp): Windows OK (WebView2: p95 0,7 ms). Krok 1.4 (T10): K1 (licznik `LatencyMeter`, czas od `event.timeStamp` do końca rysowania segmentu; e2e: 400 zdarzeń pióra, p95 ≤ 4 ms w WebKit i Edge; odczyt w programie: `tablicaDiagnostics.latency`), K2 (zdarzenia scalone i przewidywane, ścieżka zapasowa bez nich; bieżąca kreska rysowana przyrostowo na płótnie `desynchronized`). K3 ręczny R10, R11 (po P12) |
| NF-05 | Praca offline | — | | Weryfikowane w każdym etapie |

## Etap 2
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| FIZ-01 | Wektory | — | | |
| FIZ-02 | Wykresy funkcji | — | | |
| FIZ-03 | Edytor LaTeX | — | | |
| FIZ-04 | Mechanizm symulacji | — | | |
| FIZ-05 | Ruch jednostajny | — | | |
| FIZ-06 | Ruch jednostajnie przyspieszony | — | | |

## Etap 3
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| CHEM-01 | Wzory sumaryczne i jonowe | — | | |
| CHEM-02 | Wzory strukturalne | — | | |
| CHEM-03 | Strzałki reakcji | — | | |
| CHEM-04 | Warunki reakcji | — | | |
| CHEM-05 | Dobieranie współczynników | — | | |
| CHEM-06 | Modele 3D | — | | |
| CHEM-07 | Konfiguracja elektronowa | — | | |
| CHEM-08 | Wzory Lewisa | — | | |
| UO-01 | Interaktywny układ okresowy | — | | |
| UO-02 | Karta pierwiastka | — | | |
| UO-03 | Izotopy naturalne | — | | |
| UO-04 | Podświetlanie grup/bloków | — | | |
| UO-05 | Przeciąganie na tablicę | — | | |

## Etap 4
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| SCH-01 | Biblioteka elementów | — | | |
| SCH-02 | Rozszerzalność biblioteki | — | | |
| SCH-03 | Symbole IEC/ANSI | — | | |
| SCH-04 | Przewody | — | | |
| SCH-05 | Opisy i numeracja | — | | |
| SCH-06 | Transformacje elementów | — | | |
| SCH-07 | Tryb statyczny | — | | |
| SCH-08 | Tryb symulacji | — | | |
| PS-01 | Pełna płytka | — | | |
| PS-02 | Dwie płytki z listwą | — | | |
| PS-03 | Elementy realistyczne | — | | |
| PS-04 | Moduły | — | | |
| PS-05 | Kolorowe przewody | — | | |
| PS-06 | Kod barwny rezystorów | — | | |
| PS-07 | Powiązanie ze schematem | — | | |

## Etap 5
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| MK-01 | Pinouty płytek | — | | |
| MK-02 | Płytki startowe | — | | |
| MK-03 | Przebiegi cyfrowe | — | | |
