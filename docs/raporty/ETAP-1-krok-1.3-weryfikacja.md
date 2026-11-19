# Raport weryfikacji: etap 1 krok 1.3 (wersja raportu v1)

| Pole | Wartość |
|---|---|
| Data | 2026-11-19 |
| Wersja dokumentacji | 1.1 |
| Plan | `docs/etapy/ETAP-1-plan.md` (ZATWIERDZONY 2026-11-01), sekcja 2 (DAN-03, WAR-02–05), sekcja 4 (krok 1.3), tabela D (D3, D6, D12), P4, P17 (STAN) |
| Commit | 0bdd68be0bba70deb86c5639b1a3d7013d9d7c87 (gałąź `claude/realizuj-krok-1-3-8093ba`, ten sam commit co `etap-1`) |
| **Wynik** | **WARUNKOWO** |

## 1. Podsumowanie
Krok 1.3 jest zrealizowany zgodnie z planem w zakresie historii (DAN-03) oraz kolejności, krycia i blokady warstw (WAR-03–05): wspólna chronologiczna historia z limitem 50 (ustawianym 10–500), scalanie ruchu suwaka, skróty, przyciski i gesty D3, panel warstw, podział historii zgodny z D12, stan w serializacji dokumentu. Wszystkie kontrole automatyczne uruchomione przez audytora są zielone (Vitest 132/132, Playwright WebKit 19/19, cargo test 2/2, lint, typy, licencje, build). Wynik ID: **4 OK** (DAN-03, WAR-03, WAR-04, WAR-05), **1 CZĘŚCIOWO** (WAR-02), **0 BRAK**, **0 ODSTĘPSTWO**. Główny brak: ukryta warstwa nadal przyjmuje polecenia wtyczki wywołane skrótem klawiszowym lub z panelu wtyczki (WAR-02 K1, „nie przyjmuje wejścia”); blokowane jest tylko wejście wskaźnika. Dwie interpretacje z P17 wymagają decyzji właściciela.

## 2. Kontrole automatyczne (uruchomione przez audytora)
Środowisko: PowerShell 5.1, Node 26.13.0 (przenośny), worktree `realizuj-krok-1-3-8093ba`.

| Kontrola | Polecenie | Wynik |
|---|---|---|
| Lint | `pnpm lint` (ESLint z regułami granic i `tablica/no-raw-text` + `prettier --check`) | Zielony (kod wyjścia 0, „All matched files use Prettier code style!”) |
| Typy | `pnpm typecheck` (tsc + `svelte-check --fail-on-warnings`) | Zielony: 328 plików, 0 błędów, 0 ostrzeżeń |
| Testy jednostkowe/integracyjne | `pnpm test` (Vitest) | **132/132** (11 plików); w tym nowe: `history.test.ts` 17, `history-layers.test.ts` 26 |
| Testy e2e | `pnpm test:e2e --project=webkit` | **19/19** (w tym 11 nowych w `e2e/layers-history.spec.ts`) |
| Testy e2e Chromium | nie uruchomiono | Znany problem środowiska (brak `icudtl.dat` w Playwright Chromium); nie jest brakiem kodu. Brak potwierdzenia na silniku Chromium (najbliższym WebView2) |
| Licencje | `pnpm check:licenses` | Zielony: 225 pakietów zgodnych z GPL-3.0 |
| Testy Rust | `cargo test` w `src-tauri` (z obejściem: pusta biblioteka `oldnames.lib` utworzona `lib.exe /def` w katalogu tymczasowym, zmienna `LIB`) | **2/2** (`nf_01_crate_is_licensed_under_gpl3`, `plat_01_config_identifies_the_application`). Kod Rust nie zmienił się w kroku |
| Build | `pnpm build:web` | Zielony (vite, 511 ms) |
| clippy / rustfmt / build Tauri | nie uruchomiono | Brak zmian w `src-tauri` w commicie 0bdd68b (`git diff --stat ad2b837 0bdd68b -- src-tauri` puste) |

