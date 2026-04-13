# VikingArsenal — Archived April 2026

## What this is
Four-card SVG animation section used on the /vikings page.
Each card features a scroll-triggered build animation of a Viking-Age object.
Archived to remove from active site — may be reused in museum installation or future site.

## Cards
- **THE VIKING** — Full warrior figure assembled piece by piece (boots -> legs -> torso -> arms -> helmet -> beard -> eyes)
- **THE AXE** — Bearded skeggox axe with handle stroke + blade reveal
- **THE SWORD** — Ulfberht-type sword with Tiwaz rune, double-edged blade
- **THE SHIELD** — Gokstad-type round shield with plank construction and dragon knotwork

## Animation technique
- Scroll-triggered via Intersection Observer (threshold: 0.3)
- Staggered 200ms per card on scroll-enter
- Click any card to replay from start
- CSS: stroke-dashoffset, clip-path, scale transforms, cubic-bezier bounce

## Section copy
- Overline: "FORGED IN THE NORTH"
- Headline: "They were more than raiders."
- Subtext: "Every object tells a story. Every story ends here."

## To restore
1. Move VikingArsenal.tsx back to /app/components (or /components)
2. Import in any page: `import VikingArsenal from '@/app/components/VikingArsenal'`
3. Drop `<VikingArsenal />` into the page where needed

## Files in this archive
- `VikingArsenal.tsx` — self-contained component (no external dependencies beyond React)
- `README.md` — this file
