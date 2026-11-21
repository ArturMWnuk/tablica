# Raport weryfikacji: etap 1 krok 1.3-poprawka (wersja raportu v1)

| Pole | Wartość |
|---|---|
| Data | 2026-11-19 |
| Wersja dokumentacji | 1.1 |
| Plan | `docs/etapy/ETAP-1-plan.md` (ZATWIERDZONY 2026-11-01): sekcja 2 (WAR-01 K3, WAR-02, WAR-03, WAR-04, WAR-05, DAN-03), sekcja 4 („Krok 1.3-poprawka”), P3, P4, P17, tabela D (D3, D6, D12, D18) |
| Commit | f6fd8e40796e290c3c7536f579e7162e273e0820 (worktree `realizuj-krok-1-3-8093ba`, ten sam commit co `etap-1`) |
| **Wynik** | **WARUNKOWO** |

## 1. Podsumowanie
Poprawka zamyka brak z raportu kroku 1.3: ukryta warstwa odrzuca polecenia wtyczki także ze skrótów i paneli (WAR-02 K1). Zrealizowano też decyzję P17: cofanie i ponawianie zmian zawartości zablokowanej lub ukrytej warstwy jest wstrzymane z komunikatem, a dodawanie i usuwanie warstw w panelu przechodzi przez wspólną historię. Suwak krycia wrócony do wartości początkowej nie zostawia już kroku cofania, a progi stuknięcia dopisano jako D18 (propozycja). Wszystkie kontrole uruchomione przez audytora są zielone: Vitest 146/146, Playwright WebKit 21/21, lint, typy, licencje i build. Kryteria kroku 1.3 nie uległy regresji.

Wynik dla ID w zakresie poprawki: **2 OK** (WAR-02, WAR-01 K3), **2 CZĘŚCIOWO** (WAR-03 wg P17 a, DAN-03 wg P17 b; braki drobne), **0 BRAK**, **0 ODSTĘPSTWO**. Braki:
- komunikat P17 a podaje nazwę typu warstwy, a nie nazwę konkretnej warstwy, którą pokazuje panel (np. „Rysunkowa 2”);
- dwa rzadkie przypadki brzegowe przy cofaniu dodania lub usunięcia, gdy jednocześnie wystąpi awaria wtyczki (w jednym z nich giną dane);
- luki w testach (ponowienie na ukrytej warstwie, ponowienie z porównaniem serializacji, cofnięcie dodania przed wczytaniem wtyczki);
- D18 czeka na zatwierdzenie przez właściciela.

## 2. Kontrole automatyczne (uruchomione przez audytora)
Środowisko: PowerShell 5.1, Node 26.13.0 (wersja przenośna), worktree `realizuj-krok-1-3-8093ba`, drzewo robocze czyste.

| Kontrola | Polecenie | Wynik |
|---|---|---|
| Lint | `pnpm lint` (ESLint z regułami granic modułów i `tablica/no-raw-text`, `prettier --check`) | Zielony (kod wyjścia 0) |
| Typy | `pnpm typecheck` (tsc dla app i packages, `svelte-check --fail-on-warnings`) | Zielony: 328 plików, 0 błędów, 0 ostrzeżeń |
| Testy jednostkowe i integracyjne | `pnpm test` (Vitest) | **146/146** (11 plików); `history-layers.test.ts` i `history.test.ts` razem 57/57 (`vitest --reporter=verbose`) |
| Testy e2e | `pnpm test:e2e --project=webkit` | **21/21** (w tym 2 nowe w `e2e/layers-history.spec.ts`) |
| Testy e2e Chromium | nie uruchomiono | Znany problem środowiska: Playwright Chromium nie startuje (brak danych ICU). To nie jest brak kodu. Nie ma jednak potwierdzenia na silniku najbliższym WebView2 |
| Licencje | `pnpm check:licenses` | Zielony: 225 pakietów zgodnych z GPL-3.0 |
| Testy Rust | nie uruchomiono | Kod Rust się nie zmienił: `git diff --stat 0bdd68b f6fd8e4 -- src-tauri` jest puste. Wymagałyby obejścia brakującego `oldnames.lib` (znany problem środowiska). Ostatni wynik audytora (krok 1.3): 2/2. STAN deklaruje 2/2 oraz zielone rustfmt i clippy; audytor tego nie powtórzył |
| Build | `pnpm build:web` | Zielony (vite, 1,61 s) |

