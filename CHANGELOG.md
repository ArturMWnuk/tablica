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
