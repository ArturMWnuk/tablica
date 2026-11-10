# Prototypy kroku 1.1 (spike)

Narzędzie deweloperskie z kroku 1.1 planu etapu 1 (`docs/etapy/ETAP-1-plan.md`). **Nie jest częścią programu Tablica**: ma osobny crate, osobny `Cargo.lock` i nie trafia do instalatorów. Wyniki opisuje `docs/etapy/ETAP-1-prototypy.md`.

## Co sprawdza

| Prototyp                                                                                     | Strona                                        | Wymaganie     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------- |
| Przezroczyste okno, tryb przepuszczania, mini-pasek w osobnym oknie, skrót Ctrl+Shift+Spacja | `overlay.html`, `minibar.html`, `target.html` | TLO-02        |
| Zrzut ekranu (xcap), zaznaczanie fragmentu na zamrożonym obrazie, Esc                        | `select.html`                                 | MM-09         |
| YouTube IFrame API (youtube.com i youtube-nocookie.com)                                      | `youtube.html`                                | MM-05         |
| MP4 H.264 w `<video>` (plik `ui/media/sample-h264.mp4` i nagranie MediaRecorder)             | `video.html`                                  | MM-02         |
| Nacisk rysika, zdarzenia scalone i przewidywane, opóźnienie zdarzenie → segment              | `pen.html`                                    | WEJ-02, NF-04 |

## Uruchomienie

```bash
cargo run --manifest-path spikes/platform/Cargo.toml
```

Okno główne ma przyciski do każdego prototypu (sprawdzenie ręczne).

```bash
cargo run --manifest-path spikes/platform/Cargo.toml -- --auto
```

Przebieg automatyczny zapisuje `results/auto-<system>.json`. **Na Windows przejmuje mysz i klawiaturę na około 2 minuty** (SendInput i syntetyczne pióro `InjectSyntheticPointerInput`). Na innych systemach wykonuje tylko sprawdzenia bez wstrzykiwania wejścia; resztę trzeba sprawdzić ręcznie z okna głównego.

Kontrola licencji zależności: `cargo deny --manifest-path spikes/platform/Cargo.toml check licenses`.
