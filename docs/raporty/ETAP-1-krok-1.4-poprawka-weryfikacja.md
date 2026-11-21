# Raport weryfikacji: etap 1, krok 1.4-poprawka (wersja raportu v1)

| Pole | Wartość |
|---|---|
| Data | 2026-11-21 |
| Wersja dokumentacji | 1.1 |
| Plan | `docs/etapy/ETAP-1-plan.md` (krok 1.4-poprawka, dodany w 89df0bd) |
| Commit | 07d4ce6a811216d53447214215b9719fb9167fb8 |
| **Wynik** | **WARUNKOWO** |

## 1. Podsumowanie
Poprawka spełnia kryterium kroku. Po kliknięciu przycisku paska narzędzi myszą fokus wraca na stronę, a Spacja z przeciąganiem przesuwa widok i nie rysuje. Potwierdzają to nowe testy e2e w systemowym Edge (silnik Chromium) i w WebKit oraz test jednostkowy. Przycisk uruchomiony z klawiatury zachowuje fokus. Pola tekstowe dalej przyjmują Spację. Wszystkie kontrole są zielone, regresji nie ma. Wynik dla zakresu kroku: WEJ-04 K1 (przycisk paska) OK, CZĘŚCIOWO 0, BRAK 0, ODSTĘPSTWO 0.

Wynik WARUNKOWO wynika z nowego ustalenia spoza dosłownego zakresu kroku. Dotyczy to samo kryterium WEJ-04 K1, ale innych kontrolek niż przycisk. W Edge (Chromium) zostają dwie ścieżki, w których Spacja z przeciąganiem rysuje kreskę:
- po przesunięciu suwaka grubości w panelu,
- po kliknięciu pola wyboru „palec nie rysuje po użyciu rysika”. Tu dodatkowo Spacja przełącza z powrotem ustawienie D4, a użytkownik tego nie widzi.

Właściciel decyduje, czy naprawić to w kolejnym kroku poprawkowym, czy przyjąć (punkt 8).

## 2. Kontrole automatyczne (uruchomione przez audytora)
Środowisko: Node 26.13.0 (przenośny), pnpm 12.16.1, `pnpm install --frozen-lockfile` w czystym worktree.

| Kontrola | Polecenie | Wynik |
|---|---|---|
| Lint | `pnpm lint` (eslint + prettier --check) | OK, kod wyjścia 0 |
| Typy | `pnpm typecheck` (tsc ×2 + svelte-check --fail-on-warnings) | OK: 346 plików, 0 błędów, 0 ostrzeżeń |
| Testy jednostkowe/integracyjne | `pnpm test` (Vitest) | **206/206**, 14 plików |
| Testy WEJ-04 (filtr) | `pnpm exec vitest run app/src/composition/input.test.ts -t "WEJ-04"` | 6/6 (w tym nowy test fokusu) |
| Licencje npm | `pnpm check:licenses` | OK: 232 pakiety zgodne z GPL-3.0 |
| Build | `pnpm build:web` | OK (vite, 2,97 s) |
| e2e systemowy Edge (Chromium) | tymczasowy config `channel: 'msedge'`, port 4199, usunięty po przebiegu | **32/32** |
| e2e WebKit | ten sam tymczasowy config | **32/32** (razem 64/64) |
| e2e Chromium Playwright | `pnpm test:e2e` | nieuruchomione: znany problem środowiska (brak `icudtl.dat`, STAN „Następne działania” p. 2). Zastąpione przebiegiem w systemowym Edge (ten sam silnik) |
| Rust fmt | `cargo fmt --check` | OK |
| Rust clippy | `cargo clippy --all-targets -- -D warnings` (z obejściem `oldnames.lib` w `LIB`) | OK |
| Testy Rust | `cargo test` | **2/2** |

Sondy audytora: tymczasowy plik `e2e/zz-audit-probe.spec.ts`, 5 przypadków × 2 silniki = 10/10 przebiegów. Plik i config usunąłem, `git status` był potem czysty. Wyniki sond są w sekcjach 3 i 4.

