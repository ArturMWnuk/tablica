# Dokumentacja programu: Tablica

> **Wersja dokumentacji:** 1.1 (2026-11-01)
> **Status:** zatwierdzona, źródło prawdy dla projektu.
> Zmiany tylko przez proces zmiany wymagań (`docs/WORKFLOW.md`, sekcja 7).

### Konwencja identyfikatorów
Każde wymaganie ma niezmienny identyfikator `[PREFIKS-NN]`, np. `[RYS-01]`. Identyfikatory:
- są używane w planach etapów, testach, commitach i raportach weryfikacji,
- nigdy nie są używane ponownie. Usunięte wymaganie zostaje w dokumencie z oznaczeniem ~~skreślenia~~ i adnotacją `USUNIĘTE (ZW-NNN)`,
- nowe wymaganie dostaje kolejny wolny numer w swoim prefiksie.

| Prefiks | Obszar | Sekcja |
|---|---|---|
| PLAT | Platformy | 3 |
| WEJ | Urządzenia wejściowe | 3 |
| WAR | System warstw | 4.1 |
| RYS | Warstwa rysunkowa | 4.3 |
| TLO | Warstwa tła | 4.4 |
| OBS | Obszar tablicy | 4.5 |
| MM | Multimedia | 4.6 |
| CHEM | Wzory chemiczne | 4.7 |
| UO | Układ okresowy | 4.8 |
| FIZ | Fizyka i matematyka | 4.9 |
| SCH | Schematy elektroniczne | 4.10 |
| PS | Płytka stykowa | 4.11 |
| MK | Mikrokontrolery | 4.12 |
| UI | Interfejs użytkownika | 5 |
| DAN | Dane i zapis | 6 |
| INT | Integracje | 7 |
| NF | Wymagania niefunkcjonalne | 8 |
| WYK | Wykluczenia (poza zakresem) | 9 |

## 1. Cel i opis ogólny
**Tablica** to wirtualna tablica dla nauczyciela, używana podczas prowadzenia zajęć zdalnych. Uczniowie widzą ją przez udostępnienie ekranu w komunikatorze.

Tablica składa się z wielu **warstw** nałożonych na siebie. Każda warstwa wnosi własny zestaw narzędzi. Program jest **modułowy**: użytkownik wybiera, które warstwy zainstalować, a nowe warstwy można łatwo dodawać i aktualizować.

**Główna przewaga nad istniejącymi programami:** bogaty wybór narzędzi dopasowanych do przedmiotów ścisłych i technicznych (chemia, fizyka, elektronika, mikrokontrolery). Brak narzędzi to główna wada konkurencji.

## 2. Użytkownicy docelowi
- **Główny użytkownik:** autor programu, nauczyciel chemii, fizyki, podstaw elektroniki i programowania mikrokontrolerów. Prowadzi zajęcia zdalne.
- **Potencjalnie:** inni nauczyciele, jeśli będą chętni. Program powinien być prosty w instalacji i nie zależeć od konfiguracji jednej osoby.

## 3. Platforma i technologia
**Platformy docelowe**
- **[PLAT-01]** Windows.
- **[PLAT-02]** Linux.
- **[PLAT-03]** Android.

**Urządzenia wejściowe** (wszystkie obsługiwane równorzędnie)
- **[WEJ-01]** Tablet z Androidem i rysikiem.
- **[WEJ-02]** Tablet graficzny podłączony do komputera.
- **[WEJ-03]** Ekran dotykowy.
- **[WEJ-04]** Mysz i klawiatura.
- **[WEJ-05]** Wykorzystanie siły nacisku, nachylenia i końcówki gumki rysika, jeśli urządzenie je udostępnia.
- **[WEJ-06]** Odrzucanie dotyku dłoni podczas pisania rysikiem.

**Stos technologiczny** (uzasadnienia w `docs/DECYZJE.md`)

| Obszar | Wybór | Decyzja |
|---|---|---|
| Aplikacja | **Tauri 2** (rdzeń w Rust, interfejs w TypeScript) | ADR-001 |
| Interfejs | TypeScript + lekki framework UI (Svelte lub React) | ADR-006 |
| Rysowanie | Canvas 2D / WebGL (np. PixiJS) | ADR-001 |
| Obsługa rysika | Pointer Events | ADR-001 |
| Warstwy | **Wtyczki** (pakiety TS/JS ładowane w czasie działania) | ADR-002 |
| Dane | Pliki lokalne | ADR-004 |