## 3. Zgodność z wymaganiami
Wynik: **OK**, **CZĘŚCIOWO**, **BRAK** albo **ODSTĘPSTWO**. Każdy wynik OK wymaga dowodu. Ścieżki względem `app/src/` o ile nie podano inaczej.

| ID | Kryterium | Dowód (plik:linia, test) | Wynik | Uwagi |
|---|---|---|---|---|
| DAN-03 | K1 Ctrl+Z cofa, Ctrl+Y i Ctrl+Shift+Z ponawiają | `lib/core/board.ts:111-112` (UNDO_KEYS, REDO_KEYS), `:334-351` (`handleKey`); `components/Board.svelte:44-47` (nasłuch okna, pola tekstowe zachowują własne cofanie). Testy: `history-layers.test.ts` „DAN-03: Ctrl+Z undoes, Ctrl+Y and Ctrl+Shift+Z redo”; e2e „DAN-03: Ctrl+Z undoes, Ctrl+Y and Ctrl+Shift+Z redo” | OK | |
| DAN-03 | K1 przyciski cofnij/ponów | `components/HistoryButtons.svelte:14-48` (aktywne tylko gdy jest co cofnąć/ponowić). Testy: „DAN-03: undo and redo buttons call the same operations as the keys”; e2e „DAN-03: buttons are enabled only when there is something to undo or redo”, „WAR-04: a change of order is undone with the undo button (D12)” | OK | |
| DAN-03 | K1 gesty D3 (2 palce cofnij, 3 ponów) | `lib/core/tap-gesture.ts:32-66`; `lib/core/board.ts:115-116, 354-364`; `components/Board.svelte:21-32, 57-60`. Testy: `history.test.ts` „DAN-03: a tap with two or three fingers is recognized…”, „…one finger, moving fingers and a long touch are not taps”, „…a cancelled touch is not a tap”; `history-layers.test.ts` „DAN-03: a tap with two fingers undoes and with three fingers redoes (D3)”; e2e o tej samej nazwie (syntetyczne PointerEvent `touch`) | OK | Progi 350 ms i 12 px to parametry techniczne spoza tabeli D (nie zatwierdzone przez właściciela, ale nie sprzeczne z D3). Integracja z pełnym potokiem wejścia i gestami pinch (WEJ-03 K2) w kroku 1.4. Prawdziwy dotyk: test ręczny M1 |
| DAN-03 | K1 każda operacja zmieniająca dokument jest cofana | `lib/core/board.ts:235-249` (polecenia wtyczek przez `history.execute`), `:265-282` (krycie, kolejność). Test: „DAN-03: every operation of the test plugin and of the layer panel is undone and redone” (5 operacji: narzędzie box, narzędzie clear, skrót, krycie, kolejność; porównanie serializacji przed/po) | OK | `Board.addLayer` (`board.ts:149-154`) zmienia dokument poza historią; obecnie nieosiągalne z interfejsu (P17 b, sekcja 6) |
| DAN-03 | K2 domyślny limit 50, 51. operacja usuwa najstarszą | `lib/core/history.ts:8, 74-83, 152-159`. Testy: „DAN-03: the default limit is 50 steps”, „DAN-03: 50 operations can all be undone”, „DAN-03: the 51st operation drops the oldest one” (sprawdza, że zostaje zastosowana najstarsza +1); integracyjny „DAN-03: the limit of 50 steps applies to plugin commands; the 51st drops the oldest” | OK | |
| DAN-03 | K2 limit zmieniany w ustawieniach (D6: 10–500) | `lib/core/history.ts:10-27, 67-71`; `lib/settings/history-limit.ts:7-13`; `components/SettingsBar.svelte` (pole `history-limit`, `onHistoryLimitChange`); `composition/main.ts` (`board.history.setLimit(loadHistoryLimit())`). Testy: „DAN-03: the limit is set in the range 10–500 (D6)”, „DAN-03: lowering the limit drops the oldest steps”, „DAN-03: the limit set by the user is applied (D6)”; e2e „DAN-03: the undo limit is set in the settings within 10–500 and remembered (D6)” (5 → 10, 120 po przeładowaniu) | OK | Pole umieszczone na górnym pasku ustawień (brak jeszcze osobnego okna ustawień). Zapamiętanie po ponownym uruchomieniu aplikacji Tauri: test ręczny M5 |
| DAN-03 | K3 wspólna, chronologiczna historia (P4) | `lib/core/board.ts:120` (jedna `History` na tablicę), `history.ts:1-4`. Test: „DAN-03: one common history keeps the chronological order of all layers (P4)” (przeplot dwóch warstw i krycia) | OK | |
| DAN-03 | K4 wtyczka rejestruje operacje wyłącznie przez wspólną historię (test wtyczki testowej) | API daje wtyczce tylko `LayerHandle.execute` (`packages/plugin-api/src/plugin.ts`), realizowane przez `board.ts:222, 235-249`. Skróty cofania zarezerwowane: `board.ts:123`, `lib/core/registries.ts` (`reserved` w `ShortcutRegistry.tryRegister`). Testy: „DAN-03: plugin commands are recorded only in the common history (test plugin)”, „DAN-03: a plugin cannot take the undo and redo shortcuts” | OK | Test K4 sprawdza liczbę wpisów i zdarzeń historii; siłą dowodu jest raczej kształt API (brak innej drogi zapisu) niż sam test |
| WAR-02 | K1 ukryta warstwa nie jest renderowana | `lib/core/layer-host.ts:71-78` (`hidden`, `display:none`, ponowne `render` po pokazaniu), `:125-134` (brak `render()` dla ukrytej). Test: „WAR-02: a hidden layer is not rendered”; e2e „WAR-02: the panel lists the layers from the top and hides and shows a layer” | OK | |
| WAR-02 | K1 ukryta warstwa nie przyjmuje wejścia | Wskaźnik: `lib/core/board.ts:321` (test „WAR-02: a hidden layer takes no input”). **Polecenia wtyczki**: `board.ts:235-249` sprawdza tylko `locked`, nie `visible`. Skrót wtyczki (np. Ctrl+Alt+B wtyczki testowej, `packages/test-fixture-layer/src/index.ts:116-123`, wybiera najwyższą gotową warstwę bez względu na widoczność) albo panel wtyczki zmienia dane ukrytej warstwy | **CZĘŚCIOWO** | Wejście z klawiatury (skróty wtyczek) i z paneli wtyczek trafia do ukrytej warstwy, a zmiana jest niewidoczna dla nauczyciela. Brak testu tego przypadku. Dokumentacja API (`LayerHandle.execute`) opisuje ignorowanie tylko dla warstwy zablokowanej, więc zachowanie jest zamierzone przez wykonawcę, ale niezgodne z dosłownym K1. Wymaga poprawki albo decyzji właściciela |
| WAR-02 | K2 stan widoczności zapisywany w lekcji | `lib/core/document.ts:15-19, 105-106, 205-215`. Test: „WAR-02: the visibility is saved in the lesson” (zapis, ponowne otwarcie, kontener ukryty, serializacja identyczna) | OK | Zapis do pliku `.tablica` w kroku 1.5; tu serializacja dokumentu |
| WAR-02 | D12: widoczność poza historią | `board.ts:252-254`. Test: „WAR-02: visibility is a view setting and is not undone (D12)” | OK | |
| WAR-03 | K1 na zablokowanej warstwie żadne narzędzie nie tworzy, nie zmienia ani nie usuwa (test każdego narzędzia) | `board.ts:239` (polecenia ignorowane), `:321` (brak zdarzeń narzędzi). Testy: „WAR-03: no tool of the test plugin creates, changes or removes elements on a locked layer” (oba narzędzia: box i clear; serializacja, liczba kroków i DOM bez zmian), „WAR-03: a plugin command sent to a locked layer (e.g. from a shortcut) changes nothing”, „WAR-03: other layers keep working while one is locked; unlocking allows editing again” | OK | Jedyne istniejące narzędzia to narzędzia wtyczki testowej (wtyczki wbudowane nie mają jeszcze narzędzi). Cofanie/ponawianie zmienia dane zablokowanej warstwy: interpretacja P17 a (sekcja 6) |
| WAR-03 | K2 panel pokazuje blokadę; stan zapisywany w lekcji | `components/LayersPanel.svelte:187-209` (`aria-pressed`, ikona), `layer-host.ts:76` (`data-locked`), `document.ts:107, 211`. Testy: „WAR-03: the lock is shown on the layer and saved in the lesson; it is not undone (D12)”; e2e „WAR-03: the panel shows the lock state of a layer” | OK | |
| WAR-04 | K1 zmiana kolejności przyciskami i przeciąganiem zmienia kolejność renderowania | `components/LayersPanel.svelte:72-75, 95-118, 212-233`; `board.ts:276-282`; `document.ts:156-164`; `layer-host.ts:63-70` (z-index i kolejność DOM). Testy: „WAR-04: moving a layer changes the rendering order”; e2e „WAR-04: buttons move a layer up and down and change the rendering order”, „WAR-04: dragging a layer in the panel changes the rendering order” (mysz) | OK | Przeciąganie dotykiem i rysikiem: test ręczny M3 |
| WAR-04 | K2 stan zapisywany w lekcji; cofanie wg D12 | `board.ts:93-108` (`MoveEntry`); `document.ts:208`. Testy: „WAR-04: a change of order is undone and redone (D12)”, „WAR-04: moving a layer to its own place is not recorded”, „WAR-04: the order is saved in the lesson”; e2e „WAR-04: a change of order is undone with the undo button (D12)” | OK | |
| WAR-05 | K1 suwak 0–100 % co 5 % zmienia krycie całej warstwy | `components/LayersPanel.svelte:234-249` (`min=0 max=100 step=5`); `document.ts:39-46` (`normalizeOpacity`); `layer-host.ts:72` (krycie kontenera). Testy: „WAR-05: opacity 0–100 % in steps of 5 % applies to the whole layer”; e2e „WAR-05: the slider changes the opacity of the whole layer in steps of 5 %” | OK | |
| WAR-05 | K2 stan zapisywany w lekcji; cofanie wg D12 (ruch suwaka = jeden krok) | `board.ts:68-90` (`OpacityEntry` z `merge`), `:265-273`; `LayersPanel.svelte:77-81, 245` (`seal` przy `change`); `history.ts:74-88`. Testy: „WAR-05: a change of opacity is undone and redone (D12)”, „WAR-05: moving the slider is one undo step”, „WAR-05: slider changes of different layers are separate steps”, „WAR-05: the opacity is saved in the lesson”, „WAR-05: a lesson without layer settings opens with the defaults”; e2e „WAR-05: a change of opacity is undone and redone (D12)” | OK | Przeciągnięcie suwaka, które wraca do wartości początkowej, zostawia pusty krok cofania (drobne). Zachowanie zdarzenia `change` przy przeciąganiu w WebView2 / Android WebView: test ręczny M4 |
| D3 | Gesty 2 / 3 palce | jak DAN-03 K1 (gesty) | OK | |
| D6 | Limit 10–500 | jak DAN-03 K2 (ustawienia) | OK | |
| D12 | Kolejność i krycie w historii, widoczność i blokada nie | `board.ts:251-282`; testy WAR-02/03/04/05 z dopiskiem „(D12)” | OK | |
| P4 | Wspólna historia | jak DAN-03 K3 | OK | |

