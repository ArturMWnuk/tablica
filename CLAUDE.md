# Tablica — zasady pracy dla Claude Code

Tablica to modułowa tablica dla nauczyciela do zajęć zdalnych (Windows, Linux, Android), oparta na Tauri 2 + TypeScript. Warstwy tablicy to wtyczki.

## Najważniejsze pliki
- `docs/DOKUMENTACJA.md`: specyfikacja z identyfikatorami wymagań (np. `RYS-01`). **Jedyne źródło prawdy.**
- `docs/WORKFLOW.md`: proces pracy (fazy, bramki, statusy, git). Przestrzegaj go.
- `docs/STAN.md`: bieżący stan projektu. **Czytaj go na początku każdej sesji.**
- `docs/MACIERZ.md`: status i testy każdego wymagania.
- `docs/DECYZJE.md`: decyzje architektoniczne (ADR). Nie łam ich bez nowego ADR.
- `docs/etapy/ETAP-N-plan.md`: zatwierdzony plan etapu z kryteriami akceptacji.

## Reguły bezwzględne
1. **Nie implementuj niczego, czego nie ma w dokumentacji i zatwierdzonym planie.** Nie pomijaj niczego, co w nich jest. Elementy czysto techniczne (infrastruktura, refaktoryzacja) są dozwolone, jeśli służą konkretnemu ID.
2. **Niejasność = pytanie, nie domysł.** Zatrzymaj się, zapisz pytanie w `docs/STAN.md` i zapytaj właściciela.
3. **Nie zmieniaj `docs/DOKUMENTACJA.md` poza procesem `/zmiana-wymagan`** i bez zgody właściciela.
4. **Nie ustawiaj statusu `ZWERYF.`** w MACIERZ. Robi się to tylko w `/zamknij-etap` po audycie i testach właściciela.
5. **Nie pracuj bez zatwierdzonego planu etapu** (status planu: ZATWIERDZONY).
6. **Każdy krok kończy się zielonymi kontrolami** (lint, typy, testy, build) i aktualizacją MACIERZ, STAN i CHANGELOG (Definicja ukończenia: `docs/WORKFLOW.md`, sekcja 4).
7. **Nie wypychaj (push) i nie publikuj wydań** bez wyraźnej zgody właściciela.

## Niezmienniki architektury
- Rdzeń programu nie zna konkretnych warstw. Każda warstwa, także rysunkowa i tło, to wtyczka korzystająca wyłącznie z publicznego API wtyczek (WAR-12).
- Zmiany API wtyczek są wersjonowane. Zmiana niekompatybilna wymaga ADR.
- Warstwy są odizolowane. Narzędzie jednej warstwy nie modyfikuje danych innej (WAR-06).
- Wszystkie teksty interfejsu idą przez pliki tłumaczeń PL i EN, także we wtyczkach (UI-01).
- Każda operacja zmieniająca dokument przechodzi przez wspólny mechanizm cofania (DAN-03).
- Ciężkie biblioteki i wtyczki ładowane są leniwie, przy pierwszym użyciu (NF-03).
- Nowa zależność wymaga sprawdzenia licencji pod kątem zgodności z GPL-3.0 (NF-01).
- Działanie offline z wyjątkiem WAR-10 i MM-05 (NF-05).

## Konwencje
- Komunikacja z właścicielem i dokumentacja: **po polsku**. Kod, identyfikatory i komentarze w kodzie: **po angielsku** (ADR-005).
- Nazwy testów zaczynają się od ID wymagania: `RYS-01: ...`.
- Commity w formacie Conventional Commits z ID: `feat(RYS-01): ...` (`docs/WORKFLOW.md`, sekcja 8).
- Gałąź robocza etapu: `etap-N`.

## Komendy projektu
`/stan`, `/planuj-etap N`, `/realizuj-krok [nr]`, `/weryfikuj-etap N [krok M]`, `/zmiana-wymagan <opis>`, `/zamknij-etap N`. Weryfikację wykonuje agent `audytor`.
