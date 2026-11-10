# API wtyczek warstw Tablicy

Wersja API: **1.0.0** (pakiet `@tablica/plugin-api`). Wymaganie: WAR-12.

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
