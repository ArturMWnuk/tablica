# Jak napisać warstwę

Przewodnik dla autorów wtyczek warstw, API w wersji **1.0**. Pełny opis typów: [referencja](referencja/README.md).

Każda warstwa Tablicy, także rysunkowa, tło i multimedia, jest wtyczką. Wtyczka korzysta **wyłącznie** z pakietu `@tablica/plugin-api`. Nie importuje kodu programu ani innych wtyczek.

## 1. Pakiet wtyczki
Wtyczka to dwa pliki:

```
moja-warstwa/
├─ manifest.json     opis wtyczki
└─ src/index.ts      moduł ESM z wtyczką jako eksportem domyślnym
```

### Manifest
```json
{
  "id": "moja-warstwa",
  "version": "1.0.0",
  "apiVersion": "1.0.0",
  "translations": {
    "pl": { "name": "Moja warstwa", "description": "Jedno zdanie o warstwie." },
    "en": { "name": "My layer", "description": "One sentence about the layer." }
  }
}
```

| Pole | Znaczenie |
|---|---|
| `id` | Identyfikator w stylu `kebab-case`, unikalny. Jest jednocześnie typem warstwy i przestrzenią nazw tłumaczeń. |
| `version` | Wersja wtyczki (SemVer), niezależna od wersji programu. |
| `apiVersion` | Wersja API, dla której napisano wtyczkę. Zasady zgodności: [README](README.md). |
| `translations` | Teksty interfejsu po polsku i angielsku. Klucze `name` i `description` są obowiązkowe. |
| `permissions` | Zarezerwowane. W API 1.x puste albo pominięte. |

Poprawność manifestu sprawdzisz w testach funkcją `validateManifest(manifest)`. Pusta lista oznacza poprawny manifest. Program wykonuje tę samą kontrolę przed załadowaniem wtyczki.

## 2. Moduł wtyczki
Moduł eksportuje domyślnie obiekt `LayerPlugin`. Funkcja `defineLayerPlugin` daje podpowiedzi typów.

```ts
import { defineLayerPlugin, type LayerCommand } from '@tablica/plugin-api';

interface Box { id: string; x: number; y: number; size: number }
interface Data { boxes: Box[] }

export default defineLayerPlugin<Data>({
  schemaVersion: 1,
  createData: () => ({ boxes: [] }),
  serialize: (data) => ({ boxes: data.boxes.map((box) => ({ ...box })) }),
  deserialize: (json, schemaVersion) => ({ boxes: readBoxes(json, schemaVersion) }),
  activate(context) {
    // narzędzia, skróty, panele (punkt 6)
  },
  mountLayer(layer) {
    const root = document.createElement('div');
    layer.container.append(root);
    return {
      render() {
        // rysuj z layer.data i layer.camera (punkt 4)
      },
      unmount() {
        root.remove();
      },
    };
  },
});
```

### Cykl życia
1. Program czyta manifest i sprawdza zgodność wersji API. Moduł nie jest jeszcze ładowany.
2. Gdy lekcja pierwszy raz potrzebuje warstwy tego typu, program ładuje moduł i raz wywołuje `activate(context)`.
3. Dla każdej warstwy tego typu w lekcji program tworzy dane (`createData` dla nowej warstwy albo `deserialize` dla zapisanej) i wywołuje `mountLayer(layer)`.
4. Program wywołuje `render()` po zamontowaniu, po każdej zmianie danych warstwy, po zmianie kamery, po zmianie rozmiaru tablicy i po zmianie języka interfejsu.
5. Przy usuwaniu warstwy (lub po błędzie wtyczki) program wywołuje `unmount()` i czyści kontener.

Lekcja może mieć dowolną liczbę warstw jednego typu. Wtyczka nie może trzymać danych warstwy w zmiennych modułu; dane każdej warstwy są w `layer.data`.