## 3. Zgodność z wymaganiami
| ID | Kryterium | Dowód (plik:linia, test) | Wynik | Uwagi |
|---|---|---|---|---|
| WEJ-04 | K1 poprawki: Spacja przytrzymana z przeciąganiem przesuwa widok także wtedy, gdy fokus został na przycisku paska narzędzi po jego kliknięciu | `app/src/lib/ui/focus.ts:29-35` (`releasePointerFocus`: przy `click` z `detail` > 0 zdejmuje fokus z klikniętego `button`). Podpięte w oknie w `app/src/components/Board.svelte:80-85` (`onclick={releasePointerFocus}` na `svelte:window`). `onKeyDown` (`Board.svelte:60-68`) przekazuje Spację tablicy, gdy fokus nie jest na kontrolce. e2e `e2e/drawing.spec.ts:184-213`: `WEJ-04: after clicking layer-drawing/pen on the toolbar, Space + drag moves the view and does not draw` oraz to samo dla `layer-drawing/highlighter`. Oba zaliczone w Edge i WebKit | **OK** | Test sprawdza całe kryterium z planu: kliknięcie narzędzia, kreska, fokus poza `BUTTON`, Spacja z przeciąganiem bez nowej kreski (piksel 200,300 pusty), kreska przesunięta o 200 px (piksel 200,120 pusty, 400,120 zamalowany), jedno cofnięcie usuwa jedyną kreskę i przycisk cofania staje się nieaktywny |
| WEJ-04 | Test jednostkowy przypadku fokusu na przycisku (plan, „Testy”) | `app/src/composition/input.test.ts:276-304`, `WEJ-04: a toolbar button clicked with the mouse does not keep Space (focus on the button)`, zaliczony | **OK** | Sprawdza trzy przypadki: kliknięcie myszą (`detail` 1) oddaje fokus `body`, aktywacja z klawiatury (`detail` 0) zostawia fokus na przycisku, kliknięcie, które samo przeniosło fokus do pola tekstowego, nie jest ruszane. Test używa samej funkcji, nie komponentu. Podłączenie w komponencie sprawdzają testy e2e |
| WEJ-04 | Bez zmiany zachowania Spacji w polach tekstowych i kontrolkach, które jej potrzebują (plan, zakres) | `focus.ts:5-20` (`isTextField`, `isControl` przeniesione z `Board.svelte` bez zmian, porównałem diff). Sonda: pole hex panelu, wpisanie „ab” i Spacja daje wartość `"ab "`, fokus zostaje w polu (Edge i WebKit). Sonda: przycisk „Zakreślacz” z fokusem i Spacja z klawiatury aktywuje narzędzie i fokus zostaje na przycisku; Shift+Tab, potem Enter na „Pióro” aktywuje pióro i fokus zostaje (Edge i WebKit) | **OK** | Dostępność klawiatury bez regresji |
| WEJ-04 | K1 etapu (pełne: „Spacja + przeciągnięcie przesuwa widok”) poza przyciskami, w Chromium | Sonda w Edge: suwak grubości (`drawing-width`) kliknięty myszą zachowuje fokus (`INPUT`), potem Spacja z przeciąganiem **rysuje** (piksel 200,300 = 255). Pole wyboru `pen-disables-finger` kliknięte myszą zachowuje fokus, potem Spacja z przeciąganiem **rysuje**, a Spacja **przełącza pole z powrotem** (zaznaczone przed i po: true/true). W WebKit oba przypadki działają poprawnie (fokus `BODY`, brak kreski) | **uwaga** (poza dosłownym zakresem kroku) | Poprawka obejmuje tylko `button`. Plan kroku wymienia przycisk paska, a pole wyboru potrzebuje Spacji przy obsłudze z klawiatury, więc nie oceniam tego jako BRAK kroku. To jednak ta sama klasa błędu WEJ-04 K1 w docelowym silniku (WebView2, Android WebView). Suwak jest częstą ścieżką: nauczyciel zmienia grubość suwakiem i chce przesunąć widok Spacją. Wymaga decyzji właściciela (punkt 8). Selektor kolorów (`input type=color`) prawdopodobnie zachowuje się tak samo; tego nie sprawdzałem |

Ocena kroku: 1 ID (WEJ-04, kryterium K1 poprawki): OK 1, CZĘŚCIOWO 0, BRAK 0, ODSTĘPSTWO 0. Dodatkowo jedno ustalenie do decyzji właściciela (ostatni wiersz tabeli).

