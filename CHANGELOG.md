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
- Prototypy ryzyk technicznych kroku 1.1 w `spikes/platform/` (poza programem) i raport `docs/etapy/ETAP-1-prototypy.md`: część Windows (przygotowanie TLO-02, TLO-03, MM-02, MM-05, MM-09, WEJ-02, NF-04).
