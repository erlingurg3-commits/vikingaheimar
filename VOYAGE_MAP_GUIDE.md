# Voyage Booking Map - Implementation Guide

## Overview

The Voyage Booking Map is a production-grade, scroll-synced historical voyage visualization component for the Víkingaheimar booking page. It displays the Íslendingur's North Atlantic journey with accurate geography, premium aesthetics, and smooth animations.

## Components

### 1. `VoyageBookingMap` (Main Component)
**File:** `app/components/VoyageBookingMap.tsx`

The core SVG-based map component that renders:
- Accurate coastline geometries for Iceland, Greenland, Newfoundland, Nova Scotia, New England, and New York
- The voyage route with progressive reveal animation
- The sailing ship marker that follows scroll progress
- Intelligent location labels that appear/disappear based on context
- Premium design with muted colors and smooth motion

#### Props
```typescript
interface VoyageBookingMapProps {
  scrollContainer?: HTMLElement | null;  // Optional scroll target; defaults to window
  interactive?: boolean;                 // Enable hover/click (default: true)
  showLabels?: boolean;                  // Display location labels (default: true)
  className?: string;                    // Optional CSS classes
}
```

#### Usage
```tsx
import VoyageBookingMap from '@/app/components/VoyageBookingMap';

export default function MyPage() {
  return (
    <div style={{ height: '600px' }}>
      <VoyageBookingMap showLabels interactive />
    </div>
  );
}
```

### 2. `VoyageBookingPanel` (Integration Component)
**File:** `app/components/VoyageBookingPanel.tsx`

A higher-level wrapper that presents the map with proper framing, headers, and footers. Used in the booking page to provide context and consistent styling.

#### Props
```typescript
interface VoyageBookingPanelProps {
  sticky?: boolean;                          // Use sticky positioning (default: true)
  containerClassName?: string;               // Tailwind classes for sizing
}
```

#### Usage
```tsx
import VoyageBookingPanel from '@/app/components/VoyageBookingPanel';

export default function BookingPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-11 gap-12">
      <div className="lg:col-span-6">
        {/* Booking form */}
      </div>
      <VoyageBookingPanel sticky containerClassName="lg:col-span-5" />
    </div>
  );
}
```

## Data Files

### 1. `lib/voyage-route-data.ts`
Defines the complete voyage route with 17 waypoints from Reykjavík through Greenland to Vinland and back.

**Key exports:**
- `ISLENDINGUR_VOYAGE_ROUTE`: Array of `VoyageStop` objects
- `getVoyageStop(id)`: Get a stop by ID
- `getHeroStops()`: Get all major stops
- `getVoyageStopsInRange(min, max)`: Get stops within an order range

**Adding custom stops:**
```typescript
const newStop: VoyageStop = {
  id: 'stop-name',
  name: 'Display Name',
  lat: 45.5,
  lng: -45.0,
  order: 8,
  arrivalDate: '2024-08-05',
  type: 'arrival',
  isHero: true,
  shortLabel: 'Label',
  historicalNote: 'Optional context',
  confidence: 'probable',
  bookingSegment: 'checkout',
};
```

### 2. `lib/coastline-data.ts`
Provides geometric coastline data for rendering accurate land silhouettes.

**Key exports:**
- `COASTLINE_REGIONS`: Array of `CoastlineRegion` objects
- `getCoastlineRegion(id)`: Get coastline by ID
- `getIntersectingCoastlines()`: Get coastlines within geographic bounds
- `polygonToSvgPath()`: Convert polygon to SVG path

**Available coastlines:**
- Iceland (detailed)
- Greenland (eastern and western coasts)
- Newfoundland
- Labrador
- Nova Scotia
- New England
- New York region

### 3. `lib/geo-utils.ts`
Geographic and mathematical utilities for rendering and calculations.

**Key functions:**
- `createLinearProjection()`: Create geographic-to-SVG projection
- `createMercatorProjection()`: Web Mercator projection alternative
- `calculateBearing()`: Get angle between two points
- `calculateDistance()`: Great-circle distance calculation
- `interpolateAlongPath()`: Smooth interpolation along route
- `getScrollProgress()`: Normalize scroll to 0-1
- `getVisibleStops()`: Determine which labels should show
- `shouldReduceMotion()`: Check user accessibility preferences

## Hooks

### `lib/voyage-map-hooks.ts`

#### `useScrollProgress(container?)`
Track scroll progress normalized to 0-1.

```tsx
const progress = useScrollProgress(containerRef.current);
// progress updates as user scrolls
```

#### `useReducedMotion()`
Detect if user prefers reduced motion.

```tsx
const prefersReducedMotion = useReducedMotion();
if (prefersReducedMotion) {
  // Skip animations
}
```

#### `useInView(ref, threshold?)`
Detect if element is in viewport.

```tsx
const containerRef = useRef(null);
const inView = useInView(containerRef);
```

#### `useElementSize(ref)`
Get element dimensions with automatic updates.