## 3. Zgodność z wymaganiami
Wynik: **OK**, **CZĘŚCIOWO**, **BRAK** albo **ODSTĘPSTWO**. Każdy wynik OK wymaga dowodu. Ścieżki podano względem `app/src/`, chyba że wskazano inaczej. Nazwy testów skrócono do początku; wszystkie przeszły w uruchomieniu audytora.

### 3.1 Zakres poprawki

| ID | Kryterium | Dowód (plik:linia, test) | Wynik | Uwagi |
|---|---|---|---|---|
| WAR-02 | K1: ukryta warstwa nie przyjmuje wejścia, także poleceń wtyczki ze skrótów i paneli (zakres 1) | `lib/core/board.ts:298` (`if (record.locked \|\| !record.visible) return;`) w `Board.execute`, przez które przechodzą wszystkie polecenia wtyczek (`board.ts:280`, uchwyt z `layerContext`, `pluginContext.document.layer`). Wskaźnik: `board.ts:403`. Test `history-layers.test.ts:241` „WAR-02: a plugin command sent to a hidden layer (e.g. from a shortcut) changes nothing”: skrót Ctrl+Alt+B wtyczki testowej na ukrytej warstwie nie zmienia serializacji, nie dodaje kroku historii ani komunikatu, a po pokazaniu warstwy działa | OK | Brak z poprzedniego raportu zamknięty. Ścieżkę panelu wtyczki obejmuje ten sam warunek w `execute`, choć nie ma dla niej osobnego testu |
| WAR-02 | K1: ukryta warstwa nie jest renderowana (regresja po przepisaniu testu) | `lib/core/layer-host.ts:73-78, 125-134`. Test `history-layers.test.ts:221` „WAR-02: a hidden layer is not rendered” sprawdza teraz, że przesunięcie kamery nie przerysowuje ukrytej warstwy, a po pokazaniu jest przerysowana (`left` 1px, potem 101px) | OK | Test przepisano, bo cofanie na ukrytej warstwie jest teraz wstrzymane (P17 a). Sprawdza kryterium |
| WAR-02 | Dokumentacja API (zakres 1) | `packages/plugin-api/src/plugin.ts:64-68`; `docs/api/jak-napisac-warstwe.md` (sekcja 5); `docs/api/referencja/interfaces/LayerHandle.md`, `LayerContext.md`. Test aktualności referencji (`api-docs.test.ts`) zielony w ramach 146/146 | OK | Typy bez zmian, API 1.0.0 |
| WAR-03 (P17 a) | Cofanie i ponawianie kroku zmieniającego zawartość zablokowanej warstwy nie jest wykonywane, historia bez zmian | `board.ts:351-352` (`step` sprawdza `stepBlocked` przed `history.undo/redo`), `:371-386`. Test `:469` „WAR-03: undo and redo of a change of a locked layer are held back with a notice” sprawdza cofanie i ponawianie, Ctrl+Z, stuknięcie dwoma palcami, liczbę kroków bez zmian i działanie po odblokowaniu | OK | |
| WAR-03 (P17 a) | To samo dla ukrytej warstwy | `board.ts:381-384`. Test `:495` „DAN-03: undo and redo of a change of a hidden layer are held back with a notice” | OK | Test sprawdza tylko **cofanie**. Ponowienie na ukrytej warstwie (wymagane w sekcji „Testy” planu) nie ma testu; ścieżka kodu jest wspólna (`stepBlocked(direction)`) |
| WAR-03 (P17 a) | Chronologia P4 zachowana (wcześniejsze kroki czekają) | `board.ts:372` (sprawdzany jest tylko najbliższy krok, żaden nie jest pomijany). Test `:507` „DAN-03: the chronology stays…” | OK | |
| WAR-03 (P17 a) | Komunikat z **nazwą warstwy** i informacją, że trzeba ją odblokować lub pokazać | `board.ts:378, 382` (`notices.addOnce('notice.historyLocked' / 'notice.historyHidden', record.pluginId)`); `lib/core/notices.ts:27`; `lib/i18n/locales/pl.json:58-59`, `en.json` (te same klucze); `components/Notices.svelte:25` (`name: layerName(notice.pluginId)`). Testy `:469`, `:495` sprawdzają klucz i `pluginId` | **CZĘŚCIOWO** | Komunikat podaje nazwę **typu** warstwy (nazwa wtyczki), a nie nazwę konkretnej warstwy. Gdy w lekcji jest kilka warstw jednego typu (P3), panel nazywa je „Rysunkowa 1”, „Rysunkowa 2” (`LayersPanel.svelte:83-86`), a komunikat mówi tylko „Rysunkowa”, więc nauczyciel nie wie, którą odblokować. Dodatkowo `addOnce` scala komunikaty po `pluginId`. Treść komunikatu (odblokuj / pokaż w panelu warstw) jest zgodna z planem |
| WAR-03 (P17 a) | Kroki kolejności i krycia cofają się normalnie | `board.ts:374` (blokowane są tylko `LayerHistoryEntry` i `LayerStructureEntry`). Test `:516` „WAR-04: order and opacity of a locked or hidden layer are still undone (settings, D12)” | OK | |
| WAR-03 (P17 b) | Zablokowanej warstwy nie da się usunąć | `board.ts:206-209` (`canRemoveLayer`), `:200`; `components/LayersPanel.svelte:230` (`disabled={row.locked \|\| rows.length <= 1}`). Testy `:614` „WAR-03: a locked layer cannot be removed”; e2e `layers-history.spec.ts:248` „WAR-03: a locked layer cannot be removed” | OK | Spójne rozszerzenie: cofnięcie dodania zablokowanej warstwy, które de facto ją usuwa, też jest wstrzymane (`board.ts:377`; test `:630` „DAN-03: undoing the addition of a locked layer is held back (P17 a)”) |
| DAN-03 (P17 b) | Dodawanie i usuwanie warstw przez wspólną historię | `board.ts:101-122` (`LayerStructureEntry`), `:184-191` (`addLayer` przez `history.execute`), `:197-204` (`removeLayer`); `lib/core/document.ts:99-108, 138-159`. Testy `:531` „DAN-03: a new layer is added above the given position, becomes active and can be undone” (cofnięcie i ponowienie, kolejność kontenerów, odtworzenie zawartości), `:549` „DAN-03: a removed layer comes back with its data and settings on undo”; e2e `:221` „DAN-03: a layer is added above the active one and removed, both undoable” | OK | Nie ma już dodawania warstwy poza historią w ścieżce programu. `BoardDocument.addLayer` (`document.ts:90-97`) używają tylko testy rdzenia (`core.test.ts`) |
| DAN-03 (P17 b) | Usunięcie bez okna potwierdzenia | `LayersPanel.svelte:233` (`onclick={() => board.removeLayer(row.id)}`); e2e `:221` (klik bez okna) | OK | |
| DAN-03 (P17 b) | Dane usuniętej warstwy, także uszkodzonej lub bez wtyczki, wracają po cofnięciu bez strat (porównanie serializacji) | `board.ts:97-122` (ten sam rekord z danymi na żywo i `stored`); `document.ts:138-159`; `layer-host.ts:56-62, 77` (odmontowanie przy usunięciu, ponowne zamontowanie z `record.data`). Testy `:549` (serializacja identyczna po cofnięciu, 2 kwadraty z powrotem w DOM), `:571` „DAN-03: a broken layer or one without its plugin comes back unchanged after removal” (serializacja identyczna, statusy `broken` i `missing` zachowane) | OK | Ponowienie sprawdzono tylko kolejnością (`:549`), a dla warstw uszkodzonych wcale. Plan wymaga „cofa się i ponawia z zachowaniem danych (porównanie serializacji)”. Luka w teście, nie w kodzie |
| DAN-03 (P17 b) | Przypadki brzegowe dodawania i usuwania | Analiza kodu: `board.ts:211-234` (`prepareLayer`), `:494-529` (`breakLayer`, `breakPlugin`), `document.ts:209-219` | **CZĘŚCIOWO** | (1) **Awaria wtyczki, gdy jej warstwa jest usunięta, a usunięcie można cofnąć:** `breakPlugin` (`board.ts:524`) obsługuje tylko warstwy obecne w dokumencie. Rekord poza dokumentem zostaje ze statusem `ready` i nie dostaje aktualnego `stored`. Po cofnięciu usunięcia `LayerHost.mount` nic nie montuje (`pluginOf` zwraca undefined), panel nie pokazuje stanu „Uszkodzona”, a `serializeLayer` zapisuje stare `record.stored` (dla warstwy dodanej w tej sesji `data: null`). Zmiany z tej sesji **giną przy zapisie**, wbrew „bez strat” i WAR-06 K3. (2) **Cofnięcie dodania przed wczytaniem wtyczki:** przy zwykłym przebiegu działa poprawnie (`setRecordStatus`, `document.ts:209-212`: rekord poza dokumentem dostaje `ready`, ponowienie go montuje). Jeśli jednak `createData` albo `deserialize` rzuci wyjątek, gdy rekord jest poza dokumentem, `breakLayer` wywołuje `document.setStatus` (`board.ts:514`), które go nie znajduje. Rekord zostaje w stanie `loading`, a po ponowieniu warstwa wisi jako „Wczytywanie” (bez utraty danych). Ani zwykły przebieg (2), ani (1) nie mają testu. Oba przypadki są rzadkie |
| DAN-03 (P17 b) | Lekcja ma zawsze co najmniej jedną warstwę | `board.ts:208` (`layers.length > 1`); `LayersPanel.svelte:230`. Test `:623` „DAN-03: the last layer of the lesson cannot be removed” | OK | Przy chronologicznej historii cofanie i ponawianie odtwarza wcześniejsze stany, więc nie może zejść do zera warstw (analiza). Stan wyłączenia przycisku dla ostatniej warstwy nie ma testu e2e |
| DAN-03 (P17 b) | Usunięcie aktywnej warstwy | `document.ts:143-149`. Test `:639` „DAN-03: removing the active layer makes the layer at its place active” | OK | Plan tego nie określa. Aktywna staje się warstwa nad usuniętą (komentarz w kodzie mówi „at its place (or below)”, co jest zgodne). Cofnięcie usunięcia nie przywraca aktywności. Uwaga: `activeByPlugin.set(next…)` zmienia też aktywną warstwę typu nowej aktywnej, więc narzędzie tego typu przełącza się na nią (to samo robi `setActiveLayer`) |
| DAN-03 (zakres 4) | Suwak wrócony do wartości początkowej nie zostawia kroku | `lib/core/history.ts:81-85` (`isEmpty` po scaleniu, usunięcie wpisu, `open = false`); `board.ts:91-94`. Testy `history.test.ts` „DAN-03: a merged change that ends where it started is dropped”; `history-layers.test.ts:451` „DAN-03: a slider moved back to its starting value leaves no undo step” (sprawdza też, że dalszy ruch po powrocie tworzy nowy krok i nie dołącza do wcześniejszego) | OK | Scalanie po usunięciu pustego wpisu jest poprawne (`open = false`, więc kolejny ruch nie łączy się ze starszym wpisem `OpacityEntry` tej samej warstwy). Skutek uboczny: pusty ruch suwaka czyści stos ponawiania, ale robi to już pierwsza zmiana w tym ruchu, więc to zachowanie zwykłe |
| WAR-01 K3 | Interfejs dodawania warstw: wybór typu spośród dostępnych wtyczek, nowa warstwa nad aktywną staje się aktywna (P3) | `LayersPanel.svelte:63-67` (typy: zarejestrowane wtyczki bez stanu `broken`), `:71-76` (indeks aktywna + 1), `:283-304` (lista wyboru i przycisk przez `t()`); `board.ts:188` (`setActiveLayer`). Testy `:531`; e2e `:221` (tło aktywne, dodanie rysunkowej daje kolejność `[tło, rysunkowa, multimedia, rysunkowa]` i nowa warstwa jest aktywna) | OK | Typy jeszcze niewczytane (`available`) są na liście i wczytują się leniwie przy dodaniu (NF-03). Ponowienie dodania nie ustawia ponownie aktywnej warstwy (plan tego nie wymaga) |
| D18 | Progi stuknięcia dopisane do tabeli D jako parametr do zatwierdzenia (zakres 5) | `docs/etapy/ETAP-1-plan.md:681` | OK | Wpis oznaczony jako „Propozycja do zatwierdzenia”. **Wymaga decyzji właściciela.** Wartości zgodne z kodem (`lib/core/tap-gesture.ts`) |