## 3. Dane, zapis i migracje
- `createData()` zwraca dane nowej, pustej warstwy.
- `serialize(data)` zwraca JSON zapisywany w pliku lekcji. Nie może zmieniać `data`.
- `deserialize(json, schemaVersion)` odtwarza dane. `schemaVersion` to wersja formatu, w której dane zapisano.
- `schemaVersion` wtyczki to bieżąca wersja formatu. Gdy zmieniasz format, zwiększ ją i obsłuż starsze wersje w `deserialize` (migracja). Przykład: wtyczka testowa (`packages/test-fixture-layer`) w wersji 2 czyta też format z wersji 1.

## 4. Kontener i kamera
Każda warstwa dostaje własny kontener (`layer.container`), który pokrywa całą tablicę. Wtyczka sama wybiera technikę: canvas, SVG albo elementy HTML. Kolejność kontenerów odpowiada kolejności warstw w lekcji.

Wszystkie warstwy dzielą jedną kamerę (`layer.camera`). Punkt tablicy `p` jest wyświetlany w miejscu `p * zoom + (x, y)`:

```ts
const position = layer.camera.worldToScreen({ x: box.x, y: box.y });
const size = box.size * layer.camera.state.zoom;
```

Wtyczka nie zmienia kamery. Przesuwanie i powiększanie obsługuje program, a potem wywołuje `render()` wszystkich warstw.

## 5. Zmiany danych i cofanie
Dane warstwy zmienia się **wyłącznie** przez polecenia. Każde polecenie trafia do wspólnej historii cofania programu.

```ts
function addBox(x: number, y: number): LayerCommand<Data> {
  const box = { id: crypto.randomUUID(), x, y, size: 20 };
  return {
    apply: (data) => { data.boxes.push({ ...box }); },
    revert: (data) => { data.boxes = data.boxes.filter((item) => item.id !== box.id); },
  };
}

layer.execute(addBox(10, 20));
```

`apply` i `revert` muszą być dokładnymi odwrotnościami i zmieniać tylko przekazane dane. Program wywołuje `apply` także przy ponawianiu. Po wykonaniu, cofnięciu i ponowieniu polecenia program sam wywołuje `render()`.

Historia ma limit kroków ustawiany przez użytkownika (domyślnie 50); najstarsze polecenia są z niej usuwane. Cofanie (Ctrl+Z), ponawianie (Ctrl+Y, Ctrl+Shift+Z), przyciski i gesty obsługuje program; wtyczka nie może zająć tych skrótów.

**Ustawienia warstwy należą do programu.** Widoczność, blokadę, krycie i kolejność warstw zmienia użytkownik w panelu warstw. Wtyczka nie musi ich obsługiwać:
- na **zablokowanej** warstwie `execute` niczego nie zmienia i niczego nie zapisuje w historii, a narzędzia nie dostają zdarzeń;
- **ukryta** warstwa nie dostaje zdarzeń narzędzi i program nie wywołuje jej `render()` (wywoła go po ponownym pokazaniu);
- krycie całej warstwy program nakłada na jej kontener.

## 6. Narzędzia, skróty i panele
Rejestruje się je w `activate(context)`.

```ts
activate(context) {
  context.registerTool<Data>({
    id: 'box',
    labelKey: 'tool.box',
    onPointer(event, layer) {
      if (event.phase === 'down') layer.execute(addBox(event.world.x, event.world.y));
    },
  });

  context.registerShortcut({
    id: 'add-box',
    keys: 'Ctrl+Alt+B',
    labelKey: 'shortcut.addBox',
    run() {
      const own = context.document.layers().filter(
        (info) => info.pluginId === context.pluginId && info.status === 'ready',
      );
      const top = own.at(-1);
      if (top) context.document.layer<Data>(top.id).execute(addBox(0, 0));
    },
  });

  context.registerPanel({
    id: 'summary',
    titleKey: 'panel.title',
    mount(element) {
      const text = document.createElement('p');
      text.textContent = context.t('panel.count', { count: 0 });
      element.append(text);
      return () => text.remove();
    },
  });
}
```