**Zakres ID:** sekcja 10 dokumentacji przypisuje DAN-03 i WAR-02–05 do etapu 1; plan (sekcja 1 i krok 1.3) obejmuje wszystkie pięć. Braków w planie dla tego kroku nie stwierdzono.

**Zgodność MACIERZ / STAN / CHANGELOG:** MACIERZ: DAN-03, WAR-02–05 = ZAIMPL. z poprawnymi plikami testów; podsumowanie 6 ZAIMPL. w etapie 1 (WAR-01 + 5) zgodne. Dla WAR-02 status ZAIMPL. jest w świetle niniejszego raportu przedwczesny (K1 częściowo). STAN: krok 1.3 UKOŃCZONY, dziennik zgodny z kodem i liczbami kontroli (132/132, 19/19, 2/2 potwierdzone przez audytora), P17 zapisane w „Otwarte pytania”. CHANGELOG: wpisy dla DAN-03 i WAR-02–05 obecne. Nikt nie ustawił statusu ZWERYF.

## 4. Regresja poprzednich etapów
| Etap | Testy | Wynik |
|---|---|---|
| Etap 1, kroki 1.0–1.2 | Vitest: wszystkie wcześniejsze pliki (`core.test.ts`, `layers.test.ts`, `api.test.ts`, `boundaries.test.ts`, `no-raw-text.test.ts`, `api-docs.test.ts`, `i18n/core.test.ts`, `tokens.test.ts`, `license-policy.test.ts`) w ramach 132/132; e2e `shell.spec.ts` 8/8 (WebKit); cargo test 2/2 | Brak regresji (89 wcześniejszych testów Vitest + 43 nowe = 132) |
| Etap 1, krok 1.1 (prototypy) | `spikes/` poza programem, bez zmian w kroku | Nie dotyczy |

