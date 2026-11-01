# Plan etapu 1: Rdzeń, system wtyczek, rysowanie, tło, multimedia

| Pole | Wartość |
|---|---|
| Status planu | **ZATWIERDZONY** (2026-11-01, właściciel) |
| Wersja dokumentacji | 1.1 |
| Data utworzenia | 2026-11-01 |
| Gałąź | `etap-1` |
| Wersja po zamknięciu | `v0.1.0` |

**Zasady planu**
- ID może być realizowane w kilku krokach. Status `ZAIMPL.` dostaje dopiero w kroku, w którym spełnione są wszystkie jego kryteria (kolumna „Krok” w sekcji 1 wskazuje ten krok).
- Od kroku 1.5 (zapis lekcji) każdy nowy rodzaj elementu musi mieć test zapisu i odczytu (round-trip) oraz obsługę cofania. To kryterium dziedziczone, niepowtarzane przy każdym ID.
- Parametry domyślne z tabeli D (sekcja 7) wymagają zatwierdzenia razem z planem.

## 1. Zakres
Etap 1 obejmuje 73 wymagania (sekcja 10 dokumentacji: PLAT, WEJ, WAR, RYS, TLO, OBS, MM, UI, DAN, INT, NF). Lista zgodna z `docs/MACIERZ.md`. Wykluczenia WYK-01–05 obowiązują i są sprawdzane przez audytora.

| ID | Wymaganie (skrót) | Krok |
|---|---|---|
| PLAT-01 | Windows | 1.0 → 1.14 |
| PLAT-02 | Linux | 1.0 → 1.14 |
| PLAT-03 | Android | 1.0 → 1.14 |
| WEJ-01 | Tablet z Androidem i rysikiem | 1.4 |
| WEJ-02 | Tablet graficzny | 1.4 |
| WEJ-03 | Ekran dotykowy | 1.4 |
| WEJ-04 | Mysz i klawiatura | 1.4 |
| WEJ-05 | Nacisk, nachylenie, gumka rysika | 1.4 |
| WEJ-06 | Odrzucanie dotyku dłoni | 1.4 |
| WAR-01 | Wiele warstw nałożonych | 1.2 |
| WAR-02 | Ukrywanie/pokazywanie | 1.3 |
| WAR-03 | Blokowanie | 1.3 |
| WAR-04 | Kolejność | 1.3 |
| WAR-05 | Przezroczystość | 1.3 |
| WAR-06 | Izolacja warstw | 1.2 |
| WAR-07 | Wybór instalowanych warstw | 1.13 |
| WAR-08 | Dodawanie bez reinstalacji | 1.13 |
| WAR-09 | Instalacja z pliku | 1.13 |
| WAR-10 | Katalog online | 1.13 |
| WAR-11 | Niezależne wersje i aktualizacje | 1.13 |
| WAR-12 | Stabilne API wtyczek | 1.2 → 1.13 |
| RYS-01 | Pióro z naciskiem | 1.4 |
| RYS-02 | Zakreślacz | 1.4 |
| RYS-03 | Gumka: cała kreska | 1.6 |
| RYS-04 | Gumka: fragment | 1.6 |
| RYS-05 | Figury | 1.7 |
| RYS-06 | Linijka | 1.7 |
| RYS-07 | Ekierka | 1.7 |
| RYS-08 | Kątomierz | 1.7 |
| RYS-09 | Cyrkiel | 1.7 |
| RYS-10 | Układ współrzędnych | 1.7 |
| RYS-11 | Oś liczbowa | 1.7 |
| RYS-12 | Wskaźnik laserowy | 1.6 |
| RYS-13 | Tekst | 1.6 |
| RYS-14 | Zaznaczanie i edycja | 1.6 |
| TLO-01 | Jednolity kolor | 1.8 |
| TLO-02 | Przezroczyste (Windows/Linux) | 1.10 |
| TLO-03 | Przezroczyste (Android) | 1.10 |
| TLO-04 | Kratka | 1.8 |
| TLO-05 | Linie | 1.8 |
| TLO-06 | Papier milimetrowy | 1.8 |
| TLO-07 | Układ współrzędnych | 1.8 |
| TLO-08 | Własny obraz | 1.8 |
| OBS-01 | Nieskończone płótno | 1.8 |
| OBS-02 | Tryb stron | 1.8 |
| MM-01 | PNG, JPG, SVG, GIF | 1.9 |
| MM-02 | MP4 | 1.9 |
| MM-03 | MP3, WAV | 1.9 |
| MM-04 | PDF | 1.9 |
| MM-05 | YouTube | 1.10 |
| MM-06 | Transformacje | 1.9 |
| MM-07 | Sterowanie odtwarzaniem | 1.9 |
| MM-08 | Rysowanie po multimediach | 1.9 |
| MM-09 | Zrzut fragmentu ekranu | 1.10 |
| UI-01 | Język PL/EN | 1.0 → 1.11 |
| UI-02 | Motywy | 1.0 → 1.11 |
| UI-03 | Szybki pasek | 1.12 |
| UI-04 | Skróty klawiszowe | 1.12 |
| UI-05 | Tryb standardowy | 1.12 |
| UI-06 | Tryb prezentacji | 1.12 |
| UI-07 | Jeden ekran | 1.12 |
| UI-08 | Dwa monitory | 1.12 |
| DAN-01 | Zapis lekcji | 1.5 |
| DAN-02 | Autozapis | 1.5 |
| DAN-03 | Cofanie/ponawianie | 1.3 |
| DAN-04 | Eksport PDF | 1.11 |
| DAN-05 | Eksport PNG | 1.11 |
| INT-01 | Udostępnianie ekranu | 1.12 |
| NF-01 | GPL-3.0, licencje | 1.0 → 1.14 |
| NF-02 | Wydania na GitHubie | 1.14 |
| NF-03 | Płynność na sprzęcie docelowym | 1.14 |
| NF-04 | Brak opóźnienia rysowania | 1.4 |
| NF-05 | Offline | 1.14 |

**Zadania techniczne**

| Zadanie | Służy | Krok |
|---|---|---|
| T1 Szkielet Tauri 2 + Svelte 5 + TypeScript (strict) + Vite, monorepo pnpm | PLAT-01–03 | 1.0 |
| T2 Lint i formatowanie: ESLint (z regułami granic modułów), Prettier, svelte-check, clippy, rustfmt | WAR-12, wszystkie | 1.0 |
| T3 Testy: Vitest (jednostkowe), Playwright (frontend z atrapą API Tauri), cargo test, test dymny aplikacji przez tauri-driver | wszystkie | 1.0 |
| T4 CI GitHub Actions: kontrole + build Windows, Linux, Android przy każdym pushu | PLAT-01–03 | 1.0 |
| T5 Automatyczna kontrola licencji w CI (license-checker, cargo-deny) | NF-01 | 1.0 |
| T6 Infrastruktura tłumaczeń i motywów (tokeny kolorów) | UI-01, UI-02 | 1.0 |
| T7 Prototypy ryzyk technicznych (sekcja 6) z wnioskami w ADR | TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04 | 1.1 |
| T8 Dokumentacja API wtyczek w `docs/api/` | WAR-12 | 1.2 → 1.13 |
| T9 Wtyczka testowa (fixture) do testów API i instalacji | WAR-06, WAR-08–12 | 1.2, 1.13 |
| T10 Instrumentacja wydajności i benchmarki | NF-03, NF-04 | 1.4, 1.14 |
| T11 Repozytorium GitHub, sekrety CI, klucz podpisu Androida (wymaga właściciela) | NF-02 | 1.14 |

## 2. Kryteria akceptacji
**[A]** test automatyczny, **[R]** test ręczny (numery testów ręcznych w sekcji 5).

