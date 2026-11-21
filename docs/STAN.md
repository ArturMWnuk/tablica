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
| Bieżący krok | 1.3-poprawka-3 (wykonany, do scalenia w `etap-1`); 1.5 następny; 1.1 W TOKU (Linux i Android czekają na P12) |
| Gałąź robocza | `etap-1`; krok 1.3-poprawka-3 na `testy-reczne-etap1` (sesja testów ręcznych) |

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
| 1.3-poprawka | Domknięcie WAR-02 i DAN-03 po weryfikacji | WAR-02 (K1), WAR-03 (P17 a), DAN-03 (P17 b: dodawanie i usuwanie warstw), WAR-01 K3 (interfejs) | UKOŃCZONY (weryfikacja: WARUNKOWO, `docs/raporty/ETAP-1-krok-1.3-poprawka-weryfikacja.md`) | f6fd8e4 |
| 1.3-poprawka-2 | Przypadki brzegowe historii warstw | DAN-03 (P17 b), WAR-03 (P17 a) | UKOŃCZONY (weryfikacja: ZALICZONY, `docs/raporty/ETAP-1-krok-1.3-poprawka-2-weryfikacja.md`) | 9e477e1 |
| 1.3-poprawka-3 | Pętla efektów w panelu warstw | WAR-01 (K3) | UKOŃCZONY (kontrole zielone, bez weryfikacji audytora; wykonany 2026-11-21 przy przygotowaniu testów ręcznych) | d644f02 |
| 1.4 | Wejście i pisanie | WEJ-01–06, RYS-01, RYS-02, NF-04 | UKOŃCZONY (weryfikacja: WARUNKOWO, `docs/raporty/ETAP-1-krok-1.4-weryfikacja.md`; WEJ-04 K1 do poprawki; WEJ-05 K3 domknięcie w 1.6, P18; WEJ-02 po R11) | c1ee23b |
| 1.4-poprawka | Spacja z przeciąganiem po weryfikacji | WEJ-04 (K1) | UKOŃCZONY (weryfikacja: WARUNKOWO, `docs/raporty/ETAP-1-krok-1.4-poprawka-weryfikacja.md`; w Edge suwak grubości i pole wyboru D4 nadal zatrzymują fokus) | 07d4ce6 |
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
1. Właściciel: decyzja w sprawie ustaleń weryfikacji kroku 1.4-poprawka (WEJ-04 K1 w Edge: po użyciu myszą suwaka grubości lub pola wyboru D4 Spacja + przeciągnięcie rysuje, a pole wyboru przełącza się Spacją): (a) krok **1.4-poprawka-2** (zwalnianie fokusu po kliknięciu myszą także z suwaków, pól wyboru i selektora koloru, e2e w Edge) albo (b) przyjęcie jako znane ograniczenie. Po zgodzie na (a) dopisać krok do planu i tabeli kroków, potem `/realizuj-krok 1.4-poprawka-2`, następnie `/realizuj-krok 1.5`. Właściciel: testy ręczne W5, W5a–W5c z raportu `docs/raporty/ETAP-1-krok-1.4-poprawka-weryfikacja.md` (Windows, WebView2).
2. Scalić krok 1.3-poprawka-3 z gałęzi `testy-reczne-etap1` do `etap-1` (przewinięcie, dopóki `etap-1` się nie ruszy).
3. Trwa sesja testów ręcznych właściciela (gałąź `testy-reczne-etap1`): 39 zaległych testów z raportów weryfikacji, w tym 23 wykonalne na Windows od razu, 13 po P12. Wyniki odznaczane w raportach w `docs/raporty/`.
4. Właściciel: naprawić środowisko laptopa: Visual Studio Installer → Build Tools 2022 → Napraw (w `lib\x64` brak `oldnames.lib`; obejściem jest pusta biblioteka x64 z `lib.exe /DEF` podana w zmiennej `LIB`). Playwright Chromium naprawiony 2026-11-21 (`playwright install chromium --force`). Polecenia projektu uruchamiać Node 26 z `C:\Users\artur\AppData\Local\Programs\nodejs-portable\node-v26.13.0-win-x64` (Node w PATH to 20.12.2, za stary: pnpm pomija wtedy natywne bindingi).
5. Właściciel: podać brakujące dane sprzętu (P12), potem dokończyć krok 1.1 (Linux, Android, tablet graficzny).
6. Po P12: `/realizuj-krok 1.1` (Linux, Android, tablet graficzny); kroki 1.9 i 1.10 dopiero po domknięciu 1.1.