## 5. Niezmienniki architektury i wymagania przekrojowe
| Reguła | Wynik | Dowód / uwagi |
|---|---|---|
| Rdzeń nie zna konkretnych warstw (WAR-12) | OK | `app/src/lib` nie odwołuje się do `layer-drawing`/`layer-background`/`layer-media`/`test-fixture` (jedyne wystąpienie: dane testowe w `lib/i18n/core.test.ts`). Lint granic modułów zielony. Panel warstw używa tylko `pluginId` i tłumaczeń przestrzeni nazw wtyczki (`layerName`) |
| Izolacja warstw (WAR-06) | OK | Nowe operacje rdzenia (widoczność, blokada, krycie, kolejność) działają na ustawieniach rdzenia, nie na danych wtyczek. Wpisy historii warstwy działają tylko na rekordzie własnej warstwy (`board.ts:52-66`) |
| Brak tekstów UI na sztywno (UI-01) | OK | Wszystkie nowe etykiety przez `t()`; klucze `settings.historyLimit*`, `history.*`, `layers.*` w `pl.json` i `en.json` (parytet sprawdzany testem, zielony); reguła `tablica/no-raw-text` zielona |
| Wspólny mechanizm cofania (DAN-03) | OK | Polecenia wtyczek i operacje rdzenia (krycie, kolejność) przez jedną `History`; skróty cofania zarezerwowane dla rdzenia. Wyjątek: `Board.addLayer` poza historią (P17 b) |
| Zgodność API wtyczek | OK | Bez zmian typów, wersja `@tablica/plugin-api` 1.0.0. Zmiana zachowania (ignorowanie `execute` na zablokowanej warstwie, brak `render()` i zdarzeń narzędzi dla ukrytej/zablokowanej) jest zgodna wstecz i udokumentowana w `packages/plugin-api/src/plugin.ts`, `docs/api/jak-napisac-warstwe.md` i referencji (test aktualności referencji zielony). ADR niepotrzebny (zmiana kompatybilna) |
| Leniwe ładowanie (NF-03) | OK | Bez zmian w ładowaniu wtyczek; nowe moduły rdzenia są małe (build: główny pakiet 77 kB) |
| Licencje zależności (NF-01) | OK | Brak nowych zależności npm i Cargo w commicie (`package.json`, `pnpm-lock.yaml`, `Cargo.toml` bez zmian); kontrola licencji zielona |
| Offline (NF-05) | OK | Brak żądań sieciowych w nowym kodzie; ustawienie limitu w lokalnej pamięci ustawień |
| Wykluczenia WYK-01–05 nienaruszone | OK | Brak współpracy, kont, chmury, łączenia urządzeń ani funkcji mikrokontrolerów |

