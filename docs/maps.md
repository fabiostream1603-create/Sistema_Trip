# Maps

Phase 3 now introduces the first real map module.

Implemented:

- `src/lib/maps/map-config.ts`
- `src/lib/maps/map-provider.ts`
- `src/lib/maps/navigation.ts`
- `src/lib/maps/coordinates.ts`
- `src/components/maps/BaseMap.tsx`
- `src/components/maps/TripMap.tsx`
- `src/components/maps/PlaceMarker.tsx`
- `src/components/maps/ItineraryRoute.tsx`
- `src/components/maps/MapPopup.tsx`
- `src/components/maps/UserLocationControl.tsx`
- `/trips/:tripId/map` connected to real destination data

Current behavior:

- OpenFreeMap is the default provider
- Liberty, Positron, and Bright styles are supported
- no API key is required for the initial map
- map attribution remains visible
- straight-line itinerary preview is shown with Haversine distance guidance