```tsx
const size = useElementSize(containerRef);
// { width: 800, height: 600 }
```

## Styling & Colors

The component uses the Víkingaheimar design system:

### Color Palette
- **Landmasses:** `#e8e2d8` (off-white beige)
- **Coastlines:** `#c8b8a0` (warm gray)
- **Route line:** `#d4a574` (heritage amber, with gradient)
- **Ship:** `#d4a574` and `#c8874a` (muted golds)
- **Labels:** `#7a7672` (neutral gray)
- **Background:** `#f9f7f5` (warm off-white)

### Responsive Behavior

The component uses:
- **Dimensions:** `clamp()` for flexible sizing
- **SVG ViewBox:** Responsive via `preserveAspectRatio="none"`
- **ResizeObserver:** Automatically recalculates on container resize
- **Mobile:** Full-width map, slightly reduced height on phone
- **Desktop:** Sticky positioning keeps map visible while scrolling

## Features

### Scroll Synchronization
- Ship position interpolated along route based on page scroll percentage
- Route line reveals progressively
- Labels update intelligently to show current/next stops
- Smooth 60ms transitions respect `prefers-reduced-motion`

### Premium Aesthetics
- Accurate coastline silhouettes (not cartoon blobs)
- Thin, elegant route lines with gradient
- Subtle markers for stops and hero locations
- Soft, museum-grade typography
- Minimal use of color; muted earth tones
- Generous whitespace and padding

### Accessibility
- `aria-hidden="true"` on decorative SVG
- Respects `prefers-reduced-motion` media query
- Semantic HTML structure
- Keyboard navigation compatible
- Screen reader friendly (labels are decorative, not critical)

### Performance
- SVG-based rendering (lightweight, scalable)
- RequestAnimationFrame for smooth 60fps animations
- Passive event listeners for scroll
- ResizeObserver for responsive updates
- No animation frame drops; interpolation is optimized

## Customization

### Change Route Stops
Edit `lib/voyage-route-data.ts`:
```typescript
export const ISLENDINGUR_VOYAGE_ROUTE: readonly VoyageStop[] = [
  // Add or modify stops here
];
```

### Adjust Colors
Update the SVG fill/stroke attributes in `VoyageBookingMap.tsx`:
```tsx
fill="#e8e2d8"  // Landmass color
stroke="#d4a574"  // Route color
```

### Modify Label Visibility Logic
Update `getVisibleStops()` in `lib/geo-utils.ts` to change how many labels show and their proximity thresholds.

### Change Projection Type
In `VoyageBookingMap.tsx`, replace `createLinearProjection` with `createMercatorProjection` for geographic accuracy:
```typescript
const proj = createMercatorProjection(projectionBounds, width, height);
```

### Scale the Ship
Adjust the `scale(0.7)` transform in the ship SVG path.

## Known Limitations

1. **Coastlines are simplified** for performance; natural Earth 1:50m resolution
2. **Projection is linear** (not Web Mercator); acceptable for visualization purposes
3. **Labels don't avoid overlaps** at high densities; visibility logic limits simultaneous labels
4. **Ship rotation** is calculated from route bearing; may look odd on sharp turns
5. **No touch interactions** on mobile; scroll-driven only

## Future Enhancements

Potential additions (not in scope for MVP):
- Click-to-reveal detailed stop information
- Historical timeline overlay
- Alternative route paths (different scenarios)
- Animated route drawing on page load
- Voyage duration estimates between stops
- Weather/season context
- Integration with museum collection data

## Testing

To test the component:

```tsx
// Full booking page integration
import BookingPage from '@/app/booking/page';
render(<BookingPage />);

// Component in isolation
import VoyageBookingMap from '@/app/components/VoyageBookingMap';
render(<VoyageBookingMap show Labels />);

// Scroll behavior
window.scrollY = window.innerHeight * 2;
// Verify ship has moved and labels have updated
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers (iOS Safari 14.5+, Chrome Android)

Requires:
- ResizeObserver API
- SVG support
- CSS custom properties
- `prefers-reduced-motion` media query

## Troubleshooting

**Ship doesn't move:**
- Check `scrollContainer` prop is correctly passed
- Verify scroll events are firing (`window.scrollY` updates)
- Check browser DevTools console for errors

**Labels don't appear:**
- Verify `showLabels={true}` is set
- Check label visibility thresholds in `getVisibleStops()`
- Ensure SVG viewBox matches container size

**Map appears blank:**
- Check `projectionBounds` calculated correctly from `ISLENDINGUR_VOYAGE_ROUTE`
- Verify coastline data is loading (check network tab)
- Check browser console for GeoJSON projection errors

**Performance issues:**
- Monitor frame rate with DevTools Performance tab
- Reduce `maxResults` in `getVisibleStops()` if label updates are slow
- Consider disabling animations on low-end devices

## Support

For issues or questions, refer to:
- Component source code comments
- Utility function documentation
- Tailwind CSS integration guide
- Next.js App Router documentation
