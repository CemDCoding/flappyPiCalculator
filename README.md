# π-Rechner

Taschenrechner mit LCD-Display und verstecktem Flappy-π-Spiel. Das Programm läuft rein lokal im Browser, ohne Backend und ohne externe Ressourcen.

## Funktionen

- **Rechner:** Grundrechenarten, Klammern, Prozent (Postfix), Vorzeichenwechsel (±) und eine Fehleranzeige bei ungültigen Eingaben.
- **Spiel:** Start über die Taste „🐦“. π flattert per Ziffertaste durch die Hindernisse.
- **Bestenliste:** lokale Top 3 mit Kürzel (aus Ziffern), Punkten und Datum.

## Voraussetzungen

- Node 24 mit npm
- Git
- ein aktueller Browser

## Schnellstart

1. Repository klonen und in den Ordner wechseln. Setze anstelle von `REPOSITORY-URL` die URL deines eigenen Repositorys ein (derzeit ist kein Remote eingerichtet):

   ```
   git clone https://github.com/CemDCoding/flappyPiCalculator.git
   cd mAtaschenRechnerFlappybird
   ```

   Der Ordnername hängt vom Repository-Namen ab.

2. Abhängigkeiten exakt laut `package-lock.json` installieren:

   ```
   npm ci
   ```

3. Entwicklungsserver starten und im Browser `http://localhost:5173` öffnen. Beenden mit `Strg+C`:

   ```
   npm run dev
   ```

4. Produktionsvariante bauen und ansehen. Danach im Browser `http://localhost:4173` öffnen:

   ```
   npm run build
   npm run preview
   ```

5. Fehlerhilfe:
   - **Port belegt:** Vite weicht automatisch auf den nächsten freien Port aus (`vite.config.ts` setzt nur `host: 'localhost'`, kein `strictPort`). Die tatsächliche Adresse steht in der Konsole.
   - **Falsche Node-Version:** mit `node -v` prüfen und bei Bedarf Node 24 installieren.
   - **Installationsprobleme:** den Ordner `node_modules` löschen und `npm ci` wiederholen.

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

## Entwicklung

Skripte aus `package.json`:

- `npm run dev` startet den Entwicklungsserver (`http://localhost:5173`).
- `npm run build` prüft die Typen und erzeugt den Produktions-Build.
- `npm run preview` zeigt den gebauten Stand an (`http://localhost:4173`).
- `npm test` führt alle Tests mit Vitest aus.
- `npm run lint` prüft den Code mit ESLint.
- `npm run typecheck` prüft die Typen mit TypeScript.
- `npm run format` formatiert alle Dateien mit Prettier (schreibt Änderungen).

Die Formatierung prüfst du ohne Änderungen mit `npx prettier --check .`.

Die Datei `.gitattributes` erzwingt LF-Zeilenenden (`* text=auto eol=lf`). Erscheinen unter Windows Dateien nach dem Auschecken als geändert, hilft `git add --renormalize .`.

## Projektstruktur

- `src/calc` – Rechenkern (Tokenizer, Parser, Auswertung, Zahlenformat)
- `src/game` – Spiellogik, LCD-Renderer und Konfiguration
- `src/leaderboard` – Top-3-Speicher und Validierung
- `src/ui` – DOM-Ansicht, Tastatur und CSS
- `src/app` – Modus-Steuerung, Spielschleife und Speicherwahl
- `src/contracts` – gemeinsame Typen und Verträge
- `src/main.ts` – Einstiegspunkt
- `docs/` – Bauplan

## Datenschutz und Hinweise

- Alle Daten liegen ausschließlich im `localStorage` des Browsers unter dem Schlüssel `mataschen.leaderboard.v1`. Gespeichert werden nur Kürzel (1–6 Ziffern), Punkte und Datum (`JJJJ-MM-TT`) der Top 3.
- Es gibt keine Übertragung an Server, keine externen Ressourcen, kein Tracking und keine Cookies.
- Löschen: in der Bestenliste zweimal `AC` innerhalb von 2 s drücken oder die Browserdaten der Seite löschen.
- Ist `localStorage` nicht verfügbar, gilt die Liste nur bis zum Neuladen der Seite.

## Status und Branches

M1 ist abgeschlossen. Die Branches werden lokal gepflegt:

- `dev` – Entwicklung
- `stage` – Test
- `master` – stabiler Stand

## Lizenz

MIT – siehe [LICENSE](LICENSE)
