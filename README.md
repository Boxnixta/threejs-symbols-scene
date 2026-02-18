# Threejs Symbols Scene

Interaktive 3D-Szene mit schwebenden Glassymbolen.  
Die Formen reagieren auf die Maus und weichen sanft aus.

## Voraussetzungen

- Node.js (https://nodejs.org) muss installiert sein

## Setup

1. Repository klonen:
   git clone https://github.com/DEINUSERNAME/DEINREPONAME.git

2. In den Ordner wechseln:
   cd DEINREPONAME

3. Abhängigkeiten installieren:
   npm install

4. Entwicklungsserver starten:
   npm run dev

→ Die Szene öffnet sich unter http://localhost:5173

## Eigene SVGs hinzufügen

SVG-Dateien in den Ordner /symbols/ legen.
In main.js am Ende der SVG-Sektion aufrufen:
loadSVGSymbol('./symbols/DATEINAME.svg', '#FARBE', new THREE.Vector3(x, y, z))

## Für die Website deployen

npm run deploy

→ Erstellt einen fertigen /dist Ordner mit allen Dateien.

## Farben anpassen

Über das GUI-Panel oben rechts im Browser können  
die 5 Glasfarben live angepasst werden.

## Projektstruktur
''''
├── index.html       – HTML Grundstruktur
├── main.js          – Gesamte 3D-Szene und Logik
├── symbols/         – SVG-Dateien für eigene Formen
├── package.json     – Projektabhängigkeiten
└── vite.config.js   – Build-Konfiguration
''''