## Otwarte pytania
- P12 (sprzęt testowy), część otwarta: dystrybucja Linuksa i sesja (X11/Wayland), tablet z Androidem i wersja systemu, model tabletu graficznego, urządzenie z ekranem dotykowym do R12 (laptop referencyjny go nie ma). Laptop referencyjny zapisany w planie (P12). **Potrzebne do dokończenia kroku 1.1** (część Windows wykonana 2026-11-10 za zgodą właściciela).
- P19 (z weryfikacji kroku 1.4, RYS-02 K2): zakreślacz mnoży kolory tylko w obrębie warstwy rysunkowej (kontener warstwy tworzy własny kontekst stosu). Czy nad obrazem lub PDF z innej warstwy (krok 1.9, MM-08) ma też mnożyć, czy wystarczy półprzezroczysta nakładka 40 %? **Do rozstrzygnięcia przed krokiem 1.9.**

## Blokery
Brak.

## Dziennik sesji
### 2026-11-21: Krok 1.3-poprawka-3 — pętla efektów w panelu warstw (sesja testów ręcznych)
- Przygotowanie środowiska do testów ręcznych właściciela: zależności zainstalowane Node 26 (przenośny, `nodejs-portable\node-v26.13.0-win-x64`) — Node 20.12.2 w PATH jest za stary, pnpm pomijał wtedy natywny binding `@rolldown/binding-win32-x64-msvc` i Vitest nie startował. Playwright Chromium naprawiony (`playwright install chromium --force`), więc pełne e2e działa po raz pierwszy w obu silnikach. Linkowanie Rust: w `lib\x64` Build Tools nadal brak `oldnames.lib`, obejście to pusta biblioteka x64 wygenerowana `lib.exe /DEF` i podana w `LIB` (trwale: naprawa Build Tools).
- Usterka wykryta po uruchomieniu aplikacji (`pnpm tauri dev`, WebView2; potwierdzona też w przeglądarce na Chromium): przy każdym wczytaniu wtyczek panel warstw zgłaszał `effect_update_depth_exceeded` i na moment blokował interfejs. Przyczyna: `snapshot()` w `LayersPanel.svelte` zapisywał stan `types` i zaraz go czytał (`types.includes(newType)`), więc efekt wywołujący `snapshot()` zależał od własnych zapisów i planował kolejne przebiegi aż do limitu Svelte. Po przerwaniu pętli program działał dalej, dlatego kontrole tego nie wychwytywały.
- WAR-01 K3: lista typów liczona do zmiennej lokalnej, odczyt `newType` przez `untrack`. Test e2e „WAR-01: the panel lists the layer types without an effect loop” (błędy strony i konsoli przy starcie, lista typów w panelu); sprawdzone, że bez poprawki pada w Chromium i WebKit.
- Kontrole: lint, prettier, typy (346 plików, 0 błędów), Vitest 206/206, licencje npm 232, build web, Playwright **66/66** (33 Chromium + 33 WebKit), cargo fmt, clippy, cargo test 2/2.
- Ustalenie dla testów ręcznych M8, P11 i Q8: pełny zestaw e2e przechodzi teraz w Chromium (silnik najbliższy WebView2), liczby w raportach (19/21/23) są historyczne.

