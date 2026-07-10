function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function formatMapPriceLabel(priceFrom: number): string {
  if (priceFrom <= 0) return "View"
  return `₹${priceFrom.toLocaleString("en-IN")}`
}

export function buildSalonPriceMarkerIcon(
  Size: typeof google.maps.Size,
  Point: typeof google.maps.Point,
  priceFrom: number,
  selected: boolean,
): google.maps.Icon {
  const label = formatMapPriceLabel(priceFrom)
  const width = Math.max(58, Math.round(label.length * 8.5 + 26))
  const height = 34
  const radius = height / 2
  const fill = selected ? "#171717" : "#ffffff"
  const stroke = selected ? "#171717" : "#e7e5e4"
  const textFill = selected ? "#ffffff" : "#111827"

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1" filter="url(#shadow)"/>
  <text x="${width / 2}" y="${height / 2 + 4.5}" text-anchor="middle" font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif" font-size="13" font-weight="600" fill="${textFill}">${escapeXml(label)}</text>
</svg>`

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new Size(width, height),
    anchor: new Point(width / 2, height / 2),
  }
}

export function buildUserLocationMarkerIcon(
  SymbolPath: typeof google.maps.SymbolPath,
): google.maps.Symbol {
  return {
    path: SymbolPath.CIRCLE,
    scale: 8,
    fillColor: "#2563eb",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
  }
}