- **Narzędzie** dostaje zdarzenia tylko wtedy, gdy jest aktywne, i zawsze razem z aktywną warstwą typu tej wtyczki. Zdarzenie zawiera pozycję na tablicy (`world`), w kontenerze (`screen`), rodzaj urządzenia, nacisk i przyciski.
- **Skrót** to kombinacja modyfikatorów `Ctrl`, `Alt`, `Shift`, `Meta` i klawisza (`KeyboardEvent.key`, bez rozróżniania wielkości liter). Kombinacja zajęta przez inną wtyczkę nie zostanie przypisana, a użytkownik dostanie komunikat.
- **Panel** buduje się w przekazanym elemencie dowolną techniką. `mount` zwraca funkcję, która go usuwa.

## 7. Tłumaczenia
Wszystkie teksty widoczne dla użytkownika pochodzą z `translations` w manifeście. W kodzie używaj `context.t(klucz)` albo `layer.t(klucz)`, podając klucz bez identyfikatora wtyczki. Parametry wstawia się w miejsce `{nazwa}`:

```json
"pl": { "panel": { "count": "Kwadraty: {count}" } }
```
```ts
context.t('panel.count', { count: 3 }); // "Kwadraty: 3"
```

Pola `labelKey` i `titleKey` narzędzi, skrótów i paneli to też klucze tłumaczeń wtyczki.

## 8. Izolacja warstw
- Wtyczka zmienia tylko dane własnych warstw. `context.document.layers()` pokazuje wszystkie warstwy lekcji (identyfikator, typ, stan), ale `context.document.layer(id)` zwraca uchwyt wyłącznie do warstwy tej wtyczki. Próba sięgnięcia po cudzą warstwę kończy się błędem `LayerAccessError`.
- Wtyczka rysuje tylko we własnym kontenerze.
- Wtyczki działają w tym samym kontekście JavaScript co program (ADR-008), więc te zasady są umową API, a nie piaskownicą. Wtyczki z katalogu są sprawdzane sumami kontrolnymi, a instalacja z pliku pokazuje ostrzeżenie.

## 9. Błędy
Program przechwytuje wyjątki z kodu wtyczki:
- błąd w `mountLayer`, `render`, `deserialize`, narzędziu lub poleceniu oznacza **tę warstwę** jako uszkodzoną,
- błąd w `activate`, skrócie lub panelu oznacza **całą wtyczkę** jako niedziałającą,
- pozostałe warstwy działają dalej, a użytkownik dostaje komunikat,
- dane uszkodzonej warstwy są zachowane: przy zapisie lekcji trafia do pliku ostatnia wersja, którą udało się zserializować.

## 10. Testowanie wtyczki
- `validateManifest(manifest)` w testach jednostkowych.
- Polecenia testuj bez programu: wywołaj `apply` i `revert` na danych i porównaj wynik.
- Wzorcowa wtyczka testowa programu: `packages/test-fixture-layer`. Napisano ją wyłącznie według tego przewodnika i referencji; testy integracyjne programu (`app/src/composition/layers.test.ts`) sprawdzają na niej całe API.

## 11. Co dojdzie w kolejnych wersjach pobocznych
API 1.0 obejmuje rejestrację warstwy, kontener i kamerę, narzędzia, skróty, panele, tłumaczenia, polecenia cofania oraz zapis z wersją formatu i migracjami. Kolejne kroki etapu 1 dodadzą zgodnie z planem, jako zmiany zgodne wstecz: dostęp do zasobów lekcji (osadzone pliki), pełne zdarzenia wejścia z potoku wejścia (nachylenie, gumka rysika), rysowanie do eksportu PDF/PNG oraz instalację wtyczek z pliku i z katalogu.