### Platformy
**PLAT-01 Windows**
- K1 [A] CI buduje instalator NSIS (.exe) i MSI dla Windows x64 przy każdym pushu na `etap-1`.
- K2 [R] Instalacja i uruchomienie na Windows 10 i 11 x64; wszystkie testy ręczne oznaczone „Win” zaliczone (R01).

**PLAT-02 Linux**
- K1 [A] CI buduje AppImage i .deb (baza Ubuntu 22.04).
- K2 [R] Uruchomienie na dystrybucji właściciela (P12); testy ręczne „Lin” zaliczone (R02).

**PLAT-03 Android**
- K1 [A] CI buduje APK (arm64-v8a) i przechodzi testy jednostkowe części Kotlin/Rust.
- K2 [R] Instalacja na tablecie właściciela z Androidem w wersji minimalnej (P12) lub nowszej; testy ręczne „And” zaliczone (R03).

### Wejście
**WEJ-01 Tablet z Androidem i rysikiem**
- K1 [A] Potok wejścia rozpoznaje `pointerType` pen / touch / mouse i kieruje zdarzenia do aktywnego narzędzia (testy na zdarzeniach syntetycznych).
- K2 [R] Na tablecie z Androidem rysik rysuje kreskę bez przerw i skoków przy szybkim pisaniu (R10).

**WEJ-02 Tablet graficzny**
- K1 [R] Tablet graficzny na Windows i Linux rysuje z naciskiem; przyciski rysika działają zgodnie z D4 (R11).

**WEJ-03 Ekran dotykowy**
- K1 [A] Jeden palec rysuje aktywnym narzędziem, dopóki w sesji nie użyto rysika (D4).
- K2 [A] Dwa palce: przesuwanie i powiększanie (pinch), bez rysowania.
- K3 [R] Ekran dotykowy laptopa z Windows: rysowanie, gesty (R12).

**WEJ-04 Mysz i klawiatura**
- K1 [A] Lewy przycisk używa narzędzia; kółko przewija; Ctrl + kółko powiększa; środkowy przycisk lub Spacja + przeciągnięcie przesuwa widok.
- K2 [A] Każde narzędzie etapu jest dostępne i używalne bez rysika i ekranu dotykowego (test e2e myszą).

**WEJ-05 Nacisk, nachylenie, gumka rysika**
- K1 [A] Przy nacisku 1,0 grubość kreski pióra wynosi ≥ 2× grubości przy nacisku 0,25.
- K2 [A] Urządzenie bez nacisku (mysz, stała wartość 0,5) rysuje kreską o grubości nominalnej.
- K3 [A] Zdarzenie z końcówki gumki (`buttons & 32`) przełącza na gumkę na czas kontaktu i wraca do poprzedniego narzędzia.
- K4 [A] Nachylenie zgodnie z D2.
- K5 [R] Nacisk i gumka rysika na tablecie Android i tablecie graficznym (R10, R11).

**WEJ-06 Odrzucanie dotyku dłoni**
- K1 [A] Zdarzenia touch są ignorowane do rysowania, gdy rysik jest w kontakcie, w zasięgu (hover) albo do 500 ms od jego ostatniego zdarzenia.
- K2 [A] Po pierwszym użyciu rysika w sesji pojedynczy palec nie rysuje (tylko gesty), zgodnie z D4.
- K3 [R] 1 minuta pisania na tablecie z dłonią opartą o ekran: 0 przypadkowych kresek (R13).

### System warstw
**WAR-01 Wiele warstw**
- K1 [A] Dokument przechowuje uporządkowaną listę warstw; renderowanie odpowiada kolejności (test z trzema warstwami: tło, multimedia, rysunkowa).
- K2 [A] Elementy wszystkich widocznych warstw są wyświetlane jednocześnie, wspólnie przesuwane i powiększane.
- K3 [A] Liczba instancji warstw jednego typu zgodnie z odpowiedzią P3.

**WAR-02 Ukrywanie/pokazywanie**
- K1 [A] Ukryta warstwa nie jest renderowana i nie przyjmuje wejścia.
- K2 [A] Stan widoczności jest zapisywany w lekcji.

**WAR-03 Blokowanie**
- K1 [A] Na zablokowanej warstwie żadne narzędzie nie tworzy, nie zmienia ani nie usuwa elementów (test każdego narzędzia warstwy).
- K2 [A] Panel warstw pokazuje stan blokady; stan zapisywany w lekcji.

**WAR-04 Kolejność**
- K1 [A] Zmiana kolejności przyciskami i przeciąganiem w panelu warstw zmienia kolejność renderowania.
- K2 [A] Stan zapisywany w lekcji; obsługa cofania zgodnie z D12.

**WAR-05 Przezroczystość**
- K1 [A] Suwak 0–100 % (krok 5 %) zmienia krycie całej warstwy.
- K2 [A] Stan zapisywany w lekcji; obsługa cofania zgodnie z D12.

**WAR-06 Izolacja warstw**
- K1 [A] Gumka (oba tryby) i zaznaczanie na warstwie rysunkowej nie zmieniają danych warstw tła i multimediów (porównanie serializacji przed i po).
- K2 [A] Narzędzie działa wyłącznie na aktywnej warstwie swojego typu. API nie daje wtyczce dostępu do zapisu danych innej warstwy (próba kończy się błędem).
- K3 [A] Wyjątek we wtyczce nie zatrzymuje programu: warstwa zostaje oznaczona jako uszkodzona, pozostałe działają, dane warstwy nie są tracone przy zapisie.

**WAR-07 Wybór instalowanych warstw**
- K1 [A] Przy pierwszym uruchomieniu kreator wyboru warstw (zgodnie z P1), z opisami warstw.
- K2 [A] Ustawienia → Warstwy: włączanie, wyłączanie i odinstalowanie warstw (z wyjątkiem obowiązkowych, P2).
- K3 [A] Lekcja zawierająca warstwę niezainstalowaną otwiera się, warstwa jest oznaczona „brak wtyczki” z propozycją instalacji, a jej dane zostają zachowane przy zapisie.

**WAR-08 Dodawanie bez reinstalacji**
- K1 [A] Zainstalowana warstwa jest dostępna w bieżącej sesji bez restartu programu i bez reinstalacji.

**WAR-09 Instalacja z pliku**
- K1 [A] Instalacja z pakietu `.tablica-warstwa`: walidacja manifestu, zgodności wersji API i struktury; błędny pakiet daje czytelny komunikat i nic nie instaluje.
- K2 [A] Przed instalacją z pliku pojawia się ostrzeżenie o niezweryfikowanym źródle (P14).
- K3 [A] Odinstalowanie usuwa pliki wtyczki, nie usuwa danych w lekcjach.

**WAR-10 Katalog online**
- K1 [A] Katalog pobiera indeks z repozytorium GitHub (adres z P13, konfigurowalny), pokazuje nazwę, opis, wersję i stan (zainstalowana / dostępna aktualizacja).
- K2 [A] Instalacja i aktualizacja jednym kliknięciem; suma SHA-256 pakietu jest weryfikowana z indeksem, niezgodność przerywa instalację.
- K3 [A] Brak internetu: komunikat w katalogu, reszta programu działa.

**WAR-11 Niezależne wersje**
- K1 [A] Manifest każdej warstwy zawiera wersję SemVer i wymaganą wersję API.
- K2 [A] Aktualizacja jednej warstwy nie zmienia plików innych warstw.
- K3 [A] Lekcja zapisuje wersje użytych wtyczek; nowsza wersja wtyczki migruje dane starszej (hook `migrate`) i ma test migracji.
- K4 [A] Sprawdzanie dostępnych aktualizacji zgodnie z D13.

