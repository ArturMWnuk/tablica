# Raport weryfikacji: etap N [krok M] (wersja raportu vK)

| Pole | Wartość |
|---|---|
| Data | RRRR-MM-DD |
| Wersja dokumentacji | 1.x |
| Plan | `docs/etapy/ETAP-N-plan.md` |
| Commit | <hash> |
| **Wynik** | **ZALICZONY / WARUNKOWO / NIEZALICZONY** |

## 1. Podsumowanie
2–5 zdań: ogólna ocena, liczba ID w każdym statusie, najważniejsze braki.

## 2. Kontrole automatyczne (uruchomione przez audytora)
| Kontrola | Polecenie | Wynik |
|---|---|---|
| Lint | | |
| Typy | | |
| Testy jednostkowe/integracyjne | | X/Y |
| Testy Rust | | X/Y |
| Build | | |

## 3. Zgodność z wymaganiami
Wynik: **OK**, **CZĘŚCIOWO**, **BRAK** albo **ODSTĘPSTWO**. Każdy wynik OK wymaga dowodu.

| ID | Kryterium | Dowód (plik:linia, test) | Wynik | Uwagi |
|---|---|---|---|---|

## 4. Regresja poprzednich etapów
| Etap | Testy | Wynik |
|---|---|---|

## 5. Niezmienniki architektury i wymagania przekrojowe
| Reguła | Wynik | Dowód / uwagi |
|---|---|---|
| Rdzeń nie zna konkretnych warstw (WAR-12) | | |
| Izolacja warstw (WAR-06) | | |
| Brak tekstów UI na sztywno (UI-01) | | |
| Wspólny mechanizm cofania (DAN-03) | | |
| Leniwe ładowanie (NF-03) | | |
| Licencje zależności (NF-01) | | |
| Offline (NF-05) | | |
| Wykluczenia WYK-01–05 nienaruszone | | |

## 6. Elementy spoza dokumentacji
Funkcje lub zachowania, których nie ma w dokumentacji ani w planie.

## 7. Testy ręczne dla właściciela
Do wykonania na prawdziwych urządzeniach. Właściciel odznacza wynik.

- [ ] R1 (<ID>, <platforma>): <procedura> → <oczekiwany wynik>

## 8. Zalecenia
Kroki poprawkowe, priorytety, ryzyka.
