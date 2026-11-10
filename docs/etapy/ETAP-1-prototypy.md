# Etap 1: raport prototypów ryzyk technicznych (krok 1.1)

| Pole | Wartość |
|---|---|
| Krok | 1.1 (T7) |
| Zakres raportu | **część Windows** (decyzja właściciela z 2026-11-10: najpierw Windows, Linux i Android po uzupełnieniu P12) |
| Kod prototypów | `spikes/platform/` (osobny crate, poza programem) |
| Wyniki surowe | `spikes/platform/results/auto-windows.json` |
| Data | 2026-11-10 |

## Środowisko pomiaru
- Laptop referencyjny (P12): Dell Inspiron 15 3535, Ryzen 5 7530U, ekran 1920×1080 120 Hz, skalowanie 100%.
- Windows 11 Home, kompilacja 26200.9711; WebView2 157.0.4341.42; Tauri 2.12.5.
- Przebieg automatyczny `cargo run -- --auto`: prawdziwe zdarzenia systemowe (SendInput dla myszy i klawiatury, `InjectSyntheticPointerInput` dla pióra Windows Ink), zrzuty ekranu xcap do sprawdzania pikseli. Wynik: **14 z 14 sprawdzeń zaliczonych**.

## Wyniki: platforma × funkcja
Legenda: ✅ działa, ⚠️ działa z ograniczeniem, ❌ nie działa, ⏳ nie sprawdzono (czeka na sprzęt z P12).

| # | Funkcja | Windows (WebView2) | Linux X11 (WebKitGTK) | Linux Wayland (WebKitGTK) | Android (WebView) |
|---|---|---|---|---|---|
| 1 | Przezroczyste okno nad pulpitem (TLO-02) | ✅ | ⏳ | ⏳ | nie dotyczy (TLO-03) |
| 1 | Tryb przepuszczania: klik, kółko, klawiatura (TLO-02) | ✅ | ⏳ | ⏳ | nie dotyczy |
| 1 | Mini-pasek klikalny w trybie przepuszczania (TLO-02) | ✅ | ⏳ | ⏳ | nie dotyczy |
| 1 | Globalny skrót Ctrl+Shift+Spacja (D9) | ✅ | ⏳ | ⏳ | nie dotyczy |
| 2 | Zrzut ekranu i wycięcie fragmentu (MM-09) | ✅ | ⏳ | ⏳ | ⏳ (MediaProjection, TLO-03) |
| 3 | YouTube IFrame API (MM-05) | ✅ | ⏳ | ⏳ | ⏳ |
| 4 | MP4 H.264 (MM-02) | ✅ | ⏳ | ⏳ | ⏳ |
| 5 | Nacisk pióra (WEJ-02) | ⚠️ syntetyczne pióro | ⏳ | ⏳ | ⏳ |
| 5 | Zdarzenia scalone i przewidywane (NF-04 K2) | ✅ | ⏳ | ⏳ | ⏳ |
| 5 | Opóźnienie zdarzenie → segment ≤ 4 ms p95 (NF-04 K1) | ✅ | ⏳ | ⏳ | ⏳ |

## Szczegóły (Windows)

### 1. Tło przezroczyste, przepuszczanie, mini-pasek (TLO-02)
- Okno Tauri `transparent(true)`, bez ramki, zawsze na wierzchu. Na zrzucie ekranu przez nakładkę widać program pod spodem (piksel `0,192,0`), a rysunek nakładki jest widoczny (piksel `255,0,0`).
- Tryb rysowania: kliknięcie trafia do nakładki, nie do programu pod spodem.
- Tryb przepuszczania (`set_ignore_cursor_events(true)`): kliknięcie, kółko myszy i klawisz trafiają do programu pod spodem; rysunek pozostaje widoczny. Klawiatura działa, bo kliknięcie aktywuje program pod spodem.
- Mini-pasek jako **osobne okno** (zgodnie z ADR-010) pozostaje klikalny, gdy nakładka przepuszcza zdarzenia; jego przycisk przełącza tryb.
- Globalny skrót Ctrl+Shift+Spacja (D9) przez `tauri-plugin-global-shortcut` przełącza tryb w obie strony, także gdy aktywny jest inny program.
- **Ograniczenie:** przepuszczanie dotyczy całego okna nakładki (nie można rysować i jednocześnie klikać pod spodem). Jest to zgodne z TLO-02, które przewiduje dwa przełączane tryby.
- Ręcznie do sprawdzenia (R20–R22): praca nad prawdziwą przeglądarką i udostępnianie ekranu w komunikatorze. Zrzut xcap (ten sam obraz złożony przez kompozytor) pokazuje rysunki nad programami, co dobrze rokuje dla R22, ale go nie zastępuje.

### 2. Zrzut fragmentu ekranu (MM-09)
- xcap 0.9.10 (Apache-2.0): zrzut monitora 1920×1080 w **około 30 ms**.
- Schowanie okien Tablicy + zrzut: **około 290 ms**, z czego 250 ms to celowe oczekiwanie na usunięcie okien przez kompozytor. Na zrzucie nie ma okien Tablicy.
- Zaznaczanie: pełnoekranowe okno z zamrożonym obrazem, przeciągnięcie myszą zwraca fragment o dokładnym rozmiarze (200×100), Esc anuluje i przywraca okna Tablicy.
- **Do poprawy w kroku 1.10:** okno zaznaczania jest gotowe po około 630 ms, bo cały zrzut jest kodowany do PNG i przesyłany jako data URL. Szybsza ścieżka: przesłanie surowych pikseli albo JPEG przez protokół zasobów.

