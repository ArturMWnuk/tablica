# Rejestr decyzji architektonicznych (ADR)

> Każda istotna decyzja techniczna ma wpis. Decyzji nie usuwa się. Zmienioną decyzję oznacza się jako ZASTĄPIONA przez nowy ADR.
> Statusy: PROPONOWANA, PRZYJĘTA, ZASTĄPIONA (przez ADR-NNN), OTWARTA (do rozstrzygnięcia w planie etapu).

## Szablon wpisu
```
## ADR-NNN: <tytuł>
- Status: PROPONOWANA | PRZYJĘTA | ZASTĄPIONA przez ADR-NNN | OTWARTA
- Data: RRRR-MM-DD
- Dotyczy wymagań: <ID>
### Kontekst
### Decyzja
### Rozważane alternatywy
### Konsekwencje
```

---

## ADR-001: Stos technologiczny Tauri 2 + TypeScript
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: PLAT-01–03, WEJ-01–06, WAR-08–10
### Kontekst
Program ma działać na Windows, Linux i Android, z jedną bazą kodu. Warstwy muszą być instalowane i aktualizowane osobno, bez reinstalacji programu. Planowane warstwy (chemia, schematy, wideo) wymagają bogatych bibliotek.
### Decyzja
Tauri 2: rdzeń w Rust, interfejs w TypeScript w systemowym WebView. Rysowanie przez Canvas 2D / WebGL, wejście przez Pointer Events.
### Rozważane alternatywy
- **Flutter:** dobra obsługa rysika, ale kod kompilowany na stałe, a Android ogranicza dynamiczne ładowanie kodu natywnego. Wtyczki ładowane w czasie działania są bardzo trudne.
- **Kotlin Multiplatform / Compose:** mniej dojrzałe wsparcie Linuksa i Windows.
- **Electron:** brak Androida, duży rozmiar.
### Konsekwencje
- Wtyczki jako pakiety JS ładowane dynamicznie (ADR-002).
- Dostęp do gotowych bibliotek webowych (np. Ketcher, PDF.js).
- Zachowanie WebView różni się między platformami, więc testy ręczne na każdej platformie są obowiązkowe.
- Funkcje systemowe (przezroczyste okno, przepuszczanie kliknięć, zrzuty ekranu, dwa monitory) realizowane po stronie Rust. Wykonalność na Linuksie (X11/Wayland) do sprawdzenia w planie etapu 1.

## ADR-002: Warstwy jako wtyczki ładowane w czasie działania
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: WAR-01–12
### Kontekst
Użytkownik wybiera instalowane warstwy, a nowe warstwy dochodzą z pliku lub z katalogu online.
### Decyzja
Każda warstwa, także rysunkowa i tło, jest wtyczką z manifestem (identyfikator, wersja, wymagana wersja API, uprawnienia, tłumaczenia). Rdzeń udostępnia wersjonowane API wtyczek i nie zna konkretnych warstw.
### Konsekwencje
- API wtyczek to kontrakt. Zmiany niekompatybilne wymagają nowego ADR i podniesienia wersji API.
- Szczegóły formatu pakietu, manifestu i izolacji wtyczek ustala plan etapu 1 (nowy ADR).

## ADR-003: Licencja GPL-3.0
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: NF-01
### Decyzja
Program i oficjalne warstwy na licencji GPL-3.0.
### Konsekwencje
Każda zależność musi mieć licencję zgodną z GPL-3.0 (np. MIT, BSD, Apache-2.0, LGPL, GPL-3.0). Sprawdzane przy dodawaniu zależności i przez audytora w każdym etapie.

## ADR-004: Brak współpracy online, dane lokalne
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: INT-01, NF-05, WYK-02, WYK-03, WYK-05
### Decyzja
Uczniowie widzą tablicę przez udostępnianie ekranu w zewnętrznym komunikatorze. Brak serwerów, kont i synchronizacji. Połączenie z siecią tylko dla katalogu warstw i YouTube.

## ADR-005: Języki w projekcie
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: UI-01
### Decyzja
- Dokumentacja projektu i komunikacja: polski.
- Kod, identyfikatory i komentarze w kodzie: angielski (ułatwia współpracę przy projekcie otwartoźródłowym).
- Interfejs: polski i angielski przez pliki tłumaczeń.

## ADR-006: Framework interfejsu — Svelte 5
- Status: PRZYJĘTA
- Data: 2026-11-01 (plan etapu 1)
- Dotyczy wymagań: UI-01–08, WAR-12
### Kontekst
Wybór wpływa na API wtyczek, bo wtyczki mogą dostarczać własne panele interfejsu.
### Decyzja
Interfejs rdzenia w Svelte 5 + TypeScript (strict). API wtyczek jest niezależne od frameworka: wtyczka dostaje element DOM, w którym montuje swój panel.
### Rozważane alternatywy
- **React:** większy ekosystem, ale cięższy runtime i ryzyko, że zależność od Reacta przecieknie do API wtyczek.
- **Vue:** brak przewagi nad Svelte w tym zastosowaniu.
### Konsekwencje
Mały rozmiar paczki i niski narzut w czasie działania. Autorzy warstw mogą używać dowolnej technologii UI.