Definicja ukończenia (`docs/WORKFLOW.md`, sekcja 4):
- MACIERZ: WEJ-04 zmienione z W TOKU na ZAIMPL. Opis i testy się zgadzają, ręczny W5 jest dopisany. Podsumowanie (13 ZAIMPL.) zgadza się z liczbą wierszy o tym statusie (13). Status ZAIMPL. jest uzasadniony dla zakresu kroku. Przy ustaleniu dotyczącym suwaka i pola wyboru jest optymistyczny (punkt 8). Statusu ZWERYF. nie ustawiono. OK.
- STAN: tabela kroków, następne działania i dziennik są zaktualizowane. Drobiazg: w kolumnie commitu jest „(ten commit)” zamiast hasha `07d4ce6`, a dla poprzednich kroków podano hashe.
- CHANGELOG: wpis z ID (WEJ-04), linia 33. OK.
- Commity: `docs(WEJ-04): plan kroku …` i `fix(WEJ-04): …` są w formacie Conventional Commits z ID. OK.
- Nazwy testów zaczynają się od `WEJ-04:`. OK.
- Twierdzenie ze STAN, że bez poprawki oba e2e padają w Edge: nie sprawdzałem przez cofnięcie kodu, bo nie modyfikuję kodu. Jest spójne z sondą z raportu kroku 1.4 (fokus zostawał na `BUTTON`). Nowy test sprawdza jawnie `activeElement !== BUTTON`, więc przed poprawką by nie przeszedł.

## 4. Regresja poprzednich etapów
| Etap | Testy | Wynik |
|---|---|---|
| Etap 1, kroki 1.1–1.4 i poprawki (Vitest) | `pnpm test` | 206/206 (poprzednio 205; +1 nowy test) |
| Etap 1, e2e (Edge, WebKit) | pełny zestaw `e2e/` | 32/32 + 32/32 (poprzednio 30 + 30; +2 nowe testy na silnik) |
| Rust | `cargo test` | 2/2 |
| Dostępność klawiatury (sonda) | przycisk paska aktywowany Spacją i Enterem | fokus zostaje na przycisku w Edge i WebKit, narzędzie aktywne |
| Inne przyciski (sonda) | „Cofnij” i próbka koloru w panelu wtyczki kliknięte myszą | fokus `BODY`, potem Spacja z przeciąganiem nie rysuje (Edge i WebKit) |

Regresji nie wykryto.

## 5. Niezmienniki architektury i wymagania przekrojowe
| Reguła | Wynik | Dowód / uwagi |
|---|---|---|
| Rdzeń nie zna konkretnych warstw (WAR-12) | OK | `focus.ts` leży w `app/src/lib/ui`, nie importuje niczego i nie odwołuje się do wtyczek. Obsługa w oknie działa ogólnie, dla każdego `button`, także w panelach wtyczek, bez znajomości konkretnej warstwy. Lint z `eslint-plugin-boundaries` zielony |
| Izolacja warstw (WAR-06) | OK | Poprawka nie dotyka danych warstw |
| Brak tekstów UI na sztywno (UI-01) | OK | Poprawka nie dodaje tekstów interfejsu |
| Wspólny mechanizm cofania (DAN-03) | OK | Bez zmian. e2e potwierdza, że przesuwanie widoku nie tworzy kroku cofania (jedno cofnięcie i przycisk nieaktywny) |
| Leniwe ładowanie (NF-03) | OK | Bez nowych bibliotek, moduł ma 35 linii |
| Licencje zależności (NF-01) | OK | Commit nie zmienia `package.json`, `pnpm-lock.yaml` ani `Cargo.toml`. Kontrola 232 pakietów zielona |
| Offline (NF-05) | OK | Brak komunikacji sieciowej |
| Wykluczenia WYK-01–05 nienaruszone | OK | Poprawka dotyczy wyłącznie fokusu |

Ryzyko na przyszłość: `releasePointerFocus` działa globalnie, na wszystkie przyciski w oknie. Gdy w kolejnych krokach pojawią się okna dialogowe z pułapką fokusu (np. menu Plik w 1.5, menu kontekstowe w 1.12), zdjęcie fokusu z przycisku w dialogu może przenieść fokus na `body`, poza dialog. Warto to uwzględnić w planach tych kroków.

## 6. Elementy spoza dokumentacji
Brak. Przeniesienie `isTextField` i `isControl` do `focus.ts` to refaktoryzacja służąca WEJ-04 i jest dopuszczalna.

