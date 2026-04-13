# VikingWorldMap — Archived April 2026

## What this is
Animated world map showing three Viking expansion routes.
Built for the /vikings page of the Vikingaheimar Next.js site.
Archived to remove from active site — intended for future museum installation.

## Routes
- **Cyan (#00d4ff)** — West to Vinland (Leif Eriksson, c. 1000 CE)
- **Gold (#d4a000)** — South to Sicily (Norse raiders/settlers)
- **Red (#cc3333)** — East to Baghdad (Varangian route)

## Base map
Uses inline SVG landmass outlines (no external world.svg file).
The original component rendered all continents as simplified `<path>` elements directly in the JSX.
If a higher-fidelity base map is needed, consider Simplemaps World SVG (MIT licensed):
Download: https://simplemaps.com/resources/svg-world

## To restore
1. Move VikingWorldMap.tsx back to /app/components (or /components)
2. Import and use in any page: `import VikingWorldMap from '@/app/components/VikingWorldMap'`
3. Wrap with a scroll-reveal ref and pass `isVisible` prop
4. For museum kiosk: see KIOSK EXTENSION notes inside the component

## Museum installation notes
- Pure SVG — scales perfectly to any screen size
- Touchscreen: add onClick per waypoint for info panels
- Audio narration hooks: one `<audio>` element per route
- Ambient mode: auto-cycles routes when idle 30s+
- Language: add IS/EN switcher via routes-i18n.ts

## Files in this archive
- `VikingWorldMap.tsx` — the full component with MAP_DESTINATIONS, ROUTE_PATHS, and inline SVG
- `README.md` — this file
