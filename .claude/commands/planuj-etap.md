---
description: Przygotuj plan etapu na podstawie dokumentacji (bez pisania kodu)
argument-hint: <numer etapu>
---
Przygotuj plan etapu **$ARGUMENTS** projektu Tablica. Nie pisz kodu programu.

1. Przeczytaj: `docs/STAN.md`, `docs/WORKFLOW.md`, całą `docs/DOKUMENTACJA.md`, `docs/MACIERZ.md`, `docs/DECYZJE.md` oraz plany i raporty poprzednich etapów, jeśli istnieją.
2. **Warunek wejścia:** poprzedni etap ma w `STAN.md` status ZAMKNIĘTY (dla etapu 1 brak warunku). Jeśli nie, przerwij i wyjaśnij dlaczego.
3. Wypisz **wszystkie** ID przypisane do etapu w sekcji 10 dokumentacji i porównaj z `MACIERZ.md`. Nie dodawaj funkcji spoza dokumentacji. Prace konieczne technicznie (szkielet projektu, CI, infrastruktura testów) opisz jako zadania techniczne powiązane z ID, którym służą.
4. Dla każdego ID zdefiniuj **mierzalne kryteria akceptacji**, oznaczone [A] (test automatyczny) lub [R] (test ręczny). Unikaj sformułowań nieweryfikowalnych („szybko”, „wygodnie”). Zamieniaj je na liczby i konkretne zachowania.
5. Podziel etap na **kroki**: każdy na jedną sesję pracy (orientacyjnie do 8 ID), każdy kończy się działającym, przetestowanym programem. Kolejność: fundamenty najpierw (szkielet, API wtyczek, mechanizm cofania i zapisu), potem funkcje. Dla etapu 1 krok 1.0 to szkielet projektu Tauri 2, CI budujące Windows/Linux/Android, lint, testy.
6. Wskaż decyzje architektoniczne wymagające ADR (w tym wszystkie ADR o statusie OTWARTA dotyczące tego etapu). Podaj rekomendację z uzasadnieniem i alternatywami.
7. Spisz ryzyka (zwłaszcza zależne od platformy) i listę testów ręcznych na urządzeniach.
8. Spisz niejasności w dokumentacji jako pytania do właściciela. **Nie rozstrzygaj ich sam.**
9. Zapisz plan do `docs/etapy/ETAP-$ARGUMENTS-plan.md` według `docs/szablony/PLAN-ETAPU.md`, ze statusem **PROJEKT**.
10. Zaktualizuj `docs/STAN.md`: status etapu PLANOWANIE, odnośnik do planu, wpis w dzienniku.
11. Przedstaw właścicielowi podsumowanie: liczba ID i kroków, rekomendowane decyzje, pytania. **Nie zaczynaj implementacji.**

Po zatwierdzeniu planu przez właściciela (w kolejnej wiadomości):
- wpisz odpowiedzi na pytania do planu, zmień status planu na **ZATWIERDZONY** (z datą),
- zapisz ADR w `docs/DECYZJE.md`,
- wypełnij tabelę kroków w `docs/STAN.md`, ustaw status etapu REALIZACJA, gałąź `etap-$ARGUMENTS`,
- jeśli odpowiedź właściciela zmienia wymaganie, zamiast tego uruchom proces z `/zmiana-wymagan`.
