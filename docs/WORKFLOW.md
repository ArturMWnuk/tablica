# Workflow projektu Tablica

Ten dokument opisuje, jak prowadzić projekt, żeby przy dużym zakresie i wielu sesjach pracy zachować **ciągłość**, **kontrolę** i **zgodność z dokumentacją**.

## 1. Zasady nadrzędne
1. **Jedno źródło prawdy.** `docs/DOKUMENTACJA.md` określa, co ma powstać. Kod, plany i testy wynikają z niej, nigdy odwrotnie.
2. **Śledzenie każdego wymagania.** Każde wymaganie ma identyfikator (np. `RYS-01`). Ten identyfikator pojawia się w planie etapu, w testach, w commitach i w raporcie weryfikacji. Dzięki temu dla każdego wymagania widać, gdzie zostało zrobione i czym sprawdzone.
3. **Nic poza dokumentacją, niczego mniej.** Funkcja, której nie ma w dokumentacji, nie powstaje. Wymagania nie wolno pominąć bez formalnie zatwierdzonego odstępstwa.
4. **Zmiany wymagań tylko przez proces zmiany** (sekcja 7). Nigdy „przy okazji” w trakcie kodowania.
5. **Weryfikacja przez niezależnego audytora.** Ta sama sesja, która pisała kod, nie ocenia końcowej zgodności. Robi to osobny agent `audytor` w świeżym kontekście.
6. **Ostatnie słowo ma właściciel.** Plany, odstępstwa, zmiany wymagań i zamknięcie etapu zatwierdzasz Ty.
7. **Stan zapisany w plikach, nie w pamięci rozmowy.** Każda sesja zaczyna się od przeczytania `docs/STAN.md` i kończy jego aktualizacją.

## 2. Role
| Rola | Kto | Odpowiedzialność |
|---|---|---|
| **Właściciel produktu** | Ty | Zatwierdza plany, decyzje i zmiany wymagań. Wykonuje testy akceptacyjne na prawdziwych urządzeniach. Zamyka etapy. |
| **Wykonawca** | Claude Code (sesja robocza) | Planuje etapy, implementuje kroki, pisze testy, aktualizuje stan i macierz. |
| **Audytor** | Agent `audytor` (świeży kontekst, tylko odczyt kodu) | Sprawdza zgodność z dokumentacją i planem, uruchamia testy, pisze raport weryfikacji. |

## 3. Artefakty projektu
| Plik | Rola | Kto zmienia |
|---|---|---|
| `CLAUDE.md` | Zasady pracy ładowane automatycznie w każdej sesji Claude Code | Właściciel / wykonawca za zgodą |
| `docs/DOKUMENTACJA.md` | Specyfikacja z identyfikatorami wymagań | Tylko przez proces zmiany (sekcja 7) |
| `docs/WORKFLOW.md` | Ten dokument | Za zgodą właściciela |
| `docs/MACIERZ.md` | Macierz śledzenia: status, testy i uwagi każdego wymagania | Wykonawca (statusy do ZAIMPL.), właściciel przy zamknięciu (ZWERYF.) |
| `docs/STAN.md` | Bieżący stan projektu i dziennik sesji, czyli „pamięć” między sesjami | Wykonawca po każdym kroku |
| `docs/DECYZJE.md` | Rejestr decyzji architektonicznych (ADR) | Wykonawca, decyzje zatwierdza właściciel |
| `docs/etapy/ETAP-N-plan.md` | Plan etapu: kryteria akceptacji i podział na kroki | Wykonawca, zatwierdza właściciel |
| `docs/raporty/ETAP-N-weryfikacja.md` | Raport audytora | Tylko audytor |
| `docs/zmiany/ZW-NNN.md` | Zgłoszenia zmian wymagań z analizą wpływu | Wykonawca, zatwierdza właściciel |
| `docs/szablony/` | Szablony planu, raportu i zmiany | Rzadko |
| `CHANGELOG.md` | Historia zmian programu dla użytkowników | Wykonawca |

## 4. Cykl życia etapu
Każdy etap (sekcja 10 dokumentacji) przechodzi przez te same fazy. Między fazami są **bramki**, czyli warunki, które muszą być spełnione, żeby przejść dalej.

```
 PLANOWANIE ──[B1]──► REALIZACJA ──[B2]──► WERYFIKACJA ──[B3]──► AKCEPTACJA ──[B4]──► ZAMKNIĘTY
 /planuj-etap N       /realizuj-krok        /weryfikuj-etap N     testy ręczne         /zamknij-etap N
                      (powtarzane            (audytor)            właściciela
                       dla każdego kroku)       │
                            ▲                   │ braki
                            └───────────────────┘
```