## 6. Elementy spoza dokumentacji
- **Wybór aktywnej warstwy w panelu** (`LayersPanel.svelte:149-161`): nie wynika wprost z WAR-02–05, ale służy WAR-06 K2 (narzędzie działa na aktywnej warstwie swojego typu) i UI-05 (panel warstw). Dopuszczalny element pomocniczy.
- **Rezerwacja skrótów cofania przed wtyczkami** z komunikatem o konflikcie: element techniczny służący DAN-03 K1/K4. Dopuszczalny.
- **Progi gestu stuknięcia** (350 ms, 12 px): parametry techniczne nieujęte w tabeli D. Do świadomej akceptacji właściciela (test M1).
- **Interpretacje P17 do decyzji właściciela:**
  - **P17 a** (cofanie/ponawianie działa na zablokowanej i ukrytej warstwie): zgodne z dosłownym WAR-03 K1 (mowa o narzędziach) i z P4 (chronologia), a podobnie działają popularne edytory. Ryzyko: nauczyciel blokuje warstwę „przed edycją”, a Ctrl+Z zmienia ją niewidocznie (szczególnie gdy jest też ukryta). Audytor uważa interpretację za rozsądną, ale wymaga ona potwierdzenia, bo WAR-03 brzmi „blokowanie przed edycją”.
  - **P17 b** (`Board.addLayer` poza historią): obecnie brak interfejsu dodawania/usuwania warstw, więc DAN-03 K1 nie jest naruszone w działającym programie. **Luka planu:** P3 (dowolna liczba warstw jednego typu) i WAR-01 K3 zakładają dodawanie warstw, a żaden krok planu nie przewiduje interfejsu dodawania/usuwania warstw ani jego cofania. Do decyzji właściciela (np. krok 1.12 lub 1.13).

