# Raport weryfikacji: etap 1 krok 1.3-poprawka-2 (wersja raportu v1)

| Pole | Wartość |
|---|---|
| Data | 2026-11-20 |
| Wersja dokumentacji | 1.1 |
| Plan | `docs/etapy/ETAP-1-plan.md` (ZATWIERDZONY 2026-11-01): sekcja 4 („Krok 1.3-poprawka-2”), P3, P4, P17, tabela D (D12, D18) |
| Commit | 9e477e18e6f14ba4fdb07a34bbbdeb68b72175eb (worktree `nice-bardeen-c52882`, gałąź `claude/nice-bardeen-c52882`; ten sam commit co `etap-1`) |
| **Wynik** | **ZALICZONY** (z uwagami niskiego priorytetu, sekcja 8) |

## 1. Podsumowanie
Krok zamyka cztery zalecenia z raportu `ETAP-1-krok-1.3-poprawka-weryfikacja.md` (sekcja 8, punkty 1–4). Awaria wtyczki obejmuje teraz także warstwy trzymane tylko w historii. Ich najnowsze dane trafiają do zapisu, a po cofnięciu usunięcia warstwa jest oznaczona jako uszkodzona. Warstwa dodana i cofnięta przed wczytaniem wtyczki dostaje właściwy stan. Komunikaty P17 a podają nazwę warstwy z numerem, liczonym tą samą funkcją co w panelu. Uzupełniono też brakujące testy. Wszystkie kontrole uruchomione przez audytora są zielone: Vitest 155/155, Playwright WebKit 23/23, lint, typy, licencje i build. Wynik dla ID kroku: **2 OK** (DAN-03 K1 / P17 b, WAR-03 K1 / P17 a), **0 CZĘŚCIOWO**, **0 BRAK**, **0 ODSTĘPSTWO**. Uwagi drobne: numer w komunikacie to stan z chwili jego pokazania (może się zdezaktualizować po zmianie kolejności lub usunięciu warstwy), dwie ścieżki kodu nie mają osobnego testu, a dwa przypadki testowe mają tę samą nazwę.

## 2. Kontrole automatyczne (uruchomione przez audytora)
Środowisko: Windows 11, PowerShell 5.1, Node 26.13.0 (wersja przenośna), worktree `nice-bardeen-c52882`. Drzewo robocze czyste przed kontrolami i po nich.

| Kontrola | Polecenie | Wynik |
|---|---|---|
| Lint | `pnpm lint` (ESLint z regułami granic modułów i `tablica/no-raw-text`, `prettier --check`) | Zielony (kod wyjścia 0, „All matched files use Prettier code style!”) |
| Typy | `pnpm typecheck` (tsc dla app i packages, `svelte-check --fail-on-warnings`) | Zielony: 328 plików, 0 błędów, 0 ostrzeżeń |
| Testy jednostkowe/integracyjne | `pnpm test` (Vitest) | **155/155** (11 plików). Osobno `vitest run src/composition/history-layers.test.ts --reporter=verbose`: 49/49, w tym wszystkie nowe testy z sekcji 3 |
| Testy e2e | `pnpm test:e2e --project=webkit` | **23/23** (w tym 2 nowe w `e2e/layers-history.spec.ts`) |
| Testy e2e Chromium | nie uruchomiono | Znany problem środowiska: Playwright Chromium nie startuje (brak danych ICU, `icudtl.dat`). To nie jest brak kodu, ale brak potwierdzenia na silniku najbliższym WebView2 |
| Licencje | `pnpm check:licenses` | Zielony: 225 pakietów zgodnych z GPL-3.0 |
| Testy Rust | nie uruchomiono | Kod Rust bez zmian: `git diff --stat f6a14ce 9e477e1 -- src-tauri` jest puste. Uruchomienie wymaga obejścia brakującego `oldnames.lib` (znany problem środowiska). STAN deklaruje rustfmt, clippy i cargo test 2/2; audytor tego nie powtórzył. Ostatni wynik audytora: 2/2 (krok 1.3) |
| Build | `pnpm build:web` | Zielony (vite, 1,61 s) |

## 3. Zgodność z wymaganiami
Wynik: **OK**, **CZĘŚCIOWO**, **BRAK** albo **ODSTĘPSTWO**. Ścieżki podano względem `app/src/`, chyba że wskazano inaczej. Wszystkie wymienione testy przeszły w uruchomieniu audytora.

**Zakres ID:** plan kroku: DAN-03 (K1, P17 b), WAR-03 (K1, P17 a). Oba ID są w sekcji 10 dokumentacji przypisane do etapu 1. Braków w planie dla tego kroku nie stwierdzono.

