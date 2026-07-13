/**
 * Light, minimal map styling, pale land, soft roads, hidden POI clutter.
 */
export const SALON_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f2ec" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f2ec" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e7e5e4" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fafaf9" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d6d3d1" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#cfe8f7" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dce8d4" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
]

export const SALON_MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  gestureHandling: "greedy",
  clickableIcons: false,
  styles: SALON_MAP_STYLES,
}
