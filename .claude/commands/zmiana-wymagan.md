---
description: Zgłoś zmianę wymagań z analizą wpływu (dokumentacja zmienia się dopiero po zatwierdzeniu)
argument-hint: <opis zmiany>
---
Właściciel zgłasza zmianę wymagań projektu Tablica: **$ARGUMENTS**

## Faza 1: analiza (bez zmian w dokumentacji i kodzie)
1. Przeczytaj `docs/DOKUMENTACJA.md`, `docs/MACIERZ.md`, `docs/STAN.md`, `docs/DECYZJE.md` i plany etapów, których zmiana może dotyczyć.
2. Jeśli opis jest niejasny, zadaj pytania doprecyzowujące, zanim przejdziesz dalej.
3. Nadaj kolejny numer ZW-NNN (sprawdź `docs/zmiany/`) i utwórz `docs/zmiany/ZW-NNN.md` według `docs/szablony/ZMIANA-WYMAGAN.md`, ze statusem PROPONOWANA. Zawrzyj:
   - dokładną proponowaną treść wymagań (przed → po),
   - nowe ID (kolejny wolny numer w prefiksie, numery nigdy nie są używane ponownie),
   - analizę wpływu: ID, etapy (szczególnie zamknięte), kod, API wtyczek, testy, ADR, koszt i ryzyko,
   - przypisanie nowych wymagań do etapu.
4. Przedstaw właścicielowi zwięzłe podsumowanie i poproś o decyzję. **Nie zmieniaj jeszcze dokumentacji.**

## Faza 2: wdrożenie (tylko po wyraźnym zatwierdzeniu)
5. `docs/DOKUMENTACJA.md`: wprowadź zmianę, podnieś wersję (drobna zmiana: 1.x → 1.x+1; zmiana zakresu lub podziału na etapy: 2.0), dopisz wiersz w historii zmian z numerem ZW. Usuniętych wymagań nie kasuj: przekreśl je i dopisz `USUNIĘTE (ZW-NNN)`.
6. `docs/MACIERZ.md`: dodaj, zmień lub oznacz wiersze; zaktualizuj wersję dokumentacji i podsumowanie.
7. Zaktualizuj plany etapów, których to dotyczy. Jeśli plan był ZATWIERDZONY, opisz zmianę w planie i poproś o ponowne zatwierdzenie zmienionej części.
8. Jeśli zmiana dotyczy zamkniętego etapu: dodaj kroki poprawkowe i zaznacz w STAN, że po nich wymagana jest ponowna weryfikacja tego zakresu.
9. W razie potrzeby dopisz ADR. Ustaw status ZW na ZATWIERDZONA z datą i zaktualizuj `docs/STAN.md` (dziennik, wersja dokumentacji).
10. Commit: `docs(ZW-NNN): <opis>`.

Przy odrzuceniu: status ZW ODRZUCONA z datą i powodem, wpis w dzienniku STAN. Dokumentacja pozostaje bez zmian.