### 3.1 Zakres kroku

| ID | Kryterium (plan, zakres / testy) | Dowód (plik:linia, test) | Wynik | Uwagi |
|---|---|---|---|---|
| DAN-03 (P17 b) | Zakres 1: awaria wtyczki zachowuje najnowsze dane także warstw usuniętych, które można przywrócić cofnięciem; po cofnięciu usunięcia warstwa jest uszkodzona, a zapis zawiera najnowsze dane | `lib/core/board.ts:524-534` (`breakPlugin` iteruje po `layerRecords()`), `:537-543` (`layerRecords`: warstwy dokumentu oraz rekordy wszystkich `LayerStructureEntry` z historii), `lib/core/history.ts:150-152` (getter `entries` = stos cofania + stos ponawiania), `board.ts:497-521` (`breakLayer` serializuje dane, póki wtyczka jest aktywna, bo `markBroken` następuje po pętli, `:532`), `lib/core/document.ts:209-212` (`setRecordStatus` dla rekordu poza dokumentem). Test `history-layers.test.ts:720` „DAN-03: a plugin failure keeps the newest data of a removed layer; undo brings it back broken”: dwie usunięte warstwy (jedna dodana w tej sesji, bez wcześniejszego zapisu), awaria wtyczki, dwa cofnięcia; sprawdza status `broken` w dokumencie i w kontenerze DOM oraz to, że serializacja zawiera dane sprzed awarii (2 kwadraty) | OK | Test rzeczywiście sprawdza kryterium (porównanie z danymi na żywo sprzed awarii, a nie z `stored`). Gałąź „cofnięte dodanie” (rekord w stosie ponawiania) jest objęta przez `entries`, ale nie ma osobnego testu. Brak testu, że rekordy w historii **innych** wtyczek pozostają nietknięte; analiza kodu: filtr `record.pluginId === pluginId` (`:530`) i `discard` po `layerId` (`:514-516`), więc izolacja jest zachowana |
| DAN-03 (P17 b) | Zakres 2: warstwa dodana i cofnięta przed wczytaniem wtyczki dostaje właściwy stan (gotowa / uszkodzona / brak wtyczki), także przy nieudanym wczytaniu; po ponowieniu nie zostaje „Wczytywanie” | `board.ts:212-235` (`prepareLayer`: `setRecordStatus` w obu gałęziach), `:518` (`breakLayer` używa teraz `setRecordStatus`, więc błąd `createData` lub `deserialize` przy rekordzie poza dokumentem ustawia `broken`). Test `history-layers.test.ts:791` (`it.each`, 3 przypadki) „DAN-03: a layer added and undone before its plugin is loaded is ready/broken after redo”: wczytanie udane → `ready`; `createData` rzuca → `broken`; `load` odrzucone → `broken`. Każdy przypadek sprawdza status w dokumencie i w kontenerze DOM po ponowieniu | OK | Stan „brak wtyczki” (`missing`) nie dotyczy dodawania, bo panel oferuje tylko zarejestrowane typy (`LayersPanel.svelte`). Przypadki 2 i 3 mają tę samą nazwę testu („…is broken after redo”), co utrudnia diagnozę przy błędzie (uwaga kosmetyczna) |
| WAR-03 (P17 a) | Zakres 3: komunikaty o wstrzymanym cofaniu podają nazwę warstwy jak panel (z numerem przy kilku warstwach jednego typu) | `lib/core/document.ts:226-231` (`numberOf`), `board.ts:379-386` (parametr `number` w `addOnce`), `lib/i18n/i18n.svelte.ts:53-56` (`layerTitle`, klucz `layers.numbered`), `components/Notices.svelte:25-30`, `components/LayersPanel.svelte:51, 75-77` (panel używa tych samych `numberOf` i `layerTitle`, więc numeracja jest spójna z założenia). `lib/core/notices.ts:31-39` (`addOnce` porównuje także `params`, więc rozróżnia warstwy jednego typu). Testy: `history-layers.test.ts:817` „WAR-03: the message gives the number of the layer when its type occurs several times” (zablokowana warstwa 2 → `{number: 2}`, ukryta warstwa 1 → osobny komunikat `{number: 1}`), `:837` „…gives no number when the type of the layer occurs once” (`{number: 0}`); e2e `layers-history.spec.ts:266` „WAR-03: a held-back step names the layer with its number, as the panel does (P17 a)”: tekst komunikatu zawiera nazwę z wiersza panelu („… 1”) | OK | Teksty przez `t()` w PL i EN (bez nowych kluczy). **Uwaga (niska):** numer jest zapisywany w komunikacie w chwili jego dodania. Jeśli potem zmieni się kolejność warstw albo któraś warstwa tego typu zostanie usunięta, komunikat dalej pokazuje stary numer i może wskazywać inną warstwę niż panel. Kolejna próba cofnięcia doda wtedy drugi komunikat z nowym numerem (bo `addOnce` porównuje parametry). Przypadek rzadki; komunikat jest poprawny w chwili pokazania |
| DAN-03 / WAR-03 | Test: ponowienie wstrzymane na ukrytej warstwie i działające po pokazaniu | `board.ts:384-386`. Test `history-layers.test.ts:847` „DAN-03: redo of a change of a hidden layer is held back with a notice and works once it is shown” (stan danych, `redoCount` bez zmian, komunikat, działanie po pokazaniu) | OK | Zamyka lukę z poprzedniego raportu (zalecenie 4) |
| DAN-03 (P17 b) | Test: ponowienie dodania i usunięcia z porównaniem serializacji | Test `:646` „DAN-03: redoing the addition and removal of layers keeps their data (serialization)”: pełne cofnięcie, ponowienie krok po kroku, serializacja identyczna jak przed cofnięciem (dodanie z danymi, usunięcie), kolejność kontenerów, odtworzona zawartość DOM, ponowne cofnięcie | OK | |
| DAN-03 (P17 b) | Test: ponowienie usunięcia warstwy uszkodzonej i bez wtyczki z porównaniem serializacji | Test `:693` „DAN-03: removing and re-adding a broken layer or one without its plugin keeps its data on redo”: cofnięcie, ponowienie i ponowne cofnięcie z porównaniem pełnej serializacji, statusy `broken` i `missing` zachowane | OK | |
| DAN-03 (P17 b) | Test e2e: przycisk usuwania wyłączony przy ostatniej warstwie | e2e `layers-history.spec.ts:256` „DAN-03: the remove button of the last layer is disabled” (po usunięciu dwóch warstw przycisk ostatniej jest wyłączony, po cofnięciu znów aktywny) | OK | |