### 3.2 Kryteria kroku 1.3 po poprawce (regresja w ramach etapu)

| ID | Kryterium | Dowód (test w uruchomieniu audytora) | Wynik | Uwagi |
|---|---|---|---|---|
| DAN-03 | K1 klawisze, przyciski, gesty D3; każda operacja cofana | „DAN-03: Ctrl+Z undoes…”, „…buttons call the same operations…”, „…tap with two fingers…(D3)”, „…every operation of the test plugin and of the layer panel…”; e2e o tych samych nazwach | OK | Test „every operation…” nie obejmuje dodawania i usuwania; robią to osobne testy z 3.1 |
| DAN-03 | K2 limit 50/51, ustawienie 10–500 (D6) | `history.test.ts` (limit), „DAN-03: the limit of 50 steps applies to plugin commands…”, „…the limit set by the user is applied (D6)”; e2e „…undo limit…(D6)” | OK | |
| DAN-03 | K3 wspólna historia (P4) | „DAN-03: one common history keeps the chronological order…(P4)”, „DAN-03: the chronology stays…” | OK | |
| DAN-03 | K4 tylko wspólny mechanizm | „DAN-03: plugin commands are recorded only in the common history”, „…cannot take the undo and redo shortcuts” | OK | |
| WAR-02 | K2, D12 | „WAR-02: the visibility is saved in the lesson”, „…is a view setting and is not undone (D12)” | OK | |
| WAR-03 | K1, K2, D12 | „WAR-03: no tool of the test plugin…”, „…a plugin command sent to a locked layer…”, „…other layers keep working…”, „…the lock is shown…(D12)”; e2e „WAR-03: the panel shows the lock state…” | OK | |
| WAR-04 | K1, K2 (D12) | 4 testy integracyjne WAR-04 i 3 testy e2e WAR-04 | OK | |
| WAR-05 | K1, K2 (D12, jeden krok za ruch suwaka) | 6 testów integracyjnych WAR-05 i 2 testy e2e WAR-05 | OK | |