### Faza 1: Planowanie (`/planuj-etap N`)
Wykonawca tworzy `docs/etapy/ETAP-N-plan.md`:
- listę wszystkich ID należących do etapu,
- **mierzalne kryteria akceptacji** dla każdego ID. Odpowiadają na pytanie „po czym poznam, że to działa?”,
- podział na **kroki**. Każdy krok to jedna sesja pracy i kończy się działającym, przetestowanym programem,
- decyzje architektoniczne do zapisania jako ADR,
- listę testów ręcznych na urządzeniach,
- ryzyka i pytania do właściciela.

**Bramka B1:** plan ma status ZATWIERDZONY (zatwierdzasz Ty), pytania są rozstrzygnięte, a ADR zapisane w `DECYZJE.md`.

### Faza 2: Realizacja (`/realizuj-krok`, wielokrotnie)
Dla każdego kroku z planu:
1. Implementacja tylko tego, co obejmuje krok.
2. Testy automatyczne dla każdego kryterium akceptacji. Nazwa testu zawiera ID, np. `RYS-01: kreska grubieje przy większym nacisku`.
3. Pełny zestaw kontroli: lint, typy, testy jednostkowe i integracyjne, testy Rust, build. Muszą też przechodzić **wszystkie testy z poprzednich kroków i etapów** (regresja).
4. Samokontrola: porównanie wyniku z kryteriami akceptacji kroku.
5. Aktualizacja `MACIERZ.md` (status ZAIMPL.), `STAN.md` i `CHANGELOG.md`.
6. Commit z identyfikatorami wymagań.

**Definicja ukończenia kroku (DoD):**
- [ ] wszystkie ID kroku zaimplementowane zgodnie z kryteriami,
- [ ] każde kryterium ma test automatyczny albo pozycję na liście testów ręcznych,
- [ ] wszystkie kontrole przechodzą, bez regresji,
- [ ] brak tekstów interfejsu zapisanych na sztywno (wszystko przez pliki tłumaczeń PL/EN),
- [ ] nowe zależności mają licencję zgodną z GPL-3.0 (NF-01),
- [ ] MACIERZ, STAN i CHANGELOG zaktualizowane,
- [ ] commit wykonany.

**Zalecenie:** każdy krok rozpoczynaj w **nowej sesji** (lub po `/clear`). Ciągłość zapewniają pliki STAN i MACIERZ, a świeży kontekst zmniejsza ryzyko błędów.

**Bramka B2:** wszystkie kroki planu mają status UKOŃCZONY w `STAN.md`.

### Faza 3: Weryfikacja (`/weryfikuj-etap N`)
Audytor w świeżym kontekście:
- sam uruchamia wszystkie testy i build, nie wierzy deklaracjom z MACIERZ czy STAN,
- dla każdego ID sprawdza kryteria akceptacji i podaje **dowód** (plik i linia, nazwa testu i wynik),
- sprawdza regresję poprzednich etapów,
- sprawdza niezmienniki architektury (`CLAUDE.md`), wymagania NF i wykluczenia WYK,
- wykrywa funkcje spoza dokumentacji,
- przygotowuje listę testów ręcznych dla właściciela,
- zapisuje raport `docs/raporty/ETAP-N-weryfikacja.md`.

Wynik: **ZALICZONY**, **WARUNKOWO** (drobne braki) albo **NIEZALICZONY**. Przy brakach wykonawca dopisuje do planu kroki poprawkowe (`/realizuj-krok`), a audyt się powtarza (raport `-v2`, `-v3`…).

**Bramka B3:** raport ZALICZONY albo WARUNKOWO z odstępstwami zatwierdzonymi przez właściciela.

### Faza 4: Akceptacja (Ty)
Wykonujesz testy ręczne z raportu na prawdziwych urządzeniach (Windows, Linux, Android, rysik, tablet graficzny, dwa monitory, udostępnianie ekranu) i odznaczasz je w raporcie. Wykryte problemy wracają do fazy 2.

**Bramka B4:** wszystkie testy ręczne odznaczone jako zaliczone.

### Faza 5: Zamknięcie (`/zamknij-etap N`)
- Statusy wymagań etapu w MACIERZ zmieniają się na ZWERYF.
- Wersja programu dostaje tag w git, np. `v0.1.0` po etapie 1 (sekcja 8).
- CHANGELOG dostaje sekcję wersji.
- STAN dostaje oznaczenie etapu jako ZAMKNIĘTY i wskazanie następnego.