## 4. Funkcjonalności
### 4.1 System warstw (architektura wtyczek)
- **[WAR-01]** Tablica składa się z wielu warstw nałożonych na siebie.
- **[WAR-02]** Ukrywanie i pokazywanie warstwy.
- **[WAR-03]** Blokowanie warstwy przed edycją.
- **[WAR-04]** Zmiana kolejności warstw.
- **[WAR-05]** Regulacja przezroczystości warstwy.
- **[WAR-06]** Warstwy są od siebie odizolowane, np. wymazywanie na warstwie rysunkowej nie narusza multimediów czy schematu pod spodem.
- **[WAR-07]** Przy instalacji (lub później w ustawieniach) użytkownik wybiera, które warstwy zainstalować.
- **[WAR-08]** Nowe warstwy można dodawać bez reinstalacji programu.
- **[WAR-09]** Instalacja warstwy z pliku lokalnego (ręcznie pobrany pakiet warstwy).
- **[WAR-10]** Wbudowany katalog warstw: lista dostępnych warstw z repozytorium online (GitHub), z instalacją i aktualizacją jednym kliknięciem.
- **[WAR-11]** Każda warstwa ma osobną wersję i aktualizuje się niezależnie.
- **[WAR-12]** Program definiuje stabilny, udokumentowany interfejs (API) dla wtyczek warstw, żeby kolejne warstwy dało się łatwo tworzyć.

### 4.2 Lista warstw
| # | Warstwa | Opis | Szczegóły | Etap |
|---|---|---|---|---|
| 1 | Rysunkowa | Odręczne rysowanie i pisanie, narzędzia rysunkowe | 4.3 | 1 |
| 2 | Tło | Tło tablicy | 4.4 | 1 |
| 3 | Multimedia | Obrazy, wideo, dźwięk, PDF, YouTube | 4.6 | 1 |
| 4 | Wzory chemiczne | Edytor wzorów i równań chemicznych | 4.7 | 3 |
| 5 | Układ okresowy | Interaktywny układ okresowy pierwiastków | 4.8 | 3 |
| 6 | Schematy elektroniczne | Edytor schematów ideowych z opcjonalną symulacją | 4.10 | 4 |
| 7 | Płytka stykowa | Rysunki układów na płytce stykowej, powiązane ze schematem | 4.11 | 4 |
| 8 | Fizyka i matematyka | Wektory, wykresy funkcji, wzory LaTeX, symulacje | 4.9 | 2 |
| 9 | Mikrokontrolery | Pinouty płytek, przebiegi sygnałów cyfrowych | 4.12 | 5 |

### 4.3 Warstwa rysunkowa — narzędzia
**Pisanie i rysowanie odręczne**
- **[RYS-01]** Pióro z obsługą siły nacisku.
- **[RYS-02]** Zakreślacz (półprzezroczysty).
- **[RYS-03]** Gumka usuwająca całą kreskę.
- **[RYS-04]** Gumka wymazująca fragment kreski.

**Figury**
- **[RYS-05]** Linia, strzałka, prostokąt, okrąg, wielokąt.

**Przyrządy geometryczne** (wirtualne, przesuwane i obracane na tablicy)
- **[RYS-06]** Linijka.
- **[RYS-07]** Ekierka.
- **[RYS-08]** Kątomierz.
- **[RYS-09]** Cyrkiel.

**Narzędzia matematyczne**
- **[RYS-10]** Układ współrzędnych wstawiany na tablicę.
- **[RYS-11]** Oś liczbowa.

**Inne**
- **[RYS-12]** Wskaźnik laserowy: ślad znika po chwili, przydatny przy udostępnianiu ekranu.
- **[RYS-13]** Tekst wpisywany z klawiatury.
- **[RYS-14]** Zaznaczanie, przesuwanie, skalowanie i usuwanie narysowanych elementów.

### 4.4 Warstwa tła
- **[TLO-01]** Jednolity kolor, dowolny, wybierany przez użytkownika.
- **[TLO-02]** Tło przezroczyste na Windows i Linux: przezroczyste okno nakładane na pulpit, z możliwością rysowania po tym, co jest pod nim (np. strona WWW, inny program). Są dwa tryby przełączane skrótem klawiszowym i przyciskiem:
  - **tryb rysowania:** okno przechwytuje wejście,
  - **tryb przepuszczania:** kliknięcia i przewijanie trafiają do programu pod spodem, a rysunki pozostają widoczne.
- **[TLO-03]** Tło przezroczyste na Androidzie: zamiast nakładki na inne aplikacje wykonywany jest zrzut ekranu, który staje się tłem do rysowania.
- **[TLO-04]** Kratka.
- **[TLO-05]** Linie.
- **[TLO-06]** Papier milimetrowy.
- **[TLO-07]** Układ współrzędnych.
- **[TLO-08]** Własny obraz.