**Zakres ID:** plan, krok 1.3-poprawka: WAR-02 K1, WAR-03 K1 (P17 a), DAN-03 K1 (P17 b), WAR-01 K3. Wszystkie te ID są w sekcji 10 dokumentacji przypisane do etapu 1. Braków w planie dla tego kroku nie stwierdzono.

**Zamknięcie zaleceń poprzedniego raportu:**
1. WAR-02 K1: zamknięte.
2. P17 a i b: zdecydowane i zrealizowane (z uwagami z 3.1).
3. WAR-03 „test każdego narzędzia”: dopisane w MACIERZ jako kryterium dziedziczone dla kroków 1.4–1.7.
4. Pusty krok suwaka: zamknięte.
5. Progi gestu: D18 jako propozycja, czeka na właściciela.
6. Środowisko (Chromium, `oldnames.lib`): bez zmian.

**Zgodność MACIERZ / STAN / CHANGELOG:**
- MACIERZ: WAR-02, WAR-03 i DAN-03 zmienione z W TOKU na ZAIMPL., WAR-01 z dopiskiem o kroku 1.3-poprawka, pliki testów poprawne. Podsumowanie etapu 1 (6 ZAIMPL.: WAR-01–05, DAN-03) jest zgodne z wierszami. Nikt nie ustawił statusu ZWERYF. W świetle 3.1 status ZAIMPL. dla WAR-03 i DAN-03 jest dopuszczalny (braki drobne), ale uwagi z sekcji 8 powinny trafić do MACIERZ.
- STAN: krok 1.3-poprawka UKOŃCZONY. Dziennik jest zgodny z kodem, a liczby (Vitest 146/146, WebKit 21/21) potwierdzone przez audytora. „Następne działania” zawierają zatwierdzenie D18.
- CHANGELOG: dwa wpisy z ID (DAN-03, WAR-01, WAR-02, WAR-03) zgodne z kodem.
- Plan: wykonawca w ramach zakresu 5 dopisał D18 i przestawił wiersz P17 za P16 (treść bez zmian).

