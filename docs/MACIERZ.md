# Macierz śledzenia wymagań

> Zgodna z dokumentacją w wersji **1.1**. Statusy i zasady zmian: `docs/WORKFLOW.md`, sekcja 5.
> Kolumna **Testy**: nazwy plików testów lub `ręczny: <nr z raportu>`. Kolumna **Uwagi**: odstępstwa, odwołania do ZW i raportów.

## Podsumowanie
| Etap | Wymagań | ZAIMPL. | ZWERYF. | Status etapu |
|---|---|---|---|---|
| 1 | 73 | 0 | 0 | REALIZACJA |
| 2 | 6 | 0 | 0 | NIEROZPOCZĘTY |
| 3 | 13 | 0 | 0 | NIEROZPOCZĘTY |
| 4 | 15 | 0 | 0 | NIEROZPOCZĘTY |
| 5 | 3 | 0 | 0 | NIEROZPOCZĘTY |
| **Razem** | **110** | **0** | **0** | |

Wykluczenia WYK-01 – WYK-05 nie są implementowane. Audytor sprawdza w każdym etapie, czy nie zostały naruszone.

## Etap 1
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| PLAT-01 | Windows | W TOKU | `.github/workflows/ci.yml` (build-desktop: NSIS, MSI); `e2e/shell.spec.ts`; `src-tauri/src/lib.rs` (`plat_01_*`) | K1 przygotowane w kroku 1.0, niepotwierdzone w CI (brak repozytorium GitHub). Lokalnie: `tauri build` NSIS+MSI i test dymny `e2e-app/smoke.test.mjs` zaliczone na Windows 11. K2 ręczny R01. Domknięcie: 1.14 |
| PLAT-02 | Linux | W TOKU | `.github/workflows/ci.yml` (build-desktop: AppImage, deb; smoke); `e2e-app/smoke.test.mjs` | K1 przygotowane w kroku 1.0, niepotwierdzone w CI (brak repozytorium GitHub). K2 ręczny R02. Domknięcie: 1.14 |
| PLAT-03 | Android | W TOKU | `.github/workflows/ci.yml` (build-android: APK arm64-v8a) | K1 przygotowane w kroku 1.0, niepotwierdzone w CI (brak repozytorium GitHub, brak lokalnego Android SDK). APK debug do czasu klucza wydania (1.14). K2 ręczny R03. Domknięcie: 1.14 |
| WEJ-01 | Tablet z Androidem i rysikiem | — | | |
| WEJ-02 | Tablet graficzny | — | | |
| WEJ-03 | Ekran dotykowy | — | | |
| WEJ-04 | Mysz i klawiatura | — | | |
| WEJ-05 | Nacisk, nachylenie, gumka rysika | — | | |
| WEJ-06 | Odrzucanie dotyku dłoni | — | | |
| WAR-01 | Wiele warstw nałożonych | — | | |
| WAR-02 | Ukrywanie/pokazywanie warstwy | — | | |
| WAR-03 | Blokowanie warstwy | — | | |
| WAR-04 | Zmiana kolejności warstw | — | | |
| WAR-05 | Przezroczystość warstwy | — | | |
| WAR-06 | Izolacja warstw | — | | |
| WAR-07 | Wybór instalowanych warstw | — | | |
| WAR-08 | Dodawanie warstw bez reinstalacji | — | | |
| WAR-09 | Instalacja warstwy z pliku | — | | |
| WAR-10 | Katalog warstw online | — | | |
| WAR-11 | Niezależne wersje i aktualizacje warstw | — | | |
| WAR-12 | Stabilne, udokumentowane API wtyczek | — | | |
| RYS-01 | Pióro z naciskiem | — | | |
| RYS-02 | Zakreślacz | — | | |
| RYS-03 | Gumka: cała kreska | — | | |
| RYS-04 | Gumka: fragment | — | | |
| RYS-05 | Figury | — | | |
| RYS-06 | Linijka | — | | |
| RYS-07 | Ekierka | — | | |
| RYS-08 | Kątomierz | — | | |
| RYS-09 | Cyrkiel | — | | |
| RYS-10 | Układ współrzędnych | — | | |
| RYS-11 | Oś liczbowa | — | | |
| RYS-12 | Wskaźnik laserowy | — | | |
| RYS-13 | Tekst z klawiatury | — | | |
| RYS-14 | Zaznaczanie i edycja elementów | — | | |
| TLO-01 | Jednolity kolor | — | | |
| TLO-02 | Przezroczyste (Windows/Linux, 2 tryby) | — | | |
| TLO-03 | Przezroczyste (Android, zrzut ekranu) | — | | |
| TLO-04 | Kratka | — | | |
| TLO-05 | Linie | — | | |
| TLO-06 | Papier milimetrowy | — | | |
| TLO-07 | Układ współrzędnych | — | | |
| TLO-08 | Własny obraz | — | | |
| OBS-01 | Nieskończone płótno | — | | |
| OBS-02 | Tryb stron | — | | |
| MM-01 | PNG, JPG, SVG, GIF | — | | |
| MM-02 | MP4 | — | | |
| MM-03 | MP3, WAV | — | | |
| MM-04 | PDF | — | | |
| MM-05 | YouTube | — | | |
| MM-06 | Transformacje multimediów | — | | |
| MM-07 | Sterowanie odtwarzaniem | — | | |
| MM-08 | Rysowanie po multimediach | — | | |
| MM-09 | Zrzut fragmentu ekranu | — | | |
| UI-01 | Język PL/EN | W TOKU | `app/src/lib/i18n/core.test.ts`; `tools/eslint-rules/no-raw-text.test.ts`; `e2e/shell.spec.ts` | Krok 1.0: infrastruktura (pliki tłumaczeń, test parytetu kluczy, reguła lint `tablica/no-raw-text`, przełączanie bez restartu, D10). Pełne tłumaczenia: 1.11 |
| UI-02 | Motywy interfejsu | W TOKU | `app/src/lib/theme/tokens.test.ts`; `e2e/shell.spec.ts` | Krok 1.0: infrastruktura (tokeny kolorów, jasny/ciemny/systemowy D11, test kontrastu tokenów). Domknięcie: 1.11 |
| UI-03 | Szybki pasek ulubionych | — | | |
| UI-04 | Konfigurowalne skróty | — | | |
| UI-05 | Tryb standardowy | — | | |
| UI-06 | Tryb prezentacji | — | | |
| UI-07 | Jeden ekran | — | | |
| UI-08 | Dwa monitory | — | | |
| DAN-01 | Zapis lekcji | — | | |
| DAN-02 | Autozapis | — | | |
| DAN-03 | Cofanie/ponawianie (50) | — | | |
| DAN-04 | Eksport PDF | — | | |
| DAN-05 | Eksport PNG | — | | |
| INT-01 | Zgodność z udostępnianiem ekranu | — | | |
| NF-01 | GPL-3.0, zgodne licencje | W TOKU | `scripts/license-policy.test.ts`; `scripts/check-licenses.mjs`; `src-tauri/deny.toml`; `src-tauri/src/lib.rs` (`nf_01_*`) | Weryfikowane w każdym etapie. Krok 1.0: K1 (kontrola npm i Cargo w CI), K2 bez listy w „O programie”. Domknięcie: 1.14 |
| NF-02 | Instalatory na GitHub Releases | — | | |
| NF-03 | Płynność na sprzęcie docelowym | — | | Weryfikowane w każdym etapie |
| NF-04 | Brak opóźnienia rysowania | — | | Próg w planie etapu 1 |
| NF-05 | Praca offline | — | | Weryfikowane w każdym etapie |

