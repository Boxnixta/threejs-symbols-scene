# Threejs Symbols Scene

Interaktive 3D-Szene mit schwebenden Glassymbolen.  
Die Formen reagieren auf die Maus und weichen sanft aus.

## 👀 Preview: [Klick hier!](https://boxnixta.github.io/threejs-symbols-scene/)

## Voraussetzungen

- Node.js (https://nodejs.org) muss installiert sein

## Setup

1. Repository klonen:
   git clone https://github.com/Boxnixta/threejs-symbols-scene.git

2. In den Ordner wechseln:
   cd DEINREPONAME

3. Abhängigkeiten installieren:
   npm install

4. Entwicklungsserver starten:
   npm run dev

→ Die Szene öffnet sich unter dem Link http://localhost:5173

## Eigene SVGs hinzufügen

SVG-Dateien in den Ordner /symbols/ legen.
In main.js am Ende der SVG-Sektion aufrufen:
loadSVGSymbol('./symbols/DATEINAME.svg', '#FARBE', new THREE.Vector3(x, y, z))

## Für die Website deployen

npm run deploy

→ Erstellt einen fertigen /dist Ordner mit allen Dateien.

## Farben anpassen

Über das GUI-Panel oben rechts im Browser können  
die 5 Glasfarben live angepasst werde.