**WAR-12 Stabilne API wtyczek**
- K1 [A] API v1 jest opisane w `docs/api/` (dokumentacja generowana z typów + przewodnik „Jak napisać warstwę”).
- K2 [A] Warstwy wbudowane (rysunkowa, tło, multimedia) korzystają wyłącznie z pakietu `@tablica/plugin-api`; reguła lint blokuje inne importy z rdzenia.
- K3 [A] Wtyczka testowa napisana wyłącznie według dokumentacji API rejestruje narzędzie, panel, skrót, tłumaczenia, serializację i polecenia cofania; testy przechodzą.
- K4 [A] Wtyczka z niezgodną wersją główną API nie jest ładowana; użytkownik dostaje komunikat.

### Warstwa rysunkowa
**RYS-01 Pióro**
- K1 [A] Grubość kreski zależy od nacisku zgodnie z WEJ-05.
- K2 [A] Wybór koloru: paleta ≥ 12 kolorów + dowolny kolor (hex/próbnik); grubość: ≥ 5 wartości gotowych + suwak 1–50 px.
- K3 [A] Kreska jest wygładzana (algorytm obrysu z naciskiem); test porównawczy z wzorcem obrazu.
- K4 [R] Pisanie odręczne jest czytelne i płynne na każdej platformie (R10–R12).

**RYS-02 Zakreślacz**
- K1 [A] Krycie 40 %, stała grubość (bez nacisku), nakładające się fragmenty jednej kreski nie ciemnieją.
- K2 [A] Tryb mieszania „multiply”: tekst i kreski pod zakreśleniem pozostają czytelne (test obrazu).

**RYS-03 Gumka: cała kreska**
- K1 [A] Dotknięcie kreski gumką usuwa całą kreskę (tolerancja trafienia 8 px ekranu).
- K2 [A] Jedno przeciągnięcie gumką = jedna operacja cofania, niezależnie od liczby usuniętych kresek.

**RYS-04 Gumka: fragment**
- K1 [A] Gumka wycina część kreski pod sobą; pozostałe fragmenty stają się niezależnymi kreskami.
- K2 [A] Rozmiar gumki: ≥ 3 wartości gotowe.
- K3 [A] Cofnięcie przywraca oryginalną kreskę.

**RYS-05 Figury**
- K1 [A] Linia, strzałka (grot na jednym lub obu końcach), prostokąt, okrąg/elipsa, wielokąt (wierzchołki kliknięciami, zamknięcie kliknięciem w pierwszy punkt lub dwuklikiem).
- K2 [A] Shift: przyciąganie kątów co 15°, kwadrat, koło.
- K3 [A] Kolor i grubość konturu, wypełnienie (brak / kolor).
- K4 [A] Figura po narysowaniu ma uchwyty edycji wierzchołków i rozmiaru.

**RYS-06 Linijka**
- K1 [A] Podziałka w cm i mm zgodnie z D14, skalowana z powiększeniem.
- K2 [A] Przesuwanie i obracanie (uchwyt, dwa palce), z wyświetlaniem kąta; Shift: obrót co 15°.
- K3 [A] Kreska pióra prowadzona w odległości < 20 px od krawędzi przyciąga się do krawędzi i jest prosta.
- K4 [A] Wstawianie i chowanie przyrządu nie zmienia dokumentu (przyrząd nie jest elementem lekcji).

**RYS-07 Ekierka**
- K1 [A] Dwa warianty: 45°-45°-90° i 30°-60°-90°, z podziałką wzdłuż przyprostokątnych.
- K2 [A] Przesuwanie i obracanie jak RYS-06 K2; rysowanie wzdłuż każdej krawędzi jak RYS-06 K3.

**RYS-08 Kątomierz**
- K1 [A] Kątomierz 180° z podziałką co 1°, przesuwanie i obracanie.
- K2 [A] Pomiar kąta: dwa przeciągane ramiona, odczyt z dokładnością do 1°.
- K3 [A] Rysowanie łuku piórem wzdłuż krawędzi kątomierza.

**RYS-09 Cyrkiel**
- K1 [A] Ustawienie środka (nóżka) i promienia (rozwarcie) z odczytem promienia w cm.
- K2 [A] Obrót cyrkla rysuje łuk lub pełny okrąg aktualnym kolorem i grubością pióra.

**RYS-10 Układ współrzędnych**
- K1 [A] Wstawiany obiekt: osie X i Y, podziałka z etykietami, zakres regulowany (domyślnie −10…10), opcjonalna siatka, opisy osi edytowalne.
- K2 [A] Obiekt można przesuwać i skalować (RYS-14).

**RYS-11 Oś liczbowa**
- K1 [A] Zakres i krok podziałki regulowane, etykiety liczbowe.
- K2 [A] Zaznaczanie punktów i przedziałów z końcami otwartymi/zamkniętymi (D15).

**RYS-12 Wskaźnik laserowy**
- K1 [A] Ślad zanika płynnie po czasie z D1; nie trafia do dokumentu ani historii cofania.
- K2 [A] Ślad jest widoczny w trybie prezentacji i w oknie tablicy w trybie dwóch monitorów.

**RYS-13 Tekst**
- K1 [A] Kliknięcie tworzy pole tekstowe; obsługa polskich znaków i klawiatury ekranowej Androida.
- K2 [A] Rozmiar czcionki, kolor, pogrubienie, kursywa.
- K3 [A] Dwuklik / podwójne stuknięcie otwiera ponowną edycję.

**RYS-14 Zaznaczanie i edycja**
- K1 [A] Zaznaczanie kliknięciem, prostokątem i lassem; Shift dodaje do zaznaczenia.
- K2 [A] Przesuwanie, skalowanie (uchwyty; Shift = proporcjonalnie) i usuwanie (Delete / przycisk).
- K3 [A] Każda operacja to jeden krok cofania.
- K4 [A] Zaznaczanie działa na kreskach, figurach, tekście, układzie współrzędnych i osi liczbowej aktywnej warstwy.

### Tło i obszar tablicy
**TLO-01 Jednolity kolor**
- K1 [A] Dowolny kolor tła (paleta + hex/próbnik); kolor tła i kolor linii wzoru (TLO-04–07) ustawiane niezależnie.
- K2 [A] Ustawienie zapisywane w lekcji (zakres: lekcja / strona zgodnie z D16).

**TLO-02 Przezroczyste (Windows, Linux)**
- K1 [R] Tło przezroczyste: przez okno widać pulpit i programy, rysunki pozostają widoczne (R20).
- K2 [R] Tryb przepuszczania: kliknięcia, przewijanie i klawiatura trafiają do programu pod spodem; rysunki widoczne (R21).
- K3 [A] Przełączanie trybów skrótem (D9) i przyciskiem na pływającym mini-pasku, który pozostaje klikalny w trybie przepuszczania.
- K4 [R] Udostępnianie całego ekranu pokazuje rysunki nad programami (R22).
- K5 [R] Linux: działanie zgodne z wynikiem prototypu (krok 1.1) i odpowiedzią P12; ograniczenia (np. Wayland) opisane w ADR i komunikowane użytkownikowi.

**TLO-03 Przezroczyste (Android)**
- K1 [R] Wybór tła przezroczystego uruchamia zrzut ekranu (zgoda systemowa MediaProjection, przebieg wg D17), a zrzut staje się tłem bieżącego widoku lub strony (R23).
- K2 [A] Zrzut jest zapisywany w pliku lekcji.

**TLO-04 Kratka**
- K1 [A] Rozmiar oczka regulowany (domyślnie 5 mm wg D14), kolor linii.
- K2 [A] Wzór skaluje się z powiększeniem i jest nieskończony w trybie płótna.

**TLO-05 Linie**
- K1 [A] Odstęp linii regulowany; opcjonalny margines pionowy.

