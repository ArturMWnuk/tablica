---
description: Niezależna weryfikacja etapu (lub kroku) na zgodność z dokumentacją przez agenta audytora
argument-hint: <numer etapu> [krok <numer>]
---
Przeprowadź weryfikację projektu Tablica dla: **$ARGUMENTS**.

1. Uruchom agenta **`audytor`** (narzędzie Agent, subagent_type `audytor`). Nie przeprowadzaj audytu samodzielnie w tej sesji. Przekaż mu:
   - zakres: etap (i ewentualnie krok) z argumentów,
   - ścieżki: `docs/DOKUMENTACJA.md`, `docs/etapy/ETAP-N-plan.md`, `docs/MACIERZ.md`, `CLAUDE.md`, `docs/szablony/RAPORT-WERYFIKACJI.md`,
   - nazwę pliku raportu: `docs/raporty/ETAP-N-weryfikacja.md` (dla kroku: `ETAP-N-krok-M-weryfikacja.md`). Jeśli plik istnieje, kolejna wersja `-v2`, `-v3`…
2. Po otrzymaniu wyniku przeczytaj raport i przedstaw właścicielowi:
   - wynik (ZALICZONY / WARUNKOWO / NIEZALICZONY),
   - listę braków i odstępstw,
   - listę testów ręcznych do wykonania.
3. Przy weryfikacji całego etapu zaktualizuj `docs/STAN.md`: status etapu WERYFIKACJA (przy brakach) lub AKCEPTACJA (przy wyniku ZALICZONY), odnośnik do raportu, wpis w dzienniku.
4. Jeśli są braki: zaproponuj kroki poprawkowe. Po zgodzie właściciela dopisz je do planu etapu (jako kroki N.x-poprawka) i do tabeli kroków w STAN. Nie poprawiaj kodu w tej komendzie.
5. Nie zmieniaj statusów w `docs/MACIERZ.md` na ZWERYF. To robi wyłącznie `/zamknij-etap`.