### 4.5 Obszar tablicy
- **[OBS-01]** Tryb nieskończonego płótna: przewijanie i powiększanie w dowolnym kierunku.
- **[OBS-02]** Tryb stron (jak zeszyt): przechodzenie do następnej/poprzedniej strony i dodawanie nowych.

### 4.6 Warstwa multimediów
**Obsługiwane formaty**
- **[MM-01]** Grafika: PNG, JPG, SVG, GIF (z animacją).
- **[MM-02]** Wideo: MP4.
- **[MM-03]** Dźwięk: MP3, WAV.
- **[MM-04]** PDF: strony wstawiane na tablicę lub jako tło stron.
- **[MM-05]** Filmy z YouTube wstawiane po linku (odtwarzacz osadzony na tablicy).

**Funkcje**
- **[MM-06]** Przesuwanie, skalowanie, obracanie i kadrowanie wstawionych elementów.
- **[MM-07]** Sterowanie odtwarzaniem wideo i dźwięku (start, pauza, przewijanie, głośność).
- **[MM-08]** Rysowanie po obrazach, dokumentach PDF i zatrzymanej klatce filmu. Adnotacje trafiają na warstwę rysunkową nad multimediami, więc oryginał pozostaje nienaruszony.
- **[MM-09]** Zrzut fragmentu ekranu wstawiany prosto na tablicę (np. z innego programu lub przeglądarki).

### 4.7 Warstwa wzorów chemicznych
- **[CHEM-01]** Wzory sumaryczne i jonowe z poprawnymi indeksami dolnymi i ładunkami (H₂SO₄, SO₄²⁻).
- **[CHEM-02]** Wzory strukturalne i półstrukturalne: rysowanie cząsteczek (wiązania pojedyncze, podwójne, potrójne, pierścienie, grupy funkcyjne). Baza: edytor typu Ketcher.
- **[CHEM-03]** Równania reakcji ze strzałkami (reakcja jednokierunkowa, odwracalna, równowaga).
- **[CHEM-04]** Warunki reakcji nad i pod strzałką (temperatura, katalizator, ciśnienie).
- **[CHEM-05]** Automatyczne dobieranie współczynników stechiometrycznych.
- **[CHEM-06]** Modele 3D cząsteczek obracane na tablicy, w widoku kulkowo-pręcikowym i czaszowym.
- **[CHEM-07]** Konfiguracja elektronowa: zapis zwykły i skrócony (z rdzeniem gazu szlachetnego) oraz diagramy klatkowe.
- **[CHEM-08]** Wzory elektronowe (kropkowe, Lewisa).

### 4.8 Warstwa układu okresowego
- **[UO-01]** Interaktywny układ okresowy wyświetlany na tablicy.
- **[UO-02]** Kliknięcie pierwiastka otwiera kartę z danymi: masa atomowa, liczba atomowa, elektroujemność, konfiguracja elektronowa, stopnie utlenienia.
- **[UO-03]** Karta pierwiastka zawiera naturalnie występujące izotopy z ich rozpowszechnieniem.
- **[UO-04]** Podświetlanie grup, okresów, bloków (s, p, d, f), metali, niemetali i półmetali.
- **[UO-05]** Przeciąganie symbolu pierwiastka lub jego karty na tablicę.

### 4.9 Warstwa fizyki i matematyki
- **[FIZ-01]** Wektory: rysowanie, opisywanie (np. F, v, a), składanie i rozkładanie na składowe.
- **[FIZ-02]** Wykresy funkcji: wpisanie wzoru rysuje wykres w układzie współrzędnych, z możliwością kilku funkcji naraz.
- **[FIZ-03]** Edytor wzorów matematycznych (składnia LaTeX, z podglądem na żywo).
- **[FIZ-04]** Rozszerzalny mechanizm prostych symulacji fizycznych z regulacją parametrów i wykresami (s(t), v(t), a(t)) rysowanymi na żywo.
- **[FIZ-05]** Symulacja ruchu jednostajnego prostoliniowego.
- **[FIZ-06]** Symulacja ruchu jednostajnie przyspieszonego (także opóźnionego).
- Kolejne symulacje (np. rzut ukośny, wahadło) w przyszłych wersjach, przez zmianę wymagań.

