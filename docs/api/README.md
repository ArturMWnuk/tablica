# API wtyczek warstw Tablicy

Wersja API: **1.1.0** (pakiet `@tablica/plugin-api`). Wymaganie: WAR-12.

| Dokument | Zawartość |
|---|---|
| [Jak napisać warstwę](jak-napisac-warstwe.md) | Przewodnik krok po kroku z przykładem |
| [Referencja](referencja/README.md) | Opis wszystkich typów i funkcji, generowany z kodu (`pnpm docs:api`) |

Referencji nie edytuje się ręcznie. Po zmianie typów w `packages/plugin-api` uruchom `pnpm docs:api`; test `WAR-12: reference documentation is generated from the current types` pilnuje, żeby była aktualna.

## Zasady wersjonowania
- Wersja API ma postać SemVer `GŁÓWNA.POBOCZNA.POPRAWKA`.
- Wtyczka podaje w manifeście `apiVersion`, czyli wersję, dla której ją napisano.
- Program ładuje wtyczkę, gdy wersja główna jest taka sama, a wersja poboczna programu jest równa lub nowsza. W innym wypadku wtyczka nie jest ładowana, a użytkownik dostaje komunikat.
- Nowa wersja poboczna tylko dodaje możliwości. Zmiana niekompatybilna oznacza nową wersję główną i wymaga decyzji architektonicznej (ADR).

## Historia wersji
| Wersja | Krok | Zmiany |
|---|---|---|
| 1.1.0 | 1.4 | Zdarzenie narzędzia ma nachylenie rysika (`tilt`) i przewidywane pozycje (`predicted`, typ `ToolPointerSample`); opis fazy `cancel`, zdarzeń scalonych i pomiaru opóźnienia rysowania. Zgodne wstecz: wtyczki dla 1.0.0 działają bez zmian. |
| 1.0.0 | 1.2 | Pierwsza wersja: rejestracja warstwy, kontener i kamera, narzędzia, skróty, panele, tłumaczenia, polecenia cofania, zapis z wersją formatu i migracjami. |