**TLO-06 Papier milimetrowy**
- K1 [A] Linie co 1 mm, wyróżnione co 5 mm i co 10 mm (trzy grubości).

**TLO-07 Układ współrzędnych (tło)**
- K1 [A] Osie przez punkt (0,0), podziałka z etykietami, siatka, regulowana jednostka podziałki.

**TLO-08 Własny obraz**
- K1 [A] PNG, JPG, SVG; tryby: rozciągnij, dopasuj, wypełnij, kafelki, środek.
- K2 [A] Obraz osadzony w pliku lekcji.

**OBS-01 Nieskończone płótno**
- K1 [A] Przesuwanie bez ograniczeń (test: ±1 000 000 px bez błędów renderowania); powiększenie zgodnie z D5.
- K2 [A] Przyciski: „100 %”, „pokaż całość”.

**OBS-02 Tryb stron**
- K1 [A] Strony w formacie z P7; przejście do następnej/poprzedniej przyciskami i skrótami (PgDn/PgUp).
- K2 [A] Dodawanie stron; zarządzanie stronami zgodnie z D16 (panel miniatur).
- K3 [A] Tryb lekcji wybierany przy tworzeniu; przełączanie zgodnie z P6.

### Multimedia
**MM-01 Grafika**
- K1 [A] Wstawianie PNG, JPG, SVG i GIF: okno wyboru pliku, przeciągnij-i-upuść, wklejanie ze schowka (Ctrl+V); animowany GIF się odtwarza.
- K2 [A] Pliki osadzone w pliku lekcji (lekcja przenośna między komputerami).

**MM-02 Wideo MP4**
- K1 [A] Wstawianie i odtwarzanie MP4 (H.264/AAC).
- K2 [R] Odtwarzanie na Windows, Linux i Android (R30).
- K3 [A] Osadzanie lub linkowanie zgodnie z P10.

**MM-03 Dźwięk**
- K1 [A] Wstawianie MP3 i WAV jako element z kontrolkami odtwarzania.

**MM-04 PDF**
- K1 [A] Import PDF z wyborem stron: strona jako obiekt na tablicy albo jako tło stron lekcji (w trybie stron każda strona PDF → nowa strona lekcji).
- K2 [A] Strona PDF ostra przy powiększeniu do 400 % (ponowne renderowanie przy zmianie powiększenia).
- K3 [A] Import 50-stronicowego PDF trwa ≤ 10 s na sprzęcie referencyjnym (pomiar w benchmarku).

**MM-05 YouTube**
- K1 [A] Wklejenie linku (youtube.com/watch, youtu.be, shorts) tworzy osadzony odtwarzacz.
- K2 [A] Bez internetu: element pokazuje miniaturę zastępczą i komunikat; reszta programu działa.
- K3 [R] Odtwarzanie na Windows, Linux i Android (R31).

**MM-06 Transformacje**
- K1 [A] Przesuwanie, skalowanie (domyślnie proporcjonalne), obracanie (Shift: co 15°) wszystkich elementów multimedialnych.
- K2 [A] Kadrowanie nieniszczące obrazów, stron PDF i wideo (oryginał zachowany, kadr odwracalny).

**MM-07 Sterowanie odtwarzaniem**
- K1 [A] Start, pauza, przewijanie, głośność dla wideo, dźwięku i YouTube; Spacja steruje zaznaczonym elementem.

**MM-08 Rysowanie po multimediach**
- K1 [A] Kreski nad obrazem, PDF i zatrzymanym wideo trafiają na warstwę rysunkową; plik multimediów i dane warstwy multimediów pozostają niezmienione.
- K2 [A] Zachowanie adnotacji po wznowieniu wideo zgodnie z P9.

**MM-09 Zrzut fragmentu ekranu**
- K1 [R] Windows/Linux: po wywołaniu (przycisk / skrót) Tablica się chowa, użytkownik zaznacza prostokąt, fragment trafia na tablicę jako obraz; Esc anuluje (R32).
- K2 [R] Android: zrzut przez MediaProjection z kadrowaniem (R33).
- K3 [A] Zrzut osadzony w lekcji jak obraz MM-01.

### Interfejs
**UI-01 Język PL/EN**
- K1 [A] Wszystkie teksty interfejsu (rdzeń i wtyczki) pochodzą z plików tłumaczeń; test parytetu kluczy PL/EN; reguła lint zakazuje literałów tekstowych w komponentach.
- K2 [A] Przełączenie języka w ustawieniach działa bez restartu.
- K3 [A] Domyślny język zgodnie z D10.

**UI-02 Motywy**
- K1 [A] Motyw jasny, ciemny i systemowy (D11).
- K2 [A] Kontrast tekstu interfejsu ≥ 4,5:1 (WCAG AA) w obu motywach (test tokenów kolorów).

**UI-03 Szybki pasek**
- K1 [A] Dodawanie, usuwanie i zmiana kolejności pozycji (przeciąganie), narzędzia z różnych warstw; zgodnie z D8.
- K2 [A] Pasek zapamiętywany w ustawieniach programu (nie w lekcji).

**UI-04 Skróty klawiszowe**
- K1 [A] Domyślny zestaw skrótów widoczny w Ustawienia → Skróty.
- K2 [A] Zmiana dowolnego skrótu, wykrywanie konfliktów, przywracanie domyślnych.
- K3 [A] Skróty wtyczek rejestrowane przez API i edytowalne tak samo.

**UI-05 Tryb standardowy**
- K1 [A] Widoczne: pasek narzędzi aktywnej warstwy, panel warstw, szybki pasek, menu programu; panele zwijane.

**UI-06 Tryb prezentacji**
- K1 [A] Włączenie (skrót D9 / przycisk) ukrywa wszystkie paski; widoczna tylko tablica.
- K2 [A] Narzędzia dostępne z menu kontekstowego (prawy przycisk myszy, długie przytrzymanie, przycisk rysika) i skrótów.
- K3 [A] Esc wychodzi z trybu prezentacji.

**UI-07 Jeden ekran**
- K1 [A] Tablica i narzędzia w jednym oknie; działa w oknie i na pełnym ekranie (F11).

**UI-08 Dwa monitory**
- K1 [A] Przy ≥ 2 monitorach dostępna opcja „Dwa monitory”: okno tablicy pełnoekranowe na wybranym monitorze, okno sterowania (narzędzia, warstwy, podgląd, notatki) na drugim.
- K2 [A] Zmiana w dowolnym oknie pojawia się w drugim w ≤ 50 ms.
- K3 [A] Notatki prowadzącego widoczne tylko w oknie sterowania, zapisywane w lekcji (na stronę / na lekcję w trybie płótna).
- K4 [A] Odłączenie monitora: powrót do jednego okna bez utraty danych. Wybór monitorów zapamiętany.
- K5 [A] Rysowanie zgodnie z P11.
- K6 [R] Test na dwóch fizycznych monitorach (R40).

### Dane i zapis
**DAN-01 Zapis lekcji**
- K1 [A] Plik `.tablica`: zapis i odczyt zachowują warstwy, ich ustawienia, elementy, strony, tła, multimedia, notatki i widok (test porównania modelu przed i po).
- K2 [A] Format ma wersję schematu i migracje; plik z nowszej wersji programu daje komunikat zamiast awarii.
- K3 [A] Zapis atomowy (plik tymczasowy + zamiana); uszkodzony plik daje komunikat zamiast awarii.
- K4 [A] Polecenia Nowa / Otwórz / Zapisz / Zapisz jako / Ostatnie pliki; Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+Shift+S.

