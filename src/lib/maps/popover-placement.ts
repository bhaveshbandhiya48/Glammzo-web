const CARD_WIDTH = 320
const CARD_HEIGHT = 380
const MARKER_GAP = 14
const EDGE_PADDING = 12

type Point = { x: number; y: number }
type Size = { width: number; height: number }

export function getMapPopoverPlacement(marker: Point, container: Size) {
  const halfWidth = CARD_WIDTH / 2
  const left = Math.min(
    Math.max(marker.x, halfWidth + EDGE_PADDING),
    container.width - halfWidth - EDGE_PADDING,
  )

  const spaceBelow = container.height - marker.y - MARKER_GAP
  const spaceAbove = marker.y - MARKER_GAP
  const showBelow =
    spaceBelow >= CARD_HEIGHT + EDGE_PADDING || spaceBelow >= spaceAbove

  if (showBelow) {
    return {
      left,
      top: marker.y + MARKER_GAP,
      transform: "translate(-50%, 0)",
    }
  }

  return {
    left,
    top: marker.y - MARKER_GAP,
    transform: "translate(-50%, -100%)",
  }
}