## 4. Regresja poprzednich etapów
| Etap | Testy | Wynik |
|---|---|---|
| Etap 1, kroki 1.0–1.2 | Vitest: `core.test.ts`, `layers.test.ts` (w tym `board.addLayer` przez historię, `:101`, `:397`), `api.test.ts`, `boundaries.test.ts`, `no-raw-text.test.ts`, `api-docs.test.ts`, `i18n/core.test.ts`, `tokens.test.ts`, `license-policy.test.ts`, wszystkie w ramach 146/146; e2e `shell.spec.ts` (WebKit, w ramach 21/21) | Brak regresji |
| Etap 1, krok 1.3 | `history.test.ts`, `history-layers.test.ts`, `e2e/layers-history.spec.ts` (sekcja 3.2) | Brak regresji (jeden test przepisany zgodnie z P17 a, opis w 3.1) |
| Etap 1, krok 1.1 | `spikes/` poza programem, bez zmian | Nie dotyczy |
| Rust | Kod bez zmian od kroku 1.3 | Nie uruchomiono (sekcja 2) |

## 5. Niezmienniki architektury i wymagania przekrojowe
| Reguła | Wynik | Dowód / uwagi |
|---|---|---|
| Rdzeń nie zna konkretnych warstw (WAR-12) | OK | `app/src/lib` i `app/src/components` nie odwołują się do `layer-drawing`, `layer-background`, `layer-media` ani `test-fixture` (poza testami). Jedyne odwołania są w `composition/builtin.ts` (leniwe `import()`). Lista typów w panelu pochodzi z `PluginManager.list()`. Lint granic modułów zielony |
| Izolacja warstw (WAR-06) | OK | `LayerStructureEntry` działa na liście warstw rdzenia i nie dotyka danych innych wtyczek. Blokada `execute` dotyczy tylko rekordu wskazanej warstwy. Uwaga z 3.1 (awaria wtyczki przy usuniętej warstwie) dotyczy WAR-06 K3 w przypadku brzegowym |
| Brak tekstów UI na sztywno (UI-01) | OK | Nowe klucze `layers.addType`, `layers.add`, `layers.remove`, `notice.historyLocked`, `notice.historyHidden` są w `pl.json` i `en.json` (test parytetu zielony). `tablica/no-raw-text` zielony |
| Wspólny mechanizm cofania (DAN-03) | OK | Dodawanie i usuwanie warstw przechodzi teraz przez `History`. Wstrzymanie P17 a nie zmienia historii. Wpisy pomijane w `peek` dotyczą tylko wyboru warstwy do przerysowania |
| Zgodność wsteczna API wtyczek | OK | Typy bez zmian, `@tablica/plugin-api` 1.0.0 (`git diff 0bdd68b f6fd8e4 -- packages` zmienia tylko komentarz w `plugin.ts`). Ignorowanie `execute` na ukrytej warstwie zawęża zachowanie tak samo jak dla blokady. Jest udokumentowane w kodzie, w przewodniku i w referencji. ADR niepotrzebny |
| Leniwe ładowanie (NF-03) | OK | Wtyczka dodawanego typu wczytuje się dopiero przy dodaniu warstwy (`board.ts:189`, `prepareLayer`) |
| Licencje zależności (NF-01) | OK | Brak zmian w `package.json`, `pnpm-lock.yaml` i `Cargo.toml`. `pnpm check:licenses`: 225 pakietów zgodnych |
| Offline (NF-05) | OK | Brak żądań sieciowych w nowym kodzie |
| Wykluczenia WYK-01–05 nienaruszone | OK | Brak współpracy, kont, chmury, łączenia urządzeń i funkcji mikrokontrolerów |