### 2026-11-21: Weryfikacja kroku 1.4-poprawka
- Audytor: wynik **WARUNKOWO** (`docs/raporty/ETAP-1-krok-1.4-poprawka-weryfikacja.md`). Poprawka spełnia kryterium kroku: przycisk kliknięty myszą oddaje fokus, przycisk uruchomiony z klawiatury go zachowuje; brak regresji. Kontrole zielone (lint, typy, Vitest 206/206, Edge 32/32 zamiast Chromium, WebKit 32/32, licencje 232, build, cargo fmt, clippy, cargo test 2/2).
- Ustalenie: w Edge (silnik WebView2) ta sama ścieżka błędu WEJ-04 K1 zostaje po użyciu myszą suwaka grubości i pola wyboru „palec nie rysuje po użyciu rysika” (Spacja + przeciągnięcie rysuje; pole wyboru dodatkowo przełącza się Spacją). W WebKit poprawnie. MACIERZ: WEJ-04 z ZAIMPL. na W TOKU do decyzji właściciela (krok 1.4-poprawka-2 albo znane ograniczenie).
- Ryzyko na później: globalne zwalnianie fokusu przycisków może wyprowadzić fokus z okien dialogowych z pułapką fokusu (kroki 1.5, 1.12), uwzględnić w ich planach. Nadal otwarte z raportu 1.4: e2e kółka, Ctrl + kółka i środkowego przycisku w komponencie tablicy.
- Poprawiono hash commitu kroku 1.4-poprawka w tabeli kroków (`07d4ce6`).
### 2026-11-21: Krok 1.4-poprawka — Spacja z przeciąganiem
- WEJ-04 K1: przycisk kliknięty myszą, rysikiem lub palcem (zdarzenie `click` z `detail` > 0) oddaje fokus stronie (`releasePointerFocus` w `app/src/lib/ui/focus.ts`, podpięte w `Board.svelte` na poziomie okna, więc dotyczy wszystkich przycisków, także paska narzędzi i cofania). Spacja trafia wtedy do tablicy i z przeciąganiem przesuwa widok. Przycisk uruchomiony z klawiatury (`detail` 0) zachowuje fokus i swoją Spację; pola tekstowe i pozostałe kontrolki bez zmian. Kliknięcie, które samo przeniosło fokus (np. do pola tekstowego), nie jest ruszane. Funkcje `isTextField` i `isControl` przeniesione z `Board.svelte` do tego samego modułu bez zmian.
- Testy: jednostkowy `WEJ-04: a toolbar button clicked with the mouse does not keep Space (focus on the button)`; e2e `WEJ-04: after clicking … on the toolbar, Space + drag moves the view and does not draw` dla pióra i zakreślacza (kreska, Spacja + przeciągnięcie przesuwa kreskę o 200 px bez nowej, jedno cofnięcie usuwa jedyną kreskę). Sprawdzone, że bez poprawki oba testy e2e padają w Edge.
- Kontrole: lint, typy (346 plików, 0 błędów), Vitest 206/206, licencje npm 232, build, e2e 32/32 w WebKit i 32/32 w systemowym Edge (tymczasowy config usunięty; Chromium Playwright nadal nie startuje, `icudtl.dat`), Rust fmt, clippy, test 2/2 (z obejściem `oldnames.lib`).
- Pozostałe zalecenia raportu kroku 1.4 (e2e kółka i środkowego przycisku w komponencie, punkty 3–6) poza zakresem kroku.

### 2026-11-21: Zgoda na krok 1.4-poprawka
- Właściciel zgodził się na krok poprawkowy 1.4-poprawka (WEJ-04 K1: Spacja + przeciągnięcie po kliknięciu narzędzia na pasku). Dopisany do planu etapu (sekcja 4) i tabeli kroków.