### 3. YouTube (MM-05)
- YouTube IFrame API z pochodzenia `http://tauri.localhost` odtwarza film (stan `PLAYING`) z obu hostów: `www.youtube.com` i `www.youtube-nocookie.com`. Nie wystąpiły błędy 152/153 (odrzucenie tożsamości klienta).
- Wymaga internetu (wyjątek NF-05). CSP programu będzie musiało dopuścić `https://www.youtube.com` (skrypt API) i host odtwarzacza (ramka).
- Rekomendacja: domyślnie `youtube-nocookie.com` (mniej plików cookie, działa tak samo).

### 4. MP4 H.264 (MM-02)
- `canPlayType`: H.264 Baseline, High i H.264+AAC: `probably`.
- Plik `spikes/platform/ui/media/sample-h264.mp4` (nagrany w WebView2 przez MediaRecorder, 320×240, 2 s) odtwarza się w `<video>`. Ten sam plik posłuży do sprawdzenia WebKitGTK i Android WebView.

### 5. Rysik i opóźnienie (WEJ-02, NF-04)
- Syntetyczne pióro Windows Ink (`InjectSyntheticPointerInput`, `PT_PEN`): w WebView2 `pointerType = "pen"`, nacisk przechodzi w zakresie 0,098–0,977 (wstrzyknięto 100–1000 z 1024).
- `getCoalescedEvents` i `getPredictedEvents` są dostępne; kontekst canvas z `desynchronized: true` jest obsługiwany.
- Opóźnienie od zdarzenia wskaźnika do narysowania segmentu w buforze (metryka NF-04 K1): pióro p50 0,3 ms, **p95 0,7 ms**, maks. 1,2 ms; mysz p50 0,5 ms, **p95 0,7 ms**. Próg 4 ms jest spełniony z dużym zapasem.
- Pomocniczo: od zdarzenia do następnej klatki (`requestAnimationFrame`) p50 około 5 ms, p95 około 9 ms (ekran 120 Hz, czyli klatka co 8,3 ms). To jest ograniczenie odświeżania ekranu, a nie programu.
- **Ograniczenie:** syntetyczne pióro to ścieżka Windows Ink. Prawdziwy tablet graficzny działa tak samo tylko wtedy, gdy jego sterownik ma włączony Windows Ink (np. Wacom: opcja „Use Windows Ink”); sterowniki działające wyłącznie przez Wintab nie przekazują nacisku do WebView2. Do potwierdzenia ręcznie (R11) na tablecie z P12.
- Po zdarzeniach pióra Windows przez chwilę ignoruje mysz (arbitraż pióro/mysz): przebieg automatyczny czeka 1,5 s przed pociągnięciem myszą. Dla programu bez znaczenia.

## Wnioski
1. Architektura z ADR-010 działa na Windows bez zmian: wiele okien Tauri, `set_ignore_cursor_events`, osobne okno mini-paska, xcap. Uzupełnienie: globalny skrót przez `tauri-plugin-global-shortcut` (MIT/Apache-2.0).
2. ADR-012 potwierdzony na Windows: YouTube IFrame API i natywne `<video>` z H.264.
3. Próg NF-04 (≤ 4 ms p95) jest osiągalny w WebView2; zdarzenia scalone i przewidywane są dostępne.
4. Na Windows żaden wynik nie wymaga zmiany wymagań (`/zmiana-wymagan` niepotrzebne).

## Do zrobienia (po uzupełnieniu P12)
- Linux X11 i Wayland: prototypy 1–5 (`cargo run -- --auto` sprawdza część bez wstrzykiwania wejścia; resztę ręcznie z okna głównego). Największe ryzyko: przepuszczanie kliknięć i zrzuty na Wayland (xdg-desktop-portal), nacisk tabletu w WebKitGTK.
- Android: prototyp MediaProjection (wtyczka Kotlin, D17), YouTube, MP4, rysik i opóźnienie na tablecie.
- Tablet graficzny (R11) i ekran dotykowy (R12) na Windows.
- Po tych pomiarach: ADR-010 i ADR-012 do stanu ostatecznego, krok 1.1 do statusu UKOŃCZONY.

## Problemy środowiska wykryte przy okazji (laptop referencyjny)
- W Visual Studio Build Tools 2022 (MSVC 14.44.35207) brakuje `lib\x64\oldnames.lib`; linker Rust nie działa. W tej sesji obejście: pusty `oldnames.lib` w katalogu tymczasowym podany w zmiennej `LIB`. Trwałe rozwiązanie: naprawa instalacji Build Tools (Visual Studio Installer → Napraw).
- W przeglądarce Playwright `chromium-1248` brakuje `icudtl.dat`; 7 testów e2e na Chromium nie startuje (WebKit 7/7 zaliczone). Rozwiązanie: `pnpm exec playwright install chromium --force`.