## 6. Elementy spoza dokumentacji
- **Wstrzymanie cofania dodania oraz ponowienia usunięcia zablokowanej warstwy** (`board.ts:374-380`): nie ma tego wprost w P17 a, który mówi o zmianach zawartości, ale wynika z zasady P17 b („zablokowanej warstwy nie da się usunąć”). Spójne, udokumentowane w STAN. Dopuszczalne.
- **`Notices.addOnce`** (bez powtarzania tego samego komunikatu): element techniczny służący P17 a. Dopuszczalny.
- **Zmiana aktywnej warstwy po usunięciu aktywnej** (`document.ts:145-149`): element konieczny, bo plan nie określa reguły. Dopuszczalny.
- Nie stwierdzono funkcji wykraczających poza dokumentację i plan.

## 7. Testy ręczne dla właściciela
Plan (sekcja 5) nie przypisuje do tych ID testów [R] poza ogólnym R52. Poniższe testy obejmują to, czego nie da się sprawdzić automatycznie. Uruchamiać w zbudowanej aplikacji Tauri (`pnpm tauri dev` albo instalator). Testy M1–M8 z raportu kroku 1.3 pozostają aktualne; poniżej testy nowe.

- [x] **ZALICZONY 2026-11-21** (właściciel, WebView2); po decyzji P20 nowa warstwa dostaje numer z chwili dodania, więc para nazw to „Rysunek” i „Rysunek 2”, a nie „1” i „2” jak pisał ten raport. P1 (WAR-01 K3, P3, Windows): w panelu warstw kliknij nazwę warstwy „Tło”, wybierz z listy „Rysunkowa” i kliknij „Dodaj warstwę” → nowa warstwa „Rysunkowa” pojawia się bezpośrednio nad tłem, jest podświetlona jako aktywna, a obie warstwy rysunkowe mają numery (1, 2). Lista typów zawiera tylko warstwy zainstalowane, w bieżącym języku.
- [x] **ZALICZONY 2026-11-21 bez ostatniej części** (właściciel, WebView2): usunięcie bez potwierdzenia, cofnięcie i ponowienie działają; zapis lekcji po cofnięciu i ponowne otwarcie po kroku 1.5. P2 (DAN-03 / P17 b, Windows): na warstwie z treścią (po kroku 1.4: kilka kresek pióra) kliknij ikonę kosza → warstwa znika od razu, bez okna potwierdzenia. Ctrl+Z → warstwa wraca na to samo miejsce z całą treścią, kryciem i widocznością. Ctrl+Y → znika ponownie. Zapisz lekcję po cofnięciu (po kroku 1.5) i otwórz ją ponownie → treść jest kompletna.
- [x] **ZALICZONY 2026-11-21** (właściciel, WebView2). P3 (WAR-03 / P17 b, Windows): zablokuj warstwę → jej kosz jest wyszarzony i nie reaguje. Usuń kolejne warstwy, aż zostanie jedna → kosz ostatniej warstwy jest wyszarzony.
- [x] **ZALICZONY 2026-11-21** (właściciel, WebView2): komunikat dla zablokowanej i ukrytej warstwy, dla Ctrl+Z i Ctrl+Y, po polsku i po angielsku; bez mnożenia komunikatów. P4 (WAR-03 / P17 a, Windows): narysuj coś na warstwie (albo, przed krokiem 1.4, użyj wtyczki testowej w trybie deweloperskim), zablokuj ją i naciśnij Ctrl+Z → nic się nie cofa, pojawia się komunikat po polsku z nazwą warstwy i prośbą o odblokowanie w panelu warstw. Kolejne Ctrl+Z nie mnożą komunikatów. Odblokuj i naciśnij Ctrl+Z → zmiana się cofa. Powtórz z warstwą ukrytą (komunikat o pokazaniu warstwy) oraz dla Ctrl+Y. Przełącz język na EN → komunikat po angielsku.
- [ ] P5 (P17 a, Windows): dodaj drugą warstwę rysunkową, narysuj na obu, zablokuj jedną i naciśnij Ctrl+Z → **sprawdź, czy komunikat pozwala rozpoznać, którą z dwóch warstw rysunkowych odblokować** (audytor: komunikat podaje tylko nazwę typu; do decyzji, czy to wystarcza).
- [x] **ZALICZONY 2026-11-21** (właściciel, WebView2): kolejność i krycie cofają się na zablokowanej i ukrytej warstwie, bez komunikatu (D12). P6 (P17 a, D12, Windows): zmień krycie i kolejność warstwy, potem ją zablokuj i ukryj, naciśnij Ctrl+Z dwa razy → kolejność i krycie się cofają, bez komunikatu.
- [ ] **ODŁOŻONY 2026-11-21 do kroku 1.6:** żadna wbudowana wtyczka nie ma dziś skrótu ani polecenia w panelu, które zmienia dane warstwy (panel rysunkowy ustawia tylko kolor i grubość narzędzia), więc testu nie da się wykonać w programie. Mechanizm pokryty testami jednostkowymi ze wtyczką testową; powtórzyć, gdy w kroku 1.6 dojdą gumka i zaznaczanie. P7 (WAR-02 K1, Windows, po kroku 1.4 lub z wtyczką testową): ukryj warstwę i użyj skrótu klawiszowego albo panelu jej wtyczki → po ponownym pokazaniu warstwy nie ma na niej żadnej zmiany, a przycisk „Cofnij” nie dostał nowego kroku.
- [x] **ZALICZONY 2026-11-21 w części Windows** (właściciel, WebView2): przeciągnięcie wracające do wartości początkowej nie zostawia kroku, a przeciągnięcie do 60 % to jeden krok cofania; Android po P12. P8 (DAN-03, Windows; Android po P12): przeciągnij suwak krycia ze 100 % do ok. 40 % i z powrotem do 100 %, puść → przycisk „Cofnij” pozostaje nieaktywny, jeśli wcześniej był nieaktywny. Przeciągnij do 60 % i puść → jedno Ctrl+Z przywraca 100 %.
- [ ] P9 (D18, urządzenie dotykowe po P12): zatwierdź lub zmień progi stuknięcia (350 ms, 12 px) po teście M1 z raportu kroku 1.3.
- [ ] P10 (wszystkie, Linux i Android po P12): powtórzyć P1–P8 na WebKitGTK i Android WebView; dla P1–P3 także dotykiem.
- [x] **ZALICZONY 2026-11-21**: środowisko naprawione (`playwright install chromium --force`), pełny zestaw e2e przechodzi w Chromium 36/36 (w chwili pisania raportu było 21 testów). P11 (R52 częściowo): po naprawie środowiska `pnpm exec playwright install chromium --force`, potem `pnpm test:e2e --project=chromium` → 21/21.