### 2026-11-20: Weryfikacja kroku 1.4
- Audytor: wynik **WARUNKOWO** (`docs/raporty/ETAP-1-krok-1.4-weryfikacja.md`). OK: WEJ-01, WEJ-03, WEJ-06, RYS-01, RYS-02, NF-04; CZĘŚCIOWO: WEJ-04 (K1); ODSTĘPSTWO według P18: WEJ-02, WEJ-05. Kontrole zielone (lint, typy, Vitest 205/205, WebKit 30/30, Edge 30/30 zamiast Chromium, licencje 232, build, rustfmt, clippy, cargo test 2/2).
- WEJ-04 K1: po kliknięciu przycisku narzędzia fokus zostaje na pasku (`preventDefault()` w `onPointerDown` tablicy), więc w Chromium/Edge (silnik WebView2 i Android WebView) Spacja + przeciągnięcie rysuje zamiast przesuwać widok. MACIERZ: WEJ-04 z ZAIMPL. na W TOKU. Proponowany krok 1.4-poprawka czeka na zgodę właściciela.
- Zmienione testy (granice WAR-12, WAR-06 `{ strokes: [] }`, licencje `--recursive`) ocenione jako nieosłabione.
- Uwagi niskiego priorytetu: drugi przycisk boczny rysika (`buttons & 4`) rysuje piórem, D4 do rozstrzygnięcia w 1.6; podgląd kreski zostaje po zablokowaniu lub ukryciu warstwy w trakcie rysowania; wersja wtyczki rysunkowej 0.1.0 w `package.json` i 0.2.0 w manifeście; nieaktualny komentarz w teście NF-04; brak testu `altitudeAngle` = 0; wzorzec `pen-stroke.png` pilnuje tylko regresji. Nowe pytanie P19 (zakreślacz nad innymi warstwami).
- Testy ręczne W1–W8 w raporcie (sekcja 7).

### 2026-11-20: Decyzja P18
- Właściciel przyjął rekomendacje: (a) WEJ-05 K3 (gumka rysika) i przycisk gumki z D4 domykane w kroku 1.6 (`InputRouter.eraserTool` wskaże gumkę warstwy rysunkowej, test z nią), do tego czasu WEJ-05 W TOKU; WEJ-02 zostaje W TOKU do R11; (b) po użyciu rysika pojedynczy palec przesuwa widok; (c) poszerzenie D2 liniowe od 1× przy 45° do 1,5× przy 90°. Zapisano w planie (tabela pytań, krok 1.6) i w MACIERZ.