### 3.2 Kryteria kroków 1.3 i 1.3-poprawka (regresja w ramach etapu)
Wszystkie testy z sekcji 3.1 i 3.2 raportu kroku 1.3-poprawka przeszły w uruchomieniu audytora (Vitest 155/155, WebKit 23/23). Żaden wcześniejszy test nie został zmieniony: diff `history-layers.test.ts` i `layers-history.spec.ts` zawiera wyłącznie dopisane testy. Zmiana `LayersPanel.svelte` (numeracja przez `numberOf` zamiast lokalnego liczenia) jest równoważna logicznie: numer od dołu wśród warstw tego samego typu, 0 dla pojedynczej. Potwierdzają to testy e2e panelu, w tym „WAR-01” i „DAN-03: a layer is added above the active one…”.

| ID | Kryterium | Wynik |
|---|---|---|
| DAN-03 K1–K4, D6, P4 | jak w raporcie kroku 1.3-poprawka, sekcja 3.2 | OK (bez regresji) |
| WAR-02 K1, K2 | jw. | OK (bez regresji) |
| WAR-03 K1, K2, P17 a/b | jw. | OK (bez regresji) |
| WAR-04, WAR-05 | jw. | OK (bez regresji) |
| WAR-01 K3 | dodawanie warstwy w panelu | OK (bez regresji) |

**Zamknięcie zaleceń poprzedniego raportu (sekcja 8):**
1. (Średni) Awaria wtyczki przy usuniętej warstwie: **zamknięte** (3.1, wiersz 1; zalecany test dodany).
2. (Niski) Komunikat z konkretną warstwą, `addOnce` rozróżnia warstwy: **zamknięte** (3.1, wiersz 3), z uwagą o numerze z chwili pokazania.
3. (Niski) `breakLayer` dla rekordu poza dokumentem: **zamknięte** (`setRecordStatus`, 3.1, wiersz 2; testy przebiegu zwykłego i z błędem).
4. (Niski) Luki w testach: **zamknięte** (ponowienie na ukrytej warstwie, ponowienie z porównaniem serializacji, także dla warstw uszkodzonej i bez wtyczki, e2e wyłączonego kosza).
5. D18: zatwierdzone przez właściciela w commicie `f6a14ce` (tabela D planu, wiersz D18).
6. Środowisko: bez zmian (Chromium ICU, `oldnames.lib`).