### 4.10 Warstwa schematów elektronicznych (ideowych)
- **[SCH-01]** Biblioteka elementów:
  - pasywne: rezystory, kondensatory, cewki,
  - półprzewodniki: diody, LED, tranzystory BJT i MOSFET,
  - układy scalone: wzmacniacze operacyjne, bramki logiczne, mikrokontrolery,
  - źródła napięcia i prądu, przełączniki, przekaźniki,
  - mierniki: woltomierz, amperomierz, multimetr.
- **[SCH-02]** Biblioteka elementów jest rozszerzalna o nowe elementy.
- **[SCH-03]** Symbole w normie IEC (europejskiej) lub ANSI (amerykańskiej), do wyboru w ustawieniach.
- **[SCH-04]** Przewody przyciągane do wyprowadzeń elementów i prowadzone pod kątem prostym.
- **[SCH-05]** Opisy wartości (np. 10 kΩ, 100 nF) i automatyczna numeracja elementów (R1, C2, D3…).
- **[SCH-06]** Obracanie, odbijanie, kopiowanie i usuwanie elementów.
- **[SCH-07]** Tryb rysunku statycznego: schemat służy tylko do ilustracji.
- **[SCH-08]** Tryb symulacji: obliczanie prądów i napięć w obwodzie, świecenie diod LED, pomiary wirtualnym multimetrem. Rozsądnym silnikiem jest gotowy symulator SPICE (np. ngspice skompilowany do WebAssembly) albo prostszy własny solver dla obwodów DC. Wybór zapada w ADR podczas planowania etapu 4.

### 4.11 Warstwa płytki stykowej
- **[PS-01]** Pełna płytka stykowa.
- **[PS-02]** Układ z dwóch płytek połączonych pośrodku wspólną listwą zasilającą.
- **[PS-03]** Elementy z biblioteki schematów (SCH-01) w realistycznym wyglądzie. Biblioteka jest rozszerzalna.
- **[PS-04]** Moduły: płytki mikrokontrolerów (na start te z MK-02), czujniki, wyświetlacze. Biblioteka jest rozszerzalna.
- **[PS-05]** Kolorowe przewody przeciągane między otworami płytki.
- **[PS-06]** Paski kodu barwnego na rezystorach generowane automatycznie z wartości rezystancji.
- **[PS-07]** Powiązanie ze schematem ideowym: schemat (warstwa 6) i rysunek płytki to dwa widoki tego samego układu. Dodanie, usunięcie lub zmiana elementu albo połączenia w jednym widoku aktualizuje drugi.

### 4.12 Warstwa mikrokontrolerów
- **[MK-01]** Pinouty płytek: diagramy wyprowadzeń wstawiane na tablicę, z kolorowym oznaczeniem funkcji pinów (zasilanie, GND, cyfrowe, analogowe, PWM, UART, I²C, SPI). Biblioteka jest rozszerzalna.
- **[MK-02]** Płytki w pierwszej wersji (dotyczy też modułów w warstwie płytki stykowej): Arduino Uno, ESP32 DevKitC V2, ESP32-S3 DevKit, ESP32-C3 Super Mini.
- **[MK-03]** Przebiegi cyfrowe: edytor diagramów czasowych (stany wysokie/niskie, zegar, PWM o regulowanym wypełnieniu, ramki UART / I²C / SPI), z opisami i znacznikami czasu.

## 5. Interfejs użytkownika
- **[UI-01]** Język interfejsu: polski i angielski, przełączany w ustawieniach. Teksty interfejsu są trzymane w plikach tłumaczeń, także we wtyczkach warstw, żeby łatwo dodać kolejne języki.
- **[UI-02]** Motyw kolorystyczny interfejsu do wyboru (co najmniej jasny i ciemny).
- **[UI-03]** Szybki pasek ulubionych narzędzi: użytkownik sam wybiera i układa najczęściej używane narzędzia, także z różnych warstw.
- **[UI-04]** Skróty klawiszowe: domyślny zestaw z możliwością zmiany każdego skrótu w ustawieniach. Wtyczki warstw rejestrują własne skróty.
- **[UI-05]** Tryb pracy standardowy, z paskami narzędzi i panelem warstw.
- **[UI-06]** Tryb prezentacji: ukryte paski narzędzi, czysta tablica do udostępnienia ekranu. Narzędzia są dostępne np. z menu kontekstowego lub skrótów.
- **[UI-07]** Konfiguracja z jednym ekranem: tablica i narzędzia na tym samym ekranie.
- **[UI-08]** Konfiguracja z dwoma monitorami podłączonymi do jednego komputera: na jednym panel sterowania (narzędzia, warstwy, podgląd, notatki), na drugim czysta tablica w trybie pełnoekranowym do udostępnienia.
- Kolor tablicy: patrz TLO-01 – TLO-03.