**DAN-02 Autozapis**
- K1 [A] Domyślnie co 2 minuty (test z kontrolowanym zegarem); interwał 1–60 min lub wyłączony w ustawieniach.
- K2 [A] Strategia zapisu zgodnie z P5.
- K3 [A] Po nieprawidłowym zamknięciu program przy starcie proponuje przywrócenie ostatniego autozapisu.

**DAN-03 Cofanie i ponawianie**
- K1 [A] Każda operacja zmieniająca dokument jest cofana (Ctrl+Z) i ponawiana (Ctrl+Y, Ctrl+Shift+Z), także przyciskami i gestami (D3).
- K2 [A] Domyślny limit 50; po przekroczeniu usuwana jest najstarsza operacja. Limit zmieniany w ustawieniach (D6).
- K3 [A] Zakres historii (wspólna / na warstwę) zgodnie z P4.
- K4 [A] Każda wtyczka rejestruje operacje wyłącznie przez wspólny mechanizm historii (test wtyczki testowej).

**DAN-04 Eksport PDF**
- K1 [A] Tryb stron: każda strona lekcji to jedna strona PDF w proporcjach strony.
- K2 [A] Tryb płótna: zgodnie z P8.
- K3 [A] Widoczne warstwy w kolejności; wideo jako bieżąca klatka, YouTube jako miniatura z linkiem.
- K4 [A] Kreski, figury i tekst ostre przy powiększeniu 400 % w czytniku PDF (wektorowo lub ≥ 300 dpi).

**DAN-05 Eksport PNG**
- K1 [A] Bieżący widok lub bieżąca strona; skala 1× / 2×; opcja przezroczystego tła.

### Integracje i wymagania niefunkcjonalne
**INT-01 Udostępnianie ekranu**
- K1 [R] Udostępnienie samego okna tablicy w Teams, Zoom, Google Meet (Chrome) i Discord na Windows: odbiorca widzi tablicę, w tym odtwarzane wideo (R41).
- K2 [R] To samo na Linux w Zoom i Google Meet (R42).
- K3 [R] W trybie dwóch monitorów okno tablicy da się udostępnić osobno (R43).
- K4 [R] Brak czarnego obrazu i migotania przy udostępnianiu (R41–R43).

**NF-01 Licencje**
- K1 [A] CI blokuje build, gdy zależność npm lub Cargo ma licencję spoza listy dozwolonych (zgodnych z GPL-3.0).
- K2 [A] Plik LICENSE (GPL-3.0) w repozytorium; okno „O programie” zawiera licencję i listę licencji zależności (generowaną automatycznie).

**NF-02 Wydania**
- K1 [A] Tag `v*` uruchamia workflow tworzący szkic wydania (draft) na GitHubie z instalatorami: Windows (.exe, .msi), Linux (.AppImage, .deb), Android (.apk podpisany kluczem wydania).
- K2 [A] Wydanie zawiera sumy SHA-256 plików.
- K3 [R] Publikacja wydania wymaga ręcznego zatwierdzenia właściciela (R50).

**NF-03 Płynność**
Scenariusz referencyjny: lekcja z 10 000 kresek, 20 obrazami, PDF 50 stron, odtwarzanym wideo 1080p, 3 widocznymi warstwami, na laptopie referencyjnym (P12).
- K1 [R] Przesuwanie i powiększanie: czas klatki p95 ≤ 20 ms (≥ 50 kl./s), pomiar wbudowanym licznikiem (R51).
- K2 [R] Zużycie pamięci ≤ 2 GB (R51).
- K3 [R] Start programu do gotowej tablicy ≤ 3 s; otwarcie lekcji referencyjnej ≤ 5 s (R51).
- K4 [A] Benchmark w CI (renderowanie 10 000 kresek poza ekranem, serializacja lekcji) jako strażnik regresji: pogorszenie > 20 % względem wartości bazowej blokuje build.

**NF-04 Opóźnienie rysowania**
- K1 [A] Czas od zdarzenia wskaźnika do narysowania segmentu w buforze ≤ 4 ms (p95), pomiar instrumentacją.
- K2 [A] Wykorzystanie zdarzeń scalonych (`getCoalescedEvents`) i przewidywanych (`getPredictedEvents`) tam, gdzie WebView je udostępnia, z działającą ścieżką zapasową.
- K3 [R] Kreska nadąża za rysikiem bez widocznego „ciągnięcia” na tablecie Android i tablecie graficznym (R10, R11).

**NF-05 Offline**
- K1 [A] Test e2e z zablokowaną siecią: wszystkie funkcje etapu poza WAR-10 i MM-05 działają.
- K2 [A] Brak żądań sieciowych poza WAR-10 (zgodnie z D13) i MM-05; brak telemetrii; czcionki i zasoby lokalne.

## 3. Architektura i decyzje
### Struktura repozytorium
```
/                          monorepo (pnpm workspaces)
├─ app/                    interfejs rdzenia (Svelte 5 + TypeScript)
├─ src-tauri/              rdzeń w Rust: okna, pliki, zrzuty ekranu, instalacja wtyczek
│  └─ android/             część Kotlin (MediaProjection)
├─ packages/
│  ├─ plugin-api/          publiczny kontrakt API (@tablica/plugin-api), jedyna zależność wtyczek
│  ├─ layer-drawing/       warstwa rysunkowa (wtyczka)
│  ├─ layer-background/    warstwa tła (wtyczka)
│  ├─ layer-media/         warstwa multimediów (wtyczka)
│  └─ test-fixture-layer/  wtyczka testowa
├─ docs/api/               dokumentacja API wtyczek
└─ .github/workflows/      CI i wydania
```

### Główne elementy rdzenia
| Element | Odpowiedzialność |
|---|---|
| `Document` | Model lekcji: tryb (płótno/strony), strony, lista warstw, ustawienia, notatki |
| `Camera` | Wspólna transformacja widoku (przesunięcie, powiększenie) dla wszystkich warstw |
| `LayerHost` | Stos kontenerów DOM; każda warstwa dostaje własny kontener (canvas, WebGL lub DOM) |
| `PluginManager` | Manifesty, zgodność API, leniwe ładowanie (dynamic import), instalacja, katalog |
| `ToolRegistry` | Narzędzia wtyczek, aktywne narzędzie, szybki pasek |
| `InputRouter` | Potok zdarzeń wskaźnika: nacisk, nachylenie, gumka, odrzucanie dłoni, gesty |
| `History` | Wspólny mechanizm poleceń (do/undo, scalanie), limit kroków |
| `Serializer` | Plik `.tablica` (ZIP: `manifest.json`, `document.json`, `layers/<id>.json`, `assets/`), migracje |
| `I18n`, `Theme`, `Settings`, `Shortcuts` | Tłumaczenia, motywy, ustawienia programu, skróty |
| `WindowManager` (Rust) | Okna tablicy/sterowania/mini-paska, monitory, przezroczystość, przepuszczanie kliknięć |
| `Capture` (Rust/Kotlin) | Zrzuty ekranu (Windows, Linux, Android) |