**Zgodność MACIERZ / STAN / CHANGELOG:**
- MACIERZ: WAR-03 i DAN-03 zmienione z W TOKU na ZAIMPL., opisy zgodne z kodem i nazwami testów. Podsumowanie etapu 1 (6 ZAIMPL.) jest zgodne z wierszami (WAR-01–05, DAN-03). Nikt nie ustawił statusu ZWERYF.
- STAN: krok 1.3-poprawka-2 UKOŃCZONY, bieżący krok to 1.4. Dziennik jest zgodny z diffem, liczby potwierdzone przez audytora (Vitest 155/155, WebKit 23/23, licencje 225). Twierdzenia „4 z nich nie przechodzą bez poprawki” oraz o kontrolach Rust audytor nie sprawdzał. Kolumna commita ma wpis „(ten commit)” zamiast hasha (drobne).
- CHANGELOG: trzy wpisy w „Poprawiono” z ID (DAN-03, WAR-03) zgodne z kodem.

## 4. Regresja poprzednich etapów
| Etap | Testy | Wynik |
|---|---|---|
| Etap 1, kroki 1.0 i 1.2 | Vitest: `core.test.ts`, `layers.test.ts`, `api.test.ts`, `boundaries.test.ts`, `no-raw-text.test.ts`, `api-docs.test.ts`, `i18n/core.test.ts`, `tokens.test.ts`, `license-policy.test.ts` (w ramach 155/155); e2e `shell.spec.ts` (w ramach 23/23) | Brak regresji |
| Etap 1, kroki 1.3 i 1.3-poprawka | `history.test.ts`, `history-layers.test.ts`, `e2e/layers-history.spec.ts` | Brak regresji |
| Etap 1, krok 1.1 | `spikes/` poza programem, bez zmian | Nie dotyczy |
| Rust | Kod bez zmian od kroku 1.3 | Nie uruchomiono (sekcja 2) |
| Poprzednie etapy | Brak (etap 1 jest pierwszy) | Nie dotyczy |

## 5. Niezmienniki architektury i wymagania przekrojowe
| Reguła | Wynik | Dowód / uwagi |
|---|---|---|
| Rdzeń nie zna konkretnych warstw (WAR-12) | OK | Zmienione pliki rdzenia (`board.ts`, `document.ts`, `history.ts`, `notices.ts`, `i18n.svelte.ts`) i komponenty nie odwołują się do konkretnych wtyczek. Lint granic modułów zielony |
| Izolacja warstw (WAR-06) | OK | `breakPlugin` obejmuje wyłącznie rekordy wtyczki, która uległa awarii (`board.ts:530`). `discard` usuwa tylko wpisy danej warstwy (`:514-516`). Zakres 1 wzmacnia WAR-06 K3 (dane nie giną przy awarii). Brak testu negatywnego dla rekordów innych wtyczek w historii (zalecenie 2) |
| Brak tekstów UI na sztywno (UI-01) | OK | Nazwa warstwy składana przez `t('layers.numbered')` (`pl.json:22`, `en.json:22`). Bez nowych kluczy. `tablica/no-raw-text` i test parytetu zielone |
| Wspólny mechanizm cofania (DAN-03) | OK | Nowy getter `History.entries` tylko odczytuje stosy (kopia tablic). Żadna nowa operacja nie omija `History` |
| Zgodność wsteczna API wtyczek | OK | `packages/` bez zmian (`git diff --stat f6a14ce 9e477e1 -- packages` puste). API 1.0.0 |
| Leniwe ładowanie (NF-03) | OK | Bez zmian w ładowaniu. Test „slow-one” potwierdza, że wtyczka wczytuje się dopiero przy dodaniu warstwy |
| Licencje zależności (NF-01) | OK | Brak zmian w `package.json`, `app/package.json`, `pnpm-lock.yaml`, `Cargo.toml`. `pnpm check:licenses`: 225 pakietów zgodnych |
| Offline (NF-05) | OK | Brak żądań sieciowych w nowym kodzie |
| Wykluczenia WYK-01–05 nienaruszone | OK | Brak współpracy, kont, chmury, łączenia urządzeń i funkcji mikrokontrolerów |

## 6. Elementy spoza dokumentacji
- `History.entries`, `BoardDocument.numberOf`, `layerTitle`, publiczne pole `LayerStructureEntry.record`: elementy techniczne służące zakresom 1 i 3 (DAN-03, WAR-03). Dopuszczalne.
- Komunikat `notice.layerBroken` pojawia się także przy błędzie wczytania warstwy, która jest w tej chwili poza dokumentem (cofnięte dodanie). Wynika to z istniejącego zachowania `breakLayer` i jest spójne z WAR-06 K3. Dopuszczalne.
- Nie stwierdzono funkcji wykraczających poza dokumentację i plan.