## Etap 2
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| FIZ-01 | Wektory | — | | |
| FIZ-02 | Wykresy funkcji | — | | |
| FIZ-03 | Edytor LaTeX | — | | |
| FIZ-04 | Mechanizm symulacji | — | | |
| FIZ-05 | Ruch jednostajny | — | | |
| FIZ-06 | Ruch jednostajnie przyspieszony | — | | |

## Etap 3
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| CHEM-01 | Wzory sumaryczne i jonowe | — | | |
| CHEM-02 | Wzory strukturalne | — | | |
| CHEM-03 | Strzałki reakcji | — | | |
| CHEM-04 | Warunki reakcji | — | | |
| CHEM-05 | Dobieranie współczynników | — | | |
| CHEM-06 | Modele 3D | — | | |
| CHEM-07 | Konfiguracja elektronowa | — | | |
| CHEM-08 | Wzory Lewisa | — | | |
| UO-01 | Interaktywny układ okresowy | — | | |
| UO-02 | Karta pierwiastka | — | | |
| UO-03 | Izotopy naturalne | — | | |
| UO-04 | Podświetlanie grup/bloków | — | | |
| UO-05 | Przeciąganie na tablicę | — | | |

## Etap 4
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| SCH-01 | Biblioteka elementów | — | | |
| SCH-02 | Rozszerzalność biblioteki | — | | |
| SCH-03 | Symbole IEC/ANSI | — | | |
| SCH-04 | Przewody | — | | |
| SCH-05 | Opisy i numeracja | — | | |
| SCH-06 | Transformacje elementów | — | | |
| SCH-07 | Tryb statyczny | — | | |
| SCH-08 | Tryb symulacji | — | | |
| PS-01 | Pełna płytka | — | | |
| PS-02 | Dwie płytki z listwą | — | | |
| PS-03 | Elementy realistyczne | — | | |
| PS-04 | Moduły | — | | |
| PS-05 | Kolorowe przewody | — | | |
| PS-06 | Kod barwny rezystorów | — | | |
| PS-07 | Powiązanie ze schematem | — | | |

## Etap 5
| ID | Wymaganie | Status | Testy | Uwagi |
|---|---|---|---|---|
| MK-01 | Pinouty płytek | — | | |
| MK-02 | Płytki startowe | — | | |
| MK-03 | Przebiegi cyfrowe | — | | |