## 7. Testy ręczne dla właściciela
Plan (sekcja 5) nie zawiera testów R przypisanych do DAN-03 i WAR-02–05 (poza ogólnym R52). Poniższe testy obejmują to, czego nie da się sprawdzić automatycznie w tym środowisku. Uruchamiać w zbudowanej aplikacji Tauri (`pnpm tauri dev` albo instalator).

- [ ] M1 (DAN-03 / D3, urządzenie dotykowe: tablet z Androidem lub ekran dotykowy; po P12): przesuń warstwę w panelu („niżej”), następnie stuknij krótko dwoma palcami w tablicę → kolejność wraca (cofnięcie). Stuknij trzema palcami → zmiana wraca (ponowienie). Przytrzymaj dwa palce ponad 0,5 s albo przesuń je o ok. 2 cm → nic się nie cofa. Jeden palec → nic się nie cofa.
- [ ] M2 (DAN-03 K1, Windows): w aplikacji zmień krycie i kolejność warstw, naciśnij Ctrl+Z dwa razy → obie zmiany cofnięte w odwrotnej kolejności; Ctrl+Y i Ctrl+Shift+Z → ponowione. Kliknij w pole „Kroki cofania”, wpisz cyfry i naciśnij Ctrl+Z → cofa się tylko wpisany tekst, nie zmiany na tablicy. Przyciski cofnij/ponów są wyszarzone, gdy nie ma czego cofnąć/ponowić.
- [ ] M3 (WAR-04 K1, Windows: mysz; urządzenie dotykowe i rysik po P12): przeciągnij uchwytem (sześć kropek) warstwę „Tło” na górę listy → na liście i na tablicy tło jest najwyżej; podczas przeciągania widać miejsce upuszczenia. Powtórz palcem i rysikiem → przeciąganie działa, strona się nie przewija.
- [ ] M4 (WAR-05 K1/K2, Windows; Android po P12): przeciągnij suwak krycia warstwy płynnie od 100 % do ok. 30 % i puść → wartość zmienia się co 5 %, cała warstwa blednie; jedno Ctrl+Z przywraca 100 % (jeden krok cofania za całe przeciągnięcie). Strzałki klawiatury na suwaku: każde naciśnięcie to osobny krok.
- [ ] M5 (DAN-03 K2 / D6, Windows): ustaw „Kroki cofania” na 5 → pole pokazuje 10; ustaw 600 → pokazuje 500; ustaw 120, zamknij aplikację całkowicie i uruchom ponownie → pole pokazuje 120.
- [ ] M6 (WAR-02, WAR-03, Windows): kliknij oko przy warstwie → kontener znika z tablicy, ikona zmienia się na przekreślone oko; kliknij ponownie → wraca. Kliknij kłódkę → ikona zamkniętej kłódki; przycisk „Cofnij” pozostaje nieaktywny (D12). Przełącz język na EN i motyw ciemny → wszystkie etykiety i podpowiedzi panelu po angielsku, ikony i suwak czytelne.
- [ ] M7 (DAN-03, WAR-02–05, Linux i Android; po P12): powtórzyć M2–M6 na WebKitGTK i Android WebView → zachowanie jak na Windows.
- [ ] M8 (wszystkie, R52 częściowo): po naprawie środowiska (`pnpm exec playwright install chromium --force`) uruchomić `pnpm test:e2e --project=chromium` → 19/19 (silnik najbliższy WebView2; audytor nie mógł tego sprawdzić).