### 2026-11-20: Krok 1.4 — wejście i pisanie
- `InputRouter` (rdzeń, `board.input`): rysik, palec i mysz trafiają do aktywnego narzędzia albo do widoku. Mysz: lewy przycisk = narzędzie, kółko przewija, Ctrl + kółko powiększa w punkcie kursora, środkowy przycisk i Spacja + przeciągnięcie przesuwają (WEJ-04). Dotyk: jeden palec rysuje, dopóki nie użyto rysika; drugi palec porzuca kreskę i zaczyna przesuwanie z pinch (WEJ-03, D4); stuknięcia D3 przeniesione z komponentu do potoku. Dłoń: dotyk ignorowany przy kontakcie rysika, w zasięgu (hover) i 500 ms po nim; dotyk obecny przy lądowaniu rysika jest przerywany (WEJ-06). Przełącznik D4 w pasku ustawień, zapamiętywany na urządzeniu. Powiększenie gestami w zakresie D5 (10–1000 %).
- Nacisk (tylko rysik; mysz i palec 0,5), nachylenie z `altitudeAngle` albo `tiltX`/`tiltY`, końcówka gumki (`buttons & 32`) przełącza na narzędzie `eraserTool` na czas kontaktu, pierwszy przycisk rysika nie rysuje (menu kontekstowe w 1.12) (WEJ-05, D4). Zdarzenia scalone jako osobne `move`, przewidywane w `predicted`, ścieżka zapasowa bez nich (NF-04 K2).
- Warstwa rysunkowa (format danych 2, migracja z 1): pióro z naciskiem i nachyleniem (D2), zakreślacz (40 %, stała grubość, `multiply`, jedno wypełnienie obrysu, więc bez ciemnienia nakładek), obrys perfect-freehand 1.2.2 (MIT, ADR-007). Bieżąca kreska rysowana przyrostowo (tylko najnowszy odcinek) na płótnie `desynchronized`, przewidywany ogon na osobnym płótnie czyszczonym co ruch; kreska = jeden krok cofania przy podniesieniu. Panel „Pióro i zakreślacz”: 13 kolorów, próbnik, kod hex, 6/5 grubości gotowych, suwak 1–50 px (RYS-01, RYS-02).
- Interfejs: pasek narzędzi (narzędzia z wtyczek), panele wtyczek pod panelem warstw; domyślne narzędzie przy starcie: pióro (`composition/builtin.ts`).
- T10 / NF-04 K1: `LatencyMeter` (od `event.timeStamp` do końca obsługi przez narzędzie), odczyt `tablicaDiagnostics.latency.summary()`. e2e: 400 zdarzeń pióra, p95 ≤ 4 ms (WebKit w izolacji p95 1 ms; pod pełnym obciążeniem równoległym przed zmianą na rysowanie przyrostowe było 6 ms, po zmianie zielone).
- API wtyczek 1.1.0 (zgodne wstecz): `ToolPointerEvent.tilt`, `ToolPointerEvent.predicted`, typ `ToolPointerSample`; opis fazy `cancel` i pomiaru opóźnienia; `docs/api/README.md` (historia wersji), przewodnik i referencja zaktualizowane. Manifest warstwy rysunkowej: `apiVersion` 1.1.0, wersja 0.2.0.
- Zmiany testów i infrastruktury (bez osłabiania): test granic WAR-12 dopuszcza w warstwie zewnętrzne biblioteki (perfect-freehand wg ADR-007), ale nadal tylko `@tablica/plugin-api` z pakietów programu i bez protokołów `workspace:`/`link:`/`file:`; dwa testy WAR-06 porównują pustą warstwę rysunkową z nowym formatem `{ strokes: [] }`; test WAR-12 o niezgodnej wersji używa `API_VERSION` zamiast stałej 1.0.0; test WAR-01 w `shell.spec.ts` liczy płótna warstwy rysunkowej po klasach. Kontrola licencji npm obejmuje teraz zależności pakietów obszaru roboczego (`--recursive`): wcześniej zależności wtyczek nie były sprawdzane.
- Ustalenie: WebKit podaje `tiltX` 90 dla pióra bez danych o nachyleniu (wykryte, bo wzorzec kreski z WebKit był 1,5× szerszy niż w Edge). Program traktuje dokładnie ±90° jako brak danych; do sprawdzenia na tablecie graficznym z Linuksem (R11).
- Testy: 49 nowych w Vitest (`input.test.ts` 25, `drawing.test.ts` 11, `stroke.test.ts` 13), 1 nowy w `api.test.ts`, 7 nowych e2e (`drawing.spec.ts`), wzorzec `e2e/reference/pen-stroke.png` (generowany z `UPDATE_REFERENCE=1`).
- Kontrole: lint, typy, Vitest 205/205, licencje (232 pakiety), build web, Playwright WebKit 30/30; Chromium Playwright nieuruchamialny (znany brak `icudtl.dat`), zamiast niego jednorazowo systemowy Edge (silnik WebView2, konfiguracja tymczasowa usunięta) 30/30; rustfmt, clippy, cargo test 2/2 (obejście `oldnames.lib`).
- Odstępstwa i interpretacje: P18 (WEJ-05 K3 i przycisk gumki czekają na gumkę z 1.6; pojedynczy palec po rysiku przesuwa widok; D2 liniowo). Pierwszy przycisk rysika nie otwiera jeszcze menu (UI-06, krok 1.12).

