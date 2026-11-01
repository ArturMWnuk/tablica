---
description: Zrealizuj następny (lub wskazany) krok zatwierdzonego planu etapu
argument-hint: [numer kroku, np. 1.3]
---
Zrealizuj krok planu projektu Tablica. Krok: **$ARGUMENTS** (jeśli pusty, wybierz pierwszy nieukończony krok z `docs/STAN.md`).

## Przygotowanie
1. Przeczytaj `docs/STAN.md`, bieżący plan etapu, `docs/DECYZJE.md` oraz w `docs/DOKUMENTACJA.md` sekcje dotyczące ID tego kroku.
2. Sprawdź warunki: plan ma status **ZATWIERDZONY**; poprzednie kroki są ukończone (chyba że plan stanowi inaczej); brak otwartych pytań blokujących ten krok. Jeśli warunek nie jest spełniony, przerwij i wyjaśnij.
3. Upewnij się, że pracujesz na gałęzi `etap-N` (utwórz ją z `main`, jeśli nie istnieje). Ustaw ID kroku na `W TOKU` w `docs/MACIERZ.md`.

## Realizacja
4. Zaimplementuj **wyłącznie** zakres kroku. Przestrzegaj niezmienników z `CLAUDE.md`. Przy niejasności zatrzymaj się i zapytaj, nie zgaduj.
5. Dla każdego kryterium [A] napisz test, którego nazwa zaczyna się od ID (`RYS-01: ...`). Kryteria [R] zostaw do testów ręcznych.
6. Uruchom pełny zestaw kontroli: lint, sprawdzanie typów, wszystkie testy (także z poprzednich kroków i etapów), testy Rust, build. Napraw błędy, aż wszystko będzie zielone. Nie wyłączaj ani nie osłabiaj istniejących testów, żeby przeszły.

## Samokontrola
7. Dla każdego ID kroku przejdź przez kryteria akceptacji z planu i potwierdź spełnienie (plik i test). Sprawdź listę „Definicja ukończenia kroku” z `docs/WORKFLOW.md`, sekcja 4.
8. Odstępstwa od planu lub dokumentacji opisz jawnie. Nie oznaczaj takiego ID jako ZAIMPL., tylko zgłoś odstępstwo właścicielowi.

## Zamknięcie kroku
9. Zaktualizuj:
   - `docs/MACIERZ.md`: status `ZAIMPL.`, kolumna Testy, ewentualne uwagi, podsumowanie liczbowe,
   - `docs/STAN.md`: status kroku UKOŃCZONY, bieżący krok, następne działania, wpis w dzienniku (co zrobiono, decyzje, problemy),
   - `CHANGELOG.md`: sekcja [Niewydane] z ID.
10. Utwórz commit na gałęzi etapu w formacie `feat(ID,ID): opis` (`docs/WORKFLOW.md`, sekcja 8). Nie wypychaj (push).
11. Przedstaw raport: zrealizowane ID, wyniki kontroli (liczby testów), odstępstwa, co właściciel może sprawdzić ręcznie, następny krok. Zaproponuj rozpoczęcie następnego kroku w nowej sesji.