## 8. Zalecenia
1. **(Wysoki, przed oznaczeniem WAR-02 jako ZAIMPL.)** Rozstrzygnąć WAR-02 K1 dla poleceń wtyczki na ukrytej warstwie: albo `Board.execute` ignoruje polecenia także dla `!record.visible` (analogicznie do `locked`, z testem skrótu wtyczki testowej na ukrytej warstwie i aktualizacją dokumentacji `LayerHandle.execute`), albo właściciel akceptuje obecne zachowanie (skróty i panele wtyczek mogą zmieniać ukrytą warstwę) i MACIERZ dostaje uwagę o odstępstwie. Do tego czasu WAR-02 powinno mieć status W TOKU, nie ZAIMPL.
2. **(Średni)** Właściciel potwierdza P17 a (cofanie na zablokowanej/ukrytej warstwie) i P17 b; dla P17 b uzupełnić plan o krok z interfejsem dodawania i usuwania warstw z obsługą cofania (luka planu względem P3 / WAR-01 K3).
3. **(Średni, krok 1.4 i dalej)** WAR-03 K1 wymaga „testu każdego narzędzia warstwy”: każde nowe narzędzie (pióro, zakreślacz, gumki, zaznaczanie, figury, tekst, przyrządy) powinno mieć test na zablokowanej warstwie; obecnie sprawdzono tylko narzędzia wtyczki testowej. Warto dopisać to jako kryterium dziedziczone, podobnie jak round-trip od kroku 1.5.
4. **(Niski)** Przeciągnięcie suwaka krycia kończące się na wartości początkowej zostawia pusty krok cofania (`OpacityEntry.merge` nie usuwa wpisu bez zmiany).
5. **(Niski)** Progi gestu (350 ms, 12 px) zweryfikować na prawdziwym urządzeniu (M1) i ewentualnie dopisać do tabeli D.
6. **(Środowisko)** Naprawić Playwright Chromium i `oldnames.lib` w MSVC Build Tools, aby pełne kontrole (w tym e2e Chromium, clippy) dało się uruchamiać lokalnie bez obejść.