## 7. Testy ręczne dla właściciela
Plan (sekcja 5) nie przypisuje do tego kroku testów [R] poza ogólnym R52. Uruchamiać w zbudowanej aplikacji Tauri (`pnpm tauri dev` albo instalator). Testy M1–M8 z raportu kroku 1.3 oraz P1–P11 z raportu kroku 1.3-poprawka pozostają aktualne. Test P5 z tamtego raportu zastępuje poniższy test Q1.

- [ ] Q1 (WAR-03 / P17 a, Windows): dodaj drugą warstwę rysunkową (panel pokazuje „Rysunkowa 1” i „Rysunkowa 2”). Zmień zawartość obu (po kroku 1.4 pióro, wcześniej wtyczka testowa w trybie deweloperskim), zablokuj „Rysunkowa 2” i naciśnij Ctrl+Z → komunikat po polsku zawiera „Rysunkowa 2”, czyli dokładnie tę nazwę co panel. Kolejne Ctrl+Z nie mnożą komunikatu. Przełącz język na EN → nazwa „Drawing 2” zgodna z panelem.
- [ ] Q2 (WAR-03 / P17 a, Windows): przy jednej warstwie danego typu zablokuj ją i naciśnij Ctrl+Z → komunikat podaje nazwę bez numeru, jak panel.
- [ ] Q3 (WAR-03, Windows, przypadek z uwagi w 3.1): przy pokazanym komunikacie z Q1 przesuń „Rysunkowa 2” pod „Rysunkowa 1” (panel przenumeruje warstwy) → sprawdź, czy treść komunikatu nie wprowadza w błąd. Audytor: komunikat zachowuje stary numer. Do decyzji, czy to wystarcza.
- [ ] Q4 (DAN-03 / P17 b, Windows, wtyczka testowa w trybie deweloperskim albo po kroku 1.4): usuń warstwę z treścią i wywołaj awarię jej wtyczki (np. błędny skrót wtyczki testowej). Ctrl+Z → warstwa wraca oznaczona w panelu jako „Uszkodzona”. Po kroku 1.5: zapisz lekcję, otwórz ponownie z działającą wtyczką → treść sprzed awarii jest kompletna.
- [ ] Q5 (DAN-03, Windows): przy trzech warstwach usuń dwie → kosz ostatniej jest wyszarzony. Ctrl+Z → kosz znów aktywny.
- [ ] Q6 (DAN-03, Windows): ukryj warstwę z cofniętą zmianą zawartości i naciśnij Ctrl+Y → nic się nie zmienia, pojawia się komunikat o ukrytej warstwie. Pokaż warstwę, Ctrl+Y → zmiana wraca.
- [ ] Q7 (wszystkie, Linux i Android po P12): powtórzyć Q1–Q6 na WebKitGTK i Android WebView; Q5 i Q6 także dotykiem (gest trzema palcami dla ponowienia).
- [ ] Q8 (R52 częściowo): po naprawie środowiska `pnpm exec playwright install chromium --force`, potem `pnpm test:e2e --project=chromium` → 23/23.

## 8. Zalecenia
1. **(Niski)** Numer warstwy w komunikacie P17 a jest zapamiętywany w chwili pokazania (3.1, wiersz 3). Rozważyć zapisanie w komunikacie `layerId` i wyliczanie nazwy przy wyświetlaniu (`numberOf` na bieżąco). Wtedy `addOnce` może porównywać po `layerId` zamiast po numerze. Ewentualnie można zamykać komunikaty przy zmianie struktury warstw. Do decyzji właściciela (test Q3).
2. **(Niski)** Dodać testy: (a) awaria wtyczki, gdy jej warstwa jest cofniętym dodaniem (rekord w stosie ponawiania), potem ponowienie → status `broken`, dane zachowane; (b) awaria wtyczki A nie zmienia statusu ani danych usuniętej warstwy wtyczki B w historii.
3. **(Kosmetyczny)** Rozróżnić nazwy dwóch przypadków `it.each` „…is broken after redo” (np. „createData fails” / „loading fails”).
4. **(Kosmetyczny)** STAN: wpisać hash `9e477e1` w kolumnie commita kroku 1.3-poprawka-2.
5. **(Środowisko)** Bez zmian: Playwright Chromium (ICU) i `oldnames.lib` (Build Tools 2022 → Napraw).