## 5. Statusy
**Wymagania (MACIERZ.md)**
| Status | Znaczenie |
|---|---|
| `—` | Nierozpoczęte |
| `W TOKU` | Trwa implementacja w bieżącym kroku |
| `ZAIMPL.` | Zaimplementowane i przetestowane przez wykonawcę |
| `ZWERYF.` | Potwierdzone przez audytora i właściciela (tylko przy zamknięciu etapu) |
| `ODST.` | Zatwierdzone odstępstwo, opisane w kolumnie Uwagi z odwołaniem do raportu lub ZW |
| `USUNIĘTE` | Usunięte przez zmianę wymagań (ZW-NNN) |

**Etapy (STAN.md):** NIEROZPOCZĘTY → PLANOWANIE → REALIZACJA → WERYFIKACJA → AKCEPTACJA → ZAMKNIĘTY

## 6. Ciągłość między sesjami
- **Początek każdej sesji:** wykonawca czyta `CLAUDE.md` (automatycznie), `docs/STAN.md`, plan bieżącego etapu oraz sekcje dokumentacji dla ID, nad którymi pracuje.
- **Koniec każdego kroku:** wpis w dzienniku `STAN.md` (co zrobiono, co dalej, problemy).
- **Niejasność w dokumentacji:** wykonawca zatrzymuje się i pyta. Nie zgaduje. Pytanie trafia do `STAN.md` (Otwarte pytania), a odpowiedź do planu lub, jeśli zmienia wymaganie, do procesu zmiany.
- **Komenda `/stan`** w dowolnym momencie pokazuje postęp i następny krok.

## 7. Zmiana wymagań (`/zmiana-wymagan <opis>`)
1. Wykonawca tworzy `docs/zmiany/ZW-NNN.md` z **analizą wpływu**: których ID, etapów, kodu i testów dotyczy, czy zmienia coś w zamkniętych etapach i jaki jest koszt.
2. Ty zatwierdzasz albo odrzucasz.
3. Dopiero po zatwierdzeniu wykonawca:
   - zmienia `DOKUMENTACJA.md` i podnosi jej wersję (1.1 → 1.2; zmiana zakresu etapów → 2.0),
   - dopisuje wpis w historii zmian dokumentacji,
   - nadaje nowe ID albo oznacza usunięte jako USUNIĘTE (numery nie są używane ponownie),
   - aktualizuje MACIERZ, plany etapów, a w razie potrzeby DECYZJE i STAN,
   - jeśli zmiana dotyczy zamkniętego etapu, dodaje kroki poprawkowe i ponowną weryfikację.

Drobne poprawki redakcyjne bez zmiany znaczenia też przechodzą przez ten proces, w uproszczonej formie (krótka analiza wpływu).

## 8. Git i wersjonowanie
- **Repozytorium:** git lokalnie i na GitHubie (NF-02).
- **Gałęzie:** `main` zawiera tylko zamknięte etapy. Każdy etap ma gałąź `etap-N`, scalaną do `main` przy zamknięciu.
- **Commity** w formacie Conventional Commits z identyfikatorami wymagań:
  ```
  feat(RYS-01,RYS-02): pióro z naciskiem i zakreślacz
  test(WAR-06): izolacja gumki między warstwami
  fix(DAN-02): autozapis nie startował po zmianie interwału
  chore: konfiguracja CI dla Windows i Linux
  ```
- **Wersje programu (SemVer):** `v0.1.0` po etapie 1, `v0.2.0` po etapie 2, … `v1.0.0` po etapie 5. Poprawki między etapami: `v0.1.1` itd.
- **Wersje wtyczek warstw** mają własne numery (WAR-11).
- **Wypychanie (push) i publikowanie wydań** tylko za Twoją zgodą.

## 9. Ściągawka dla właściciela
| Co chcesz zrobić | Co wpisać |
|---|---|
| Sprawdzić, gdzie jesteśmy | `/stan` |
| Rozpocząć etap | `/planuj-etap 1` → przeczytaj plan → odpowiedz na pytania → „zatwierdzam plan” |
| Zrealizować następny krok | `/realizuj-krok` (najlepiej w nowej sesji) |
| Zrealizować konkretny krok | `/realizuj-krok 3` |
| Sprawdzić etap | `/weryfikuj-etap 1` |
| Sprawdzić pojedynczy krok w trakcie | `/weryfikuj-etap 1 krok 3` |
| Zmienić lub dodać wymaganie | `/zmiana-wymagan <opis zmiany>` |
| Zamknąć etap po testach ręcznych | `/zamknij-etap 1` |

### Pierwsze kroki
1. Zainicjuj repozytorium git (i utwórz repozytorium na GitHubie).
2. `/planuj-etap 1`: plan etapu 1 rozstrzygnie m.in. wybór frameworka UI (ADR-006) i zawartość kroku 0 (szkielet projektu, CI, testy).
3. Zatwierdź plan i realizuj kroki.