## 6. Dane i ich przechowywanie
- **[DAN-01]** Zapis lekcji we własnym formacie pliku, który zachowuje wszystkie warstwy, strony i ustawienia. Do lekcji można wrócić i kontynuować pracę.
- **[DAN-02]** Automatyczny zapis: domyślnie co 2 minuty, z możliwością zmiany interwału lub wyłączenia w ustawieniach.
- **[DAN-03]** Cofanie i ponawianie: domyślnie 50 kroków, liczba zmieniana w ustawieniach (Ctrl+Z / Ctrl+Y oraz przyciski i gesty).
- **[DAN-04]** Eksport do PDF (w trybie stron każda strona to osobna strona PDF).
- **[DAN-05]** Eksport do PNG (bieżący widok lub strona).

## 7. Integracje zewnętrzne
- **[INT-01]** Uczniowie widzą tablicę przez udostępnienie ekranu lub okna w zewnętrznym komunikatorze (Teams, Zoom, Meet, Discord). Okno tablicy musi dać się poprawnie przechwycić przez takie udostępnianie.

## 8. Wymagania niefunkcjonalne
- **[NF-01]** Licencja GPL-3.0. Wszystkie zależności muszą mieć licencje zgodne z GPL-3.0.
- **[NF-02]** Dystrybucja: instalatory dla Windows, Linux i Android (APK) publikowane w wydaniach (Releases) na GitHubie. Wbudowany katalog warstw korzysta z tego samego repozytorium.
- **[NF-03]** Sprzęt docelowy: laptop sprzed 3–4 lat z 16 GB RAM. Na nim wszystkie wyspecyfikowane funkcje działają płynnie, łącznie z symulacjami, wideo i wieloma warstwami naraz.
- **[NF-04]** Rysowanie bez odczuwalnego opóźnienia między ruchem rysika a pojawieniem się kreski. Mierzalny próg ustala plan etapu 1.
- **[NF-05]** Program działa w pełni offline. Wyjątki to katalog warstw online (WAR-10) i filmy YouTube (MM-05).
- Zalecane techniki optymalizacji: renderowanie tylko widocznego obszaru, buforowanie nieaktywnych warstw, leniwe ładowanie wtyczek i ciężkich bibliotek (np. silnika symulacji, edytora chemicznego) dopiero przy pierwszym użyciu.

## 9. Ograniczenia i poza zakresem
- **[WYK-01]** Program nie kopiuje rozwiązań z istniejących tablic.
- **[WYK-02]** Brak wbudowanego udostępniania tablicy uczniom i współpracy w czasie rzeczywistym (zastępuje je udostępnianie ekranu).
- **[WYK-03]** Brak łączenia kilku urządzeń (np. tablet jako wejście dla komputera). Tryb dwóch ekranów dotyczy tylko jednego urządzenia.
- **[WYK-04]** Brak edytora kodu i wgrywania programów do mikrokontrolerów. Warstwa mikrokontrolerów służy wyłącznie do ilustracji.
- **[WYK-05]** Brak kont użytkowników i synchronizacji w chmurze. Wszystkie dane są przechowywane lokalnie.

## 10. Etapy realizacji
| Etap | Zakres | Wymagania |
|---|---|---|
| **1** | Rdzeń programu i system wtyczek, warstwa rysunkowa, tło, multimedia, zapis i eksport, interfejs, tryb prezentacji i dwóch monitorów | PLAT, WEJ, WAR, RYS, TLO, OBS, MM, UI, DAN, INT, NF |
| **2** | Warstwa fizyki i matematyki (warstwa 8) | FIZ |
| **3** | Warstwy wzorów chemicznych i układu okresowego (warstwy 4–5) | CHEM, UO |
| **4** | Warstwy schematów elektronicznych i płytki stykowej (warstwy 6–7) | SCH, PS |
| **5** | Warstwa mikrokontrolerów (warstwa 9) | MK |

Wymagania NF i WYK obowiązują we wszystkich etapach i są weryfikowane przy każdym z nich.

## 11. Historia zmian dokumentacji
| Wersja | Data | Zmiana |
|---|---|---|
| 1.0 | 2026-11-01 | Pierwsza kompletna wersja na podstawie wywiadu. |
| 1.1 | 2026-11-01 | Nadanie identyfikatorów wymaganiom, przypisanie wymagań do etapów, doprecyzowanie INT-01 i NF-05 (offline). Treść wymagań bez zmian. |