## 8. Zalecenia
1. **(Średni)** Awaria wtyczki przy usuniętej warstwie (3.1, przypadek 1). Gdy wtyczka się psuje, rekordy jej warstw trzymane w historii (`LayerStructureEntry` poza dokumentem) też trzeba oznaczyć jako uszkodzone i zapisać im aktualne `stored`. Alternatywa: `breakLayer` lub `setStatus` obsługuje rekord poza dokumentem, a `restoreLayer` sprawdza stan wtyczki. Dodać test „usunięta warstwa, awaria wtyczki, cofnięcie usunięcia: serializacja zawiera dane, status `broken`”.
2. **(Niski)** Komunikat P17 a powinien wskazywać konkretną warstwę (np. nazwę z numerem jak w panelu, przez parametr komunikatu), a `addOnce` powinno rozróżniać warstwy. Do decyzji właściciela, czy obecny stan wystarcza (test P5).
3. **(Niski)** `breakLayer` dla rekordu poza dokumentem (3.1, przypadek 2) nie zmienia statusu. Użyć `setRecordStatus` także w `breakLayer`. Dodać test „cofnięcie dodania przed wczytaniem wtyczki, potem ponowienie” (przebieg zwykły i z błędem `createData`).
4. **(Niski)** Uzupełnić testy wymagane w sekcji „Testy” planu: ponowienie na ukrytej warstwie wstrzymane i działające po pokazaniu; ponowienie dodania i usunięcia (także warstwy uszkodzonej) z porównaniem serializacji; e2e: wyłączony kosz ostatniej warstwy.
5. **(Decyzja właściciela)** Zatwierdzić albo zmienić D18.
6. **(Środowisko)** Bez zmian względem raportu kroku 1.3: Playwright Chromium (ICU) i `oldnames.lib`.
