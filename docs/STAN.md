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
| Bieżący krok | 1.0 (nierozpoczęty) |
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
| 1.0 | Szkielet projektu i CI | PLAT-01–03 (K1), NF-01 (K1, K2 częściowo), UI-01, UI-02 (infrastruktura) | OCZEKUJE | |
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
1. Właściciel: utworzyć repozytorium `ArturWnuk/tablica` na GitHubie i połączyć je z lokalnym (CI z kroku 1.0 działa dopiero po pierwszym wypchnięciu).
2. W **nowym wątku**: `/realizuj-krok 1.0`.

## Otwarte pytania
- P12 (sprzęt testowy): model laptopa referencyjnego, dystrybucja Linuksa i sesja (X11/Wayland), tablet z Androidem i wersja systemu, model tabletu graficznego. **Potrzebne przed krokiem 1.1.**

## Blokery
Brak.

## Dziennik sesji
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