## ADR-007: Kompozycja warstw i renderowanie
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: WAR-01–06, RYS-01–14, MM-01–08, NF-03, NF-04
### Decyzja
Warstwy to stos kontenerów DOM ze wspólną kamerą (przesunięcie, powiększenie). Każda wtyczka wybiera sposób renderowania we własnym kontenerze. Warstwa rysunkowa: Canvas 2D z kontekstem `desynchronized` i biblioteką perfect-freehand (MIT), bufory dla zakończonych kresek. Multimedia jako elementy DOM (`<video>`, `<audio>`, `<iframe>`, canvas PDF.js). WebGL (PixiJS) tylko wtedy, gdy pomiary NF-03 wykażą potrzebę.
### Rozważane alternatywy
- **Jeden wspólny canvas WebGL:** trudna integracja wideo, YouTube i PDF, słabsza izolacja warstw.
- **Konva:** dodatkowa warstwa abstrakcji bez rozwiązania problemu multimediów.
### Konsekwencje
Izolacja, widoczność i krycie warstw realizowane naturalnie przez DOM. Konieczna staranna synchronizacja transformacji kamery między kontenerami.

## ADR-008: Format i ładowanie wtyczek
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: WAR-07–12
### Decyzja
Pakiet `.tablica-warstwa` (ZIP): `manifest.json` (id, wersja SemVer, apiVersion, uprawnienia, tłumaczenia) i moduł ESM. Ładowanie przez `import()` z katalogu danych aplikacji przez protokół zasobów Tauri. Wtyczki działają w tym samym kontekście JS, a dostęp do dokumentu mają wyłącznie przez API. Katalog online z sumami SHA-256; instalacja z pliku z ostrzeżeniem.
### Rozważane alternatywy
- **Piaskownica iframe:** bezpieczniejsza, ale opóźnienia przy rysowaniu i trudna wspólna kamera.
- **Web Workers:** brak dostępu do DOM.
### Konsekwencje
Wysoka wydajność kosztem pełnego zaufania do zainstalowanych wtyczek; ryzyko ograniczone sumami kontrolnymi i ostrzeżeniami.

## ADR-009: Model dokumentu, historia i format pliku `.tablica`
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: DAN-01–03, WAR-06, WAR-11
### Decyzja
Plik `.tablica` to ZIP (biblioteka fflate, MIT): `manifest.json`, `document.json` z wersją schematu, `layers/<id>.json` serializowane przez wtyczki (każda z własną wersją schematu i migracjami), `assets/` z osadzonymi zasobami. Zapis atomowy. Jedna wspólna, chronologiczna historia poleceń (wzorzec Command) dla wszystkich warstw. Autozapis do osobnej kopii w katalogu odzyskiwania. Dane wtyczek niezainstalowanych są zachowywane bez zmian.
### Rozważane alternatywy
- **SQLite w pliku:** cięższe, gorsza przenośność.
- **Katalog z plikami:** łatwo zgubić zasoby.

## ADR-010: Funkcje systemowe
- Status: PRZYJĘTA (szczegóły do uzupełnienia po prototypach z kroku 1.1)
- Data: 2026-11-01
- Dotyczy wymagań: TLO-02, TLO-03, MM-09, UI-08, INT-01
### Decyzja
Po stronie Rust: wiele okien Tauri (tablica, sterowanie, mini-pasek), `set_ignore_cursor_events` dla trybu przepuszczania i osobne, zawsze klikalne okno mini-paska; zrzuty ekranu biblioteką xcap (Apache-2.0), na Wayland przez xdg-desktop-portal. Android: wtyczka Kotlin z MediaProjection.
### Rozważane alternatywy
- **`getDisplayMedia`:** systemowy wybór okna przy każdym zrzucie, słabsze UX.
### Konsekwencje
Możliwe ograniczenia na Wayland. Wynik prototypu może wymagać zmiany wymagań przez `/zmiana-wymagan`.

## ADR-011: Narzędzia i CI
- Status: PRZYJĘTA
- Data: 2026-11-01
- Dotyczy wymagań: PLAT-01–03, NF-01, NF-02, WAR-12
### Decyzja
Monorepo pnpm workspaces; Vitest, Playwright, cargo test, tauri-driver; ESLint z eslint-plugin-boundaries (granice API wtyczek), Prettier, svelte-check, clippy, rustfmt; kontrola licencji: license-checker i cargo-deny; GitHub Actions + tauri-action.

## ADR-012: Biblioteki multimediów i eksportu
- Status: PRZYJĘTA (do potwierdzenia po prototypach z kroku 1.1)
- Data: 2026-11-01
- Dotyczy wymagań: MM-01–09, DAN-04, DAN-05
### Decyzja
PDF.js (Apache-2.0) do wyświetlania PDF, pdf-lib (MIT) do eksportu PDF, YouTube IFrame API, natywne `<video>` i `<audio>`.
### Rozważane alternatywy
- **pdfium:** cięższe, natywne.
- **jsPDF:** słabsza kontrola nad strukturą dokumentu.
