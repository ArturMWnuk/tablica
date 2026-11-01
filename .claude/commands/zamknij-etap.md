---
description: Zamknij etap po pozytywnym audycie i testach ręcznych właściciela
argument-hint: <numer etapu>
---
Zamknij etap **$ARGUMENTS** projektu Tablica.

## Sprawdzenie bramek (przerwij przy pierwszym niespełnionym warunku i wyjaśnij)
1. Wszystkie kroki etapu w `docs/STAN.md` mają status UKOŃCZONY.
2. Najnowszy raport `docs/raporty/ETAP-$ARGUMENTS-weryfikacja*.md` ma wynik ZALICZONY albo WARUNKOWO, a każde odstępstwo zostało zatwierdzone przez właściciela (zapisane w raporcie lub w ZW).
3. Raport powstał dla aktualnego kodu: od commita w raporcie nie było zmian w kodzie (`git log`). Jeśli były, wymagany jest ponowny `/weryfikuj-etap`.
4. Wszystkie testy ręczne w raporcie są odznaczone jako zaliczone. Jeśli nie, zapytaj właściciela o wyniki i wpisz je do raportu.
5. Uruchom ponownie pełny zestaw kontroli (lint, typy, wszystkie testy, build). Wszystko musi być zielone.

## Zamknięcie
6. `docs/MACIERZ.md`: ID etapu ze statusem ZAIMPL. → **ZWERYF.** (zatwierdzone odstępstwa → ODST.), zaktualizuj podsumowanie.
7. `CHANGELOG.md`: przenieś wpisy z [Niewydane] do sekcji nowej wersji (etap N → `v0.N.0`, etap 5 → `v1.0.0`) z datą.
8. `docs/STAN.md`: etap ZAMKNIĘTY, wersja programu, bieżący etap = następny (NIEROZPOCZĘTY), następne działanie `/planuj-etap N+1`, wpis w dzienniku.
9. Commit `chore(etap-$ARGUMENTS): zamknięcie etapu`, scal gałąź `etap-$ARGUMENTS` do `main` i utwórz lokalny tag wersji.
10. Przedstaw podsumowanie etapu. **Zapytaj o zgodę** przed wypchnięciem (push) gałęzi i tagu oraz przed publikacją wydania na GitHubie.