### Decyzje do zapisania jako ADR
| ADR | Temat | Rekomendacja | Alternatywy |
|---|---|---|---|
| **ADR-006** (OTWARTA) | Framework UI | **Svelte 5**: kompilowany, mały narzut w czasie działania i niski rozmiar paczki, prosta reaktywność. API wtyczek jest **niezależne od frameworka**: wtyczka dostaje element DOM do zamontowania panelu, więc autor warstwy może użyć czegokolwiek. | React (większy ekosystem, ale cięższy runtime i ryzyko przecieku zależności Reacta do API wtyczek); Vue |
| **ADR-007** | Kompozycja warstw i renderowanie | Warstwy jako **stos kontenerów DOM ze wspólną kamerą**. Warstwa rysunkowa: Canvas 2D z kontekstem `desynchronized` (niskie opóźnienie) + biblioteka perfect-freehand (MIT) do obrysu kresek z naciskiem; bufory dla kresek zakończonych. Multimedia jako elementy DOM (`<video>`, `<iframe>`, canvas PDF.js). WebGL (PixiJS) tylko jeśli pomiary NF-03 to wykażą. | Jeden wspólny canvas WebGL (trudna integracja wideo, iframe YouTube i PDF, słabsza izolacja warstw); Konva |
| **ADR-008** | Format i ładowanie wtyczek | Pakiet `.tablica-warstwa` (ZIP): `manifest.json` (id, wersja, apiVersion, uprawnienia, tłumaczenia), moduł ESM. Ładowanie przez `import()` z katalogu danych aplikacji przez protokół zasobów Tauri. Wtyczki działają w tym samym kontekście JS (wydajność rysowania), dostęp do dokumentu tylko przez API. Katalog online z sumami SHA-256; ostrzeżenie przy instalacji z pliku. | Piaskownica iframe (bezpieczniej, ale opóźnienia przy rysowaniu i trudna wspólna kamera); Web Workers (brak dostępu do DOM) |
| **ADR-009** | Model dokumentu, historia, format `.tablica` | ZIP z JSON-em z wersją schematu i osadzonymi zasobami; każda wtyczka serializuje swoje dane z własną wersją schematu i migracjami; wspólna historia poleceń (wzorzec Command). Biblioteka ZIP: fflate (MIT). | SQLite w pliku (cięższe, gorsze dla przenośności); osobne pliki w katalogu (łatwo zgubić zasoby) |
| **ADR-010** | Funkcje systemowe | Rust: wiele okien Tauri, `set_ignore_cursor_events` dla przepuszczania kliknięć + **osobne okno mini-paska** (zawsze klikalne); zrzuty ekranu biblioteką xcap (Apache-2.0); Linux/Wayland przez xdg-desktop-portal; Android: wtyczka Kotlin z MediaProjection. Szczegóły po prototypach z kroku 1.1. | Zrzuty przez API przeglądarki `getDisplayMedia` (pokazuje systemowy wybór okna przy każdym zrzucie, słabsze UX) |
| **ADR-011** | Narzędzia i CI | pnpm workspaces, Vitest, Playwright, ESLint + eslint-plugin-boundaries, Prettier, svelte-check, clippy, rustfmt, cargo-deny, license-checker; GitHub Actions + tauri-action. | npm/yarn; Jest; Cypress |
| **ADR-012** | Biblioteki multimediów i eksportu | PDF.js (Apache-2.0) do wyświetlania PDF, pdf-lib (MIT) do eksportu PDF, YouTube IFrame API, natywne `<video>`/`<audio>`. | pdfium (cięższe, natywne); jsPDF |

Wszystkie wymienione biblioteki mają licencje zgodne z GPL-3.0 (NF-01). Każda nowa zależność przechodzi automatyczną kontrolę licencji.

### Wpływ na API wtyczek (v1)
API obejmuje: rejestrację warstwy (typ, manifest, cykl życia `mount/unmount`), kontener renderowania i dostęp do kamery, narzędzia i ich ustawienia, panele (element DOM), skróty, tłumaczenia, polecenia historii, serializację z wersją schematu i migracjami, dostęp do zasobów lekcji (osadzone pliki), zdarzenia wejścia z potoku `InputRouter`, eksport (rysowanie do kontekstu eksportu PDF/PNG). Zmiany niekompatybilne po kroku 1.2 wymagają ADR.

## 4. Kroki
Każdy krok to jedna sesja (`/realizuj-krok`), kończy się działającym programem i zielonymi kontrolami.

### Krok 1.0: Szkielet projektu i CI
- **Cel:** pusty, uruchamialny program na trzech platformach z pełną infrastrukturą jakości.
- **ID:** PLAT-01–03 (K1), NF-01 (K1, K2 bez listy w „O programie”), UI-01 i UI-02 (infrastruktura).
- **Zakres prac:** T1–T6; okno z pustą tablicą i przełącznikiem języka/motywu; LICENSE.
- **Testy:** test dymny uruchomienia, testy i18n (parytet kluczy), test kontroli licencji (celowo błędna zależność w teście).
- **Warunek ukończenia:** CI zielone, artefakty Windows/Linux/Android budują się.

### Krok 1.1: Prototypy ryzyk technicznych
- **Cel:** sprawdzić przed budową funkcji, co jest wykonalne na każdej platformie; wnioski w ADR-010 i ADR-012.
- **ID:** przygotowanie dla TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04 (bez zmiany statusów).
- **Zakres prac (T7):** minimalne prototypy w osobnym katalogu `spikes/` (nie trafiają do programu):
  1. przezroczyste okno + przepuszczanie kliknięć + mini-pasek (Windows, Linux X11, Linux Wayland),
  2. zrzut fragmentu ekranu (Windows, Linux, Android MediaProjection),
  3. osadzony YouTube w WebView Tauri (3 platformy),
  4. MP4 H.264 w WebKitGTK (Linux) i Android WebView,
  5. nacisk i zdarzenia scalone rysika w WebView2, WebKitGTK i Android WebView; pomiar opóźnienia.
- **Testy:** raport wyników w `docs/etapy/ETAP-1-prototypy.md` (tabela: platforma × funkcja × wynik × ograniczenia).
- **Warunek ukończenia:** raport gotowy, ADR-010 i ADR-012 zaktualizowane. Jeśli wynik wymaga zmiany wymagania, uruchamiamy `/zmiana-wymagan` przed krokiem 1.10.

### Krok 1.2: Rdzeń dokumentu i API wtyczek
- **ID:** WAR-01, WAR-06, WAR-12 (K1–K4 w wersji v1).
- **Zakres prac:** `Document`, `Camera`, `LayerHost`, `PluginManager` (wtyczki wbudowane), pakiet `@tablica/plugin-api`, szkielety wtyczek rysunkowej, tła i multimediów, wtyczka testowa, dokumentacja API (T8, T9), reguła lint granic modułów.
- **Testy:** kolejność renderowania, izolacja (próba zapisu cudzej warstwy), awaria wtyczki, wtyczka testowa wg dokumentacji.

### Krok 1.3: Historia i operacje na warstwach
- **ID:** DAN-03, WAR-02, WAR-03, WAR-04, WAR-05.
- **Zakres prac:** `History` (polecenia, scalanie, limit, ustawienie limitu), panel warstw, przyciski cofnij/ponów, gesty D3.
- **Testy:** limit 50/51, cofanie każdej operacji na warstwach wg D12, blokada dla narzędzi wtyczki testowej.

### Krok 1.4: Wejście i pisanie
- **ID:** WEJ-01–06, RYS-01, RYS-02, NF-04.
- **Zakres prac:** `InputRouter` (nacisk, nachylenie, gumka rysika, odrzucanie dłoni, gesty, mysz), pióro i zakreślacz, wybór koloru i grubości, instrumentacja opóźnienia (T10).
- **Testy:** zdarzenia syntetyczne (pen/touch/mouse), testy obrazu kresek, pomiar ≤ 4 ms.

### Krok 1.5: Zapis i odczyt lekcji
- **ID:** DAN-01, DAN-02.
- **Zakres prac:** `Serializer`, ZIP, migracje, zapis atomowy, autozapis i przywracanie, menu Plik, ostatnie pliki, zachowanie danych nieznanych wtyczek.
- **Testy:** round-trip wszystkich istniejących elementów, uszkodzony plik, plik z nowszej wersji, zegar autozapisu.

### Krok 1.6: Edycja rysunku
- **ID:** RYS-03, RYS-04, RYS-12, RYS-13, RYS-14.
- **Zakres prac:** dwie gumki, zaznaczanie (klik, prostokąt, lasso), transformacje, tekst, wskaźnik laserowy.