### 2026-11-20: Weryfikacja kroku 1.3-poprawka-2
- Audytor: wynik **ZALICZONY** (`docs/raporty/ETAP-1-krok-1.3-poprawka-2-weryfikacja.md`). DAN-03 (P17 b) i WAR-03 (P17 a) OK; zalecenia 1–4 z raportu kroku 1.3-poprawka zamknięte. Kontrole zielone (Vitest 155/155, WebKit 23/23).
- Uwagi niskiego priorytetu (bez kroku poprawkowego): numer warstwy w komunikacie jest ustalany w chwili jego pokazania (do decyzji właściciela po teście ręcznym Q3); brak testów awarii wtyczki przy cofniętym dodaniu i braku wpływu na rekordy innej wtyczki; dwie jednakowe nazwy przypadków `it.each`.
- Testy ręczne Q1–Q8 w raporcie (Q1 zastępuje P5 z raportu kroku 1.3-poprawka).

### 2026-11-19: Krok 1.3-poprawka-2 — przypadki brzegowe historii warstw
- Awaria wtyczki (`Board.breakPlugin`) obejmuje też warstwy poza dokumentem, które historia może przywrócić (rekordy z `LayerStructureEntry`, nowy getter `History.entries`): dostają najnowsze dane w `stored` i stan „uszkodzona”, więc po cofnięciu usunięcia zapis zawiera dane sprzed awarii (P17 b, WAR-06 K3).
- `breakLayer` ustawia stan przez `setRecordStatus`, więc warstwa dodana i cofnięta przed wczytaniem wtyczki dostaje właściwy stan także przy błędzie `createData` / `deserialize`; po ponowieniu nie zostaje „Wczytywanie”.
- Komunikaty `notice.historyLocked` i `notice.historyHidden` podają nazwę warstwy z numerem jak panel: numer liczy `BoardDocument.numberOf` (używa go też panel), a nazwę składa wspólna funkcja `layerTitle`; `addOnce` rozróżnia warstwy po numerze.
- Testy: 9 nowych w `history-layers.test.ts` (sprawdzone, że 4 z nich nie przechodzą bez poprawki), 2 nowe e2e (wyłączone usuwanie ostatniej warstwy, nazwa z numerem w komunikacie).
- Kontrole: lint, typy, Vitest 155/155, licencje (225 pakietów), build web, Playwright WebKit 23/23; Chromium nieuruchamialny (znany brak danych ICU); rustfmt, clippy, cargo test 2/2 (obejście `oldnames.lib`).

### 2026-11-19: Zatwierdzenie D18
- Właściciel zatwierdził D18: stuknięcie wieloma palcami = wszystkie palce podniesione do 350 ms od pierwszego dotknięcia, ruch żadnego palca ≤ 12 px. Zapisano w tabeli D planu. Sprawdzenie na urządzeniu dotykowym nadal w testach ręcznych (M1, po P12).

### 2026-11-19: Weryfikacja kroku 1.3-poprawka
- Audytor: wynik **WARUNKOWO** (`docs/raporty/ETAP-1-krok-1.3-poprawka-weryfikacja.md`). WAR-02 K1 i WAR-01 K3 OK; WAR-03 (P17 a) i DAN-03 (P17 b) CZĘŚCIOWO; kryteria kroku 1.3 bez regresji. Kontrole zielone (Vitest 146/146, WebKit 21/21).
- Braki: awaria wtyczki przy usuniętej (cofalnej) warstwie gubi dane z sesji; warstwa dodana i cofnięta przed nieudanym wczytaniem wtyczki zostaje „Wczytywanie”; komunikat P17 a bez numeru warstwy; luki w testach (ponowienie na ukrytej warstwie, ponowienie dodania/usunięcia z porównaniem serializacji, e2e ostatniej warstwy).
- Właściciel zgodził się na krok **1.3-poprawka-2** (dopisany do planu i tabeli kroków). DAN-03 i WAR-03 wracają do W TOKU do czasu poprawki. D18 nadal czeka na zatwierdzenie.

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
