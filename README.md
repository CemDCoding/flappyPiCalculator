# π-Rechner

Taschenrechner im Browser mit verstecktem Flappy-Bird-ähnlichem Spiel (π als Vogel). Rein lokal, ohne Backend, ohne externe Ressourcen.

## Voraussetzungen

- Node 24, npm

## Start

```
npm ci
npm run dev      # http://localhost:5173
```

## Checks

```
npm run lint
npm run typecheck
npm test
npm run build
npm run preview  # gebautes Ergebnis ansehen
```

`npm run format` formatiert den Code mit Prettier.

## Bedienung

Alle Funktionen laufen über die Rechnertasten (Maus) oder die PC-Tastatur.

### Rechner

| Rechnertaste             | PC-Tastatur              | Wirkung                                         |
| ------------------------ | ------------------------ | ----------------------------------------------- |
| `0`–`9`, `,`             | `0`–`9`, `,` oder `.`    | Zahl eingeben                                   |
| `+` `−` `×` `÷`, `(` `)` | `+` `-` `*` `/`, `(` `)` | Rechenzeichen und Klammern                      |
| `%`                      | `%`                      | Prozent (Postfix, wirkt erst bei `=`)           |
| `±`                      | `F9`                     | Vorzeichen wechseln                             |
| `=`                      | `Enter` oder `=`         | Ergebnis                                        |
| `AC`                     | `Esc`                    | alles löschen                                   |
| `C`                      | `Entf`                   | aktuelle Eingabe löschen                        |
| `⌫`                      | `Backspace`              | letztes Zeichen löschen                         |
| `🐦`                     | `b`                      | Spiel starten (Rechnerstand wird zurückgesetzt) |

In Spiel, Kürzeleingabe und Bestenliste gelten dieselben PC-Tasten (z. B. `Esc` = `AC`, `Entf` = `C`, `b` = `🐦`).

### Spiel

| Taste         | Wirkung                                            |
| ------------- | -------------------------------------------------- |
| `0`–`9`       | π flattern lassen (erste Ziffer startet das Spiel) |
| `%`           | Spiel pausieren und Bestenliste zeigen             |
| `C` oder `🐦` | Spiel ohne Wertung beenden, zurück zum Rechner     |
| andere Tasten | keine Wirkung                                      |

Nach Game Over sind die Tasten 0,8 s gesperrt. Danach erscheint bei einem Top-3-Ergebnis die Kürzeleingabe, sonst die Bestenliste. 0 Punkte kommen nie in die Liste.

### Kürzeleingabe (nach Top-3-Ergebnis)

| Taste   | Wirkung                                       |
| ------- | --------------------------------------------- |
| `0`–`9` | Ziffer anhängen (höchstens 6)                 |
| `⌫`     | letzte Ziffer löschen                         |
| `=`     | speichern (mindestens 1 Ziffer) → Bestenliste |
| `C`     | verwerfen → Bestenliste                       |

### Bestenliste

| Taste                          | Wirkung                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `AC` zweimal innerhalb von 2 s | Liste löschen (nur hier möglich)                                                |
| `%`                            | zurück zum pausierten Spiel (weiter mit der nächsten Ziffer), sonst neues Spiel |
| `0`–`9` oder `=`               | neues Spiel                                                                     |
| `C` oder `🐦`                  | zurück zum Rechner                                                              |

Die Bestenliste (Top 3: Kürzel, Punkte, Datum) liegt nur im `localStorage` des Browsers. Ist er nicht verfügbar, gilt die Liste nur bis zum Neuladen.