### Krok 1.7: Figury, przyrządy i narzędzia matematyczne
- **ID:** RYS-05–RYS-11.
- **Zakres prac:** figury z uchwytami, linijka, dwie ekierki, kątomierz, cyrkiel, przyciąganie kreski do krawędzi, układ współrzędnych, oś liczbowa.

### Krok 1.8: Obszar tablicy i tła
- **ID:** OBS-01, OBS-02, TLO-01, TLO-04–TLO-08.
- **Zakres prac:** tryby płótna i stron, panel miniatur stron, wzory tła (rysowane proceduralnie, skalowane z powiększeniem), własny obraz tła.

### Krok 1.9: Multimedia z plików
- **ID:** MM-01–MM-04, MM-06–MM-08.
- **Zakres prac:** wstawianie (plik, przeciąganie, schowek), osadzanie zasobów, odtwarzacze, PDF.js z ponownym renderowaniem, transformacje i kadrowanie, adnotacje na warstwie rysunkowej.

### Krok 1.10: Funkcje systemowe
- **ID:** TLO-02, TLO-03, MM-05, MM-09.
- **Zakres prac:** okno przezroczyste z trybem przepuszczania i mini-paskiem, zrzuty ekranu (Rust/Kotlin), YouTube, według wniosków z kroku 1.1.

### Krok 1.11: Eksport, język i motywy
- **ID:** DAN-04, DAN-05, UI-01, UI-02.
- **Zakres prac:** eksport PDF/PNG przez API eksportu wtyczek, pełne tłumaczenia PL/EN, motyw systemowy, test kontrastu.

### Krok 1.12: Interfejs pracy i prezentacji
- **ID:** UI-03–UI-08, INT-01.
- **Zakres prac:** szybki pasek, edytor skrótów, tryb prezentacji z menu kontekstowym, pełny ekran, tryb dwóch monitorów z oknem sterowania i notatkami, synchronizacja okien.

### Krok 1.13: Wtyczki zewnętrzne
- **ID:** WAR-07–WAR-11, WAR-12 (dokumentacja końcowa).
- **Zakres prac:** kreator pierwszego uruchomienia, Ustawienia → Warstwy, instalacja z pliku, katalog online z sumami SHA-256, aktualizacje i migracje, pakowanie wtyczki testowej jako `.tablica-warstwa`.

### Krok 1.14: Wydanie i wydajność
- **ID:** NF-02, NF-03, NF-05, domknięcie PLAT-01–03 i NF-01.
- **Zakres prac:** workflow wydań (T11, podpisywanie APK), lekcja referencyjna i benchmarki, optymalizacje wskazane przez pomiary, test offline, „O programie” z licencjami, pełna regresja.
- **Warunek ukończenia:** gotowość do `/weryfikuj-etap 1`.

## 5. Testy ręczne (na urządzeniach)
Szczegółowe procedury audytor przeniesie do raportu weryfikacji.

| Nr | ID | Platforma / urządzenie | Procedura (skrót) | Oczekiwany wynik |
|---|---|---|---|---|
| R01 | PLAT-01 | Windows 10 i 11 | Instalacja z .exe, uruchomienie, odinstalowanie | Bez błędów |
| R02 | PLAT-02 | Linux właściciela | AppImage i .deb: uruchomienie | Bez błędów |
| R03 | PLAT-03 | Tablet Android | Instalacja APK, uruchomienie | Bez błędów |
| R10 | WEJ-01, WEJ-05, RYS-01, NF-04 | Tablet Android + rysik | Pisanie zdania, kreski z różnym naciskiem, gumka rysika | Płynna kreska, nacisk widoczny, brak „ciągnięcia” |
| R11 | WEJ-02, WEJ-05, NF-04 | Tablet graficzny (Win, Lin) | Jak R10 | Jak R10 |
| R12 | WEJ-03, RYS-01 | Ekran dotykowy laptopa | Rysowanie palcem, pinch, przesuwanie dwoma palcami | Gesty nie rysują |
| R13 | WEJ-06 | Tablet Android | Minuta pisania z dłonią na ekranie | 0 przypadkowych kresek |
| R20 | TLO-02 | Windows, Linux | Tło przezroczyste nad przeglądarką, rysowanie | Rysunki nad stroną |
| R21 | TLO-02 | Windows, Linux | Tryb przepuszczania: przewijanie strony, klikanie linków, powrót | Strona reaguje, rysunki widoczne |
| R22 | TLO-02, INT-01 | Windows | Udostępnianie całego ekranu w komunikatorze | Odbiorca widzi rysunki nad programami |
| R23 | TLO-03 | Android | Tło przezroczyste: zgoda, zrzut innej aplikacji, rysowanie | Zrzut jako tło |
| R30 | MM-02 | Win, Lin, And | Odtwarzanie MP4 1080p | Obraz i dźwięk płynne |
| R31 | MM-05 | Win, Lin, And | Film YouTube z linku | Odtwarza się |
| R32 | MM-09 | Windows, Linux | Zrzut fragmentu przeglądarki | Fragment na tablicy |
| R33 | MM-09 | Android | Zrzut fragmentu innej aplikacji | Fragment na tablicy |
| R40 | UI-08 | Laptop + monitor | Tryb dwóch monitorów, rysowanie, notatki, odłączenie monitora | Zgodnie z UI-08 K1–K5 |
| R41 | INT-01 | Windows | Udostępnienie okna tablicy: Teams, Zoom, Meet, Discord (z wideo) | Odbiorca widzi tablicę i wideo, bez czarnego ekranu |
| R42 | INT-01 | Linux | Udostępnienie okna: Zoom, Meet | Jak R41 |
| R43 | INT-01, UI-08 | Windows | Udostępnienie samego okna tablicy w trybie dwóch monitorów | Odbiorca widzi tylko tablicę |
| R50 | NF-02 | GitHub | Przegląd szkicu wydania i publikacja | Wydanie z instalatorami i sumami |
| R51 | NF-03 | Laptop referencyjny | Lekcja referencyjna: licznik klatek, pamięć, czasy startu i otwarcia | Progi NF-03 K1–K3 |
| R52 | wszystkie | Win, Lin, And | Lekcja próbna 15 min z użyciem wszystkich narzędzi etapu | Brak błędów, odczucia właściciela zapisane w raporcie |

## 6. Ryzyka
| Ryzyko | Prawd. | Wpływ | Działanie zapobiegawcze |
|---|---|---|---|
| Wayland ogranicza przezroczyste okna z przepuszczaniem kliknięć, pozycjonowanie okien na monitorach i zrzuty ekranu | Wysokie | Wysoki | Prototyp w kroku 1.1; xdg-desktop-portal; ewentualne ograniczenie opisane przez `/zmiana-wymagan` |
| YouTube w WebView Tauri odmawia odtwarzania (nagłówek Referer / pochodzenie `tauri://`) | Średnie | Średni | Prototyp 1.1; youtube-nocookie, właściwa polityka Referer lub lokalne pochodzenie http |
| Brak kodeka H.264 w WebKitGTK bez wtyczek GStreamer | Średnie | Średni | Zależności pakietu .deb (gst-libav), dołączenie do AppImage, komunikat dla użytkownika |
| Różnice WebView (WebView2 / WebKitGTK / Android WebView) w Pointer Events, `getCoalescedEvents`, `desynchronized` | Wysokie | Średni | Prototyp 1.1, ścieżki zapasowe, testy ręczne na każdej platformie |
| Nacisk tabletu graficznego nieprzekazywany przez WebKitGTK | Średnie | Wysoki | Prototyp 1.1; w razie potrzeby odczyt nacisku po stronie Rust |
| Android: opóźnienie rysika i wydajność WebView na tablecie | Średnie | Wysoki | Pomiary w 1.1 i 1.4, optymalizacja renderowania |
| Duży zakres etapu (73 ID, 15 kroków) | Wysokie | Średni | Małe kroki, weryfikacja kroków w trakcie (`/weryfikuj-etap 1 krok M`), możliwe wydania testowe `v0.0.x` |
| Duże pliki lekcji z osadzonym wideo | Średnie | Niski | Decyzja P10; strumieniowy zapis ZIP |
| Wtyczki z pliku mają pełny dostęp do kontekstu JS | Niskie | Średni | Ostrzeżenie (P14), sumy SHA-256 w katalogu, dostęp do dokumentu tylko przez API |
| Zmiany w Tauri 2 i zależnościach | Niskie | Średni | Przypięte wersje, lockfile, aktualizacje świadomie, z testami |