## 7. Testy ręczne dla właściciela
- [x] **ZALICZONY 2026-11-21** (właściciel, Windows 11, aplikacja Tauri / WebView2). W5 (WEJ-04 K1; Windows, aplikacja Tauri / WebView2, mysz): kliknij przycisk „Zakreślacz” na pasku, narysuj kreskę, przytrzymaj Spację i przeciągnij lewym przyciskiem → widok przesuwa się razem z kreską, nowa kreska nie powstaje. Jedno Ctrl+Z (albo „Cofnij”) usuwa jedyną kreskę. To samo z „Pióro”. Dodatkowo: kółko przewija, Ctrl + kółko powiększa w miejscu kursora, środkowy przycisk przesuwa widok.
- [x] **ZALICZONY 2026-11-21** (właściciel, WebView2). W5a (WEJ-04 K1; Windows, WebView2, klawiatura): naciskaj Tab do przycisku „Pióro” i naciśnij Spację, potem Enter na „Zakreślacz” → narzędzie się przełącza, obramowanie fokusu zostaje na przycisku (fokus nie znika).
- [x] **ZALICZONY 2026-11-21 po kroku 1.4-poprawka-2** (właściciel, WebView2); przed poprawką niezaliczony: zachowanie zgodne z sondą audytora, czyli program rysował kreskę zamiast przesuwać widok. W5b (WEJ-04 K1; Windows, WebView2, mysz; ustalenie audytora): przesuń suwak grubości w panelu, potem przytrzymaj Spację i przeciągnij po tablicy → oczekiwane według wymagania: widok się przesuwa. Według sondy w Edge program **rysuje kreskę**. Test potwierdzi to na właściwej platformie.
- [x] **ZALICZONY 2026-11-21 po kroku 1.4-poprawka-2** (właściciel, WebView2); przed poprawką niezaliczony: zachowanie zgodne z sondą audytora, czyli program rysował kreskę, a Spacja przełączała pole wyboru z powrotem. W5c (WEJ-04 K1; Windows, WebView2, mysz; ustalenie audytora): kliknij pole wyboru „palec nie rysuje po użyciu rysika”, potem przytrzymaj Spację i przeciągnij po tablicy → oczekiwane: widok się przesuwa, a pole wyboru nie zmienia stanu. Według sondy w Edge program **rysuje kreskę, a Spacja przełącza pole z powrotem**.
- [ ] W5d (WEJ-04 K1; Android, WebView, rysik lub palec i klawiatura Bluetooth, po P12): stuknij przycisk narzędzia, narysuj kreskę, przytrzymaj Spację i przeciągnij myszą lub rysikiem → widok się przesuwa, bez nowej kreski (`click` z dotyku ma `detail` 1, czego nie da się sprawdzić automatycznie na urządzeniu).
- [ ] W5e (WEJ-04 K1; Linux, WebKitGTK, mysz, po P12): powtórz W5 → widok się przesuwa (w WebKit działało już przed poprawką; sprawdzenie, że poprawka nie zepsuła zachowania).

## 8. Zalecenia
1. **Decyzja właściciela (priorytet średni), WEJ-04 K1:** w Chromium (WebView2, Android WebView) Spacja z przeciąganiem nadal rysuje po użyciu myszą suwaka grubości i pola wyboru, a przy polu wyboru Spacja dodatkowo przełącza ustawienie D4. Możliwości: (a) kolejny krok poprawkowy, np. zdjęcie fokusu po kliknięciu myszą także z `input type=range/checkbox/color` albo traktowanie Spacji jako przesuwania, gdy kursor jest nad tablicą lub trwa przeciąganie po tablicy; do tego e2e w Edge dla suwaka i pola wyboru; (b) przyjęcie jako znanego ograniczenia z wpisem w MACIERZ. Do czasu decyzji status ZAIMPL. dla WEJ-04 jest optymistyczny.
2. W STAN wpisać hash `07d4ce6` zamiast „(ten commit)” w tabeli kroków (drobne).
3. Właściciel: naprawić Chromium Playwright (`pnpm exec playwright install chromium --force`), żeby `pnpm test:e2e` działało bez tymczasowego configu.
4. Planując okna dialogowe i menu (1.5, 1.12), uwzględnić globalne `releasePointerFocus` (pułapka fokusu w dialogu).
5. Nadal otwarte z raportu kroku 1.4 (poza zakresem tego kroku): e2e kółka, Ctrl + kółka i środkowego przycisku w komponencie tablicy.
