# Historia zmian

Format zgodny z [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/), wersjonowanie zgodne z [SemVer](https://semver.org/lang/pl/).
Każdy wpis zawiera identyfikatory wymagań z `docs/DOKUMENTACJA.md`.

## [Niewydane]
### Dodano
- Dokumentacja programu (wersja 1.1) i workflow projektu.
- Szkielet programu: Tauri 2 + Svelte 5 + TypeScript, okno z pustą tablicą (PLAT-01, PLAT-02, PLAT-03).
- Przełącznik języka interfejsu (polski / angielski) z językiem domyślnym według systemu; teksty z plików tłumaczeń (UI-01, infrastruktura).
- Przełącznik motywu (jasny / ciemny / systemowy) oparty na tokenach kolorów (UI-02, infrastruktura).
- Licencja GPL-3.0 i automatyczna kontrola licencji zależności npm i Cargo (NF-01).
- CI GitHub Actions: kontrole jakości, test dymny aplikacji, instalatory Windows (NSIS, MSI), Linux (AppImage, deb) i APK Androida (PLAT-01, PLAT-02, PLAT-03).
- System warstw: lekcja ma uporządkowaną listę warstw wyświetlanych jedna na drugiej ze wspólnym przesuwaniem i powiększaniem; nowa lekcja zawiera warstwy tła, multimediów i rysunkową (na razie bez narzędzi) (WAR-01).
- Izolacja warstw: wtyczka zmienia wyłącznie własne warstwy, a narzędzie działa tylko na aktywnej warstwie swojego typu; błąd we wtyczce oznacza warstwę jako uszkodzoną, pozostałe działają, a dane warstwy są zachowane (WAR-06).
- API wtyczek warstw w wersji 1.0 (`@tablica/plugin-api`) z dokumentacją w `docs/api/`, wtyczką testową i regułą lint granic modułów; wtyczka dla niezgodnej wersji API nie jest ładowana, a użytkownik dostaje komunikat (WAR-12).
- Cofanie i ponawianie wszystkich zmian dokumentu we wspólnej, chronologicznej historii: Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z, przyciski oraz stuknięcie dwoma (cofnij) i trzema palcami (ponów); domyślnie 50 kroków, liczba ustawiana w zakresie 10–500 (DAN-03).
- Panel warstw: ukrywanie i pokazywanie (WAR-02), blokowanie przed edycją (WAR-03), zmiana kolejności przyciskami i przeciąganiem (WAR-04), suwak krycia 0–100 % co 5 % (WAR-05); kolejność i krycie można cofać, widoczność i blokada to ustawienia widoku (D12).
- Dodawanie warstwy wybranego typu (nad aktywną) i usuwanie warstwy w panelu warstw; obie operacje można cofnąć, a usunięta warstwa wraca z danymi; zablokowanej i ostatniej warstwy nie da się usunąć (DAN-03, WAR-01, WAR-03).
- Ukryta warstwa nie przyjmuje poleceń wtyczki także ze skrótów i paneli (WAR-02); cofanie i ponawianie zmian zablokowanej lub ukrytej warstwy jest wstrzymane z komunikatem (WAR-03, DAN-03); przesunięcie suwaka krycia z powrotem do wartości początkowej nie zostawia kroku cofania (DAN-03).
- Pióro z naciskiem (grubość zależy od nacisku i nachylenia rysika, wygładzana kreska) oraz zakreślacz (krycie 40 %, stała grubość, nie zasłania tego, co pod nim); panel z paletą 13 kolorów, dowolnym kolorem i grubością 1–50 px; każda kreska to jeden krok cofania (RYS-01, RYS-02, WEJ-05).
- Obsługa wejścia: rysik, ekran dotykowy, mysz i klawiatura. Jeden palec rysuje, dopóki nie użyto rysika (przełącznik w ustawieniach); dwa palce przesuwają i powiększają widok; kółko przewija, Ctrl + kółko powiększa, środkowy przycisk lub Spacja z przeciąganiem przesuwa widok; dotyk dłoni przy rysiku jest ignorowany (WEJ-01, WEJ-02, WEJ-03, WEJ-04, WEJ-06).
- Rysowanie bez opóźnienia: zdarzenia scalone i przewidywane, przyrostowe rysowanie bieżącej kreski i wbudowany pomiar opóźnienia (p95 ≤ 4 ms) (NF-04).
- Pasek narzędzi i panele ustawień narzędzi z wtyczek (RYS-01, WEJ-04).
- API wtyczek 1.1 (zgodne wstecz): nachylenie rysika i przewidywane pozycje w zdarzeniach narzędzi (WAR-12).
- Prototypy ryzyk technicznych kroku 1.1 w `spikes/platform/` (poza programem) i raport `docs/etapy/ETAP-1-prototypy.md`: część Windows (przygotowanie TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04).

### Poprawiono
- Kontrola licencji npm obejmuje zależności wszystkich pakietów programu, także wtyczek warstw (NF-01).
- Awaria wtyczki zachowuje najnowsze dane także warstw usuniętych, które można przywrócić cofnięciem; po cofnięciu usunięcia warstwa jest oznaczona jako uszkodzona i zapisuje się z tymi danymi (DAN-03).
- Warstwa dodana i cofnięta, zanim wtyczka zdążyła się wczytać, po ponowieniu nie zostaje w stanie „Wczytywanie”, także gdy wczytanie się nie powiedzie (DAN-03).
- Komunikat o wstrzymanym cofaniu na zablokowanej lub ukrytej warstwie podaje nazwę warstwy tak jak panel warstw, z numerem przy kilku warstwach jednego typu (WAR-03).
