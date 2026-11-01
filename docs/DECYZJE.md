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

## ADR-006: Framework interfejsu (Svelte czy React)
- Status: OTWARTA (do rozstrzygnięcia w planie etapu 1)
- Dotyczy wymagań: UI-01–08, WAR-12
### Kontekst
Wybór wpływa na API wtyczek, bo wtyczki mogą dostarczać własne panele interfejsu.