## 7. Pytania do właściciela
### Pytania otwarte
| Nr | Pytanie | Rekomendacja | Odpowiedź |
|---|---|---|---|
| P1 | WAR-07 mówi o wyborze warstw „przy instalacji”. Czy wystarczy kreator przy pierwszym uruchomieniu (na Androidzie instalator nie ma opcji)? | Tak, kreator przy pierwszym uruchomieniu na wszystkich platformach | Przyjęto rekomendację |
| P2 | Czy warstwy rysunkowa i tło są obowiązkowe (nie da się ich odinstalować)? | Tak | Przyjęto rekomendację |
| P3 | Czy lekcja może mieć kilka warstw tego samego typu (np. dwie rysunkowe: pod multimediami i nad nimi)? | Tak, dowolna liczba instancji każdego typu | Przyjęto rekomendację |
| P4 | Cofanie: jedna wspólna historia wszystkich warstw w kolejności chronologicznej, czy osobna dla każdej warstwy? | Wspólna, chronologiczna | Przyjęto rekomendację |
| P5 | Autozapis: nadpisuje plik lekcji czy zapisuje osobną kopię zapasową? | Osobna kopia w katalogu odzyskiwania; plik lekcji zmienia się tylko przy „Zapisz” | Przyjęto rekomendację |
| P6 | Czy istniejącą lekcję można przełączyć między trybem płótna i stron? | Nie w etapie 1; tryb wybierany przy tworzeniu | Przyjęto rekomendację |
| P7 | Format stron w trybie stron? | 16:9 (zgodny z udostępnianiem ekranu), do wyboru także A4 poziomo i pionowo | Przyjęto rekomendację |
| P8 | Eksport PDF w trybie płótna: jedna duża strona z całą zawartością czy podział na kartki A4? | Jedna strona obejmująca całą zawartość | Przyjęto rekomendację |
| P9 | Adnotacje na zatrzymanym wideo: po wznowieniu zostają na ekranie czy znikają (i wracają na tej klatce)? | Zostają (prostsze, przewidywalne) | Przyjęto rekomendację |
| P10 | Wideo osadzać w pliku lekcji (przenośność, duży plik) czy linkować do pliku na dysku? | Osadzać; plik > 200 MB pyta o wybór | Przyjęto rekomendację |
| P11 | Tryb dwóch monitorów: gdzie rysujesz? Na tablicy (drugi monitor), na podglądzie w oknie sterowania, czy na obu? | Na obu | Przyjęto rekomendację |
| P12 | Sprzęt testowy: model laptopa (sprzęt referencyjny NF-03), dystrybucja Linuksa i sesja (X11 czy Wayland), tablet z Androidem i wersja systemu, model tabletu graficznego. Minimalna wersja Androida? | Android 10 lub nowszy | Przyjęto: Android 10+. Laptop referencyjny (odczyt z systemu 2026-11-01): Dell Inspiron 15 3535, AMD Ryzen 5 7530U (6 rdzeni / 12 wątków), 16 GB RAM, AMD Radeon (zintegrowana), ekran 1920×1080 120 Hz bez obsługi dotyku, NVMe 512 GB, Windows 11 Home 25H2 (build 26200). **Do podania przez właściciela:** dystrybucja Linuksa i sesja (X11/Wayland), tablet z Androidem (model, wersja), tablet graficzny (model), urządzenie z ekranem dotykowym do R12 |
| P13 | Nazwa i właściciel repozytorium GitHub (adres katalogu warstw i wydań)? Klucz podpisu APK utworzysz według instrukcji w kroku 1.14? | `ArturWnuk/tablica` | Przyjęto: `ArturMWnuk/tablica` (poprawka 2026-11-01: faktyczna nazwa konta GitHub; identyfikator aplikacji `io.github.arturmwnuk.tablica`); klucz APK właściciel tworzy w kroku 1.14 |
| P14 | Instalacja warstwy z pliku: wystarczy ostrzeżenie, czy blokować pakiety spoza katalogu? | Ostrzeżenie | Przyjęto rekomendację |

### Tabela D: parametry domyślne (zatwierdzone 2026-11-01)
| Nr | Dotyczy | Propozycja |
|---|---|---|
| D1 | RYS-12 | Ślad lasera zanika płynnie po 2 s |
| D2 | WEJ-05 | Nachylenie rysika > 45° poszerza kreskę pióra do 1,5× (efekt ołówka); zakreślacz ignoruje nachylenie |
| D3 | DAN-03, WEJ-03 | Gesty: stuknięcie dwoma palcami = cofnij, trzema = ponów |
| D4 | WEJ-03, WEJ-06, WEJ-02 | Po pierwszym użyciu rysika palec nie rysuje (tylko gesty) do końca sesji; przełącznik w ustawieniach. Przycisk rysika: pierwszy = menu kontekstowe, drugi = gumka |
| D5 | OBS-01 | Powiększenie 10–1000 % |
| D6 | DAN-03 | Limit cofania ustawiany w zakresie 10–500 |
| D7 | DAN-02 | Interwał autozapisu 1–60 min lub wyłączony |
| D8 | UI-03 | Szybki pasek: do 12 pozycji; pozycja = narzędzie z ustawieniami (np. „czerwone pióro 3 px”) |
| D9 | UI-06, TLO-02 | Skróty: F5 tryb prezentacji, Esc wyjście, F11 pełny ekran, Ctrl+Shift+Spacja przełączanie rysowanie/przepuszczanie |
| D10 | UI-01 | Domyślny język = język systemu (polski → PL, inne → EN) |
| D11 | UI-02 | Motywy: jasny, ciemny, systemowy; domyślnie systemowy |
| D12 | WAR-02–05, DAN-03 | W historii cofania: kolejność i przezroczystość warstw tak; widoczność i blokada nie (to ustawienia widoku) |
| D13 | WAR-10, WAR-11, NF-05 | Sprawdzanie aktualizacji warstw raz na dobę przy starcie, wyłączalne w ustawieniach |
| D14 | RYS-06–09, TLO-04 | 1 cm na tablicy = 37,8 px przy powiększeniu 100 % (96 dpi); domyślne oczko kratki 5 mm |
| D15 | RYS-11 | Oś liczbowa: punkty i przedziały z końcami otwartymi (puste kółko) i zamkniętymi (pełne kółko) |
| D16 | OBS-02, TLO-01 | Strony: dodawanie, usuwanie, duplikowanie i zmiana kolejności w panelu miniatur; tło ustawiane dla całej lekcji z możliwością zmiany na pojedynczej stronie |
| D17 | TLO-03, MM-09 | Android: po zgodzie Tablica przechodzi w tło, pojawia się pływający przycisk „Zrzut”; dotknięcie wykonuje zrzut i wraca do Tablicy (dla MM-09 z kadrowaniem) |
