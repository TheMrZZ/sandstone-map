import colorDiff, { diff } from 'color-diff'

type Color = {
  R: number
  G: number
  B: number
}

const BASE_COLORS: Color[] = [
  { R: 127, G: 178, B: 56 },
  { R: 247, G: 233, B: 163 },
  { R: 199, G: 199, B: 199 },
  { R: 255, G: 0, B: 0 },
  { R: 160, G: 160, B: 255 },
  { R: 167, G: 167, B: 167 },
  { R: 0, G: 124, B: 0 },
  { R: 255, G: 255, B: 255 },
  { R: 164, G: 168, B: 184 },
  { R: 151, G: 109, B: 77 },
  { R: 112, G: 112, B: 112 },
  { R: 64, G: 64, B: 255 },
  { R: 143, G: 119, B: 72 },
  { R: 255, G: 252, B: 245 },
  { R: 216, G: 127, B: 51 },
  { R: 178, G: 76, B: 216 },
  { R: 102, G: 153, B: 216 },
  { R: 229, G: 229, B: 51 },
  { R: 127, G: 204, B: 25 },
  { R: 242, G: 127, B: 165 },
  { R: 76, G: 76, B: 76 },
  { R: 153, G: 153, B: 153 },
  { R: 76, G: 127, B: 153 },
  { R: 127, G: 63, B: 178 },
  { R: 51, G: 76, B: 178 },
  { R: 102, G: 76, B: 51 },
  { R: 102, G: 127, B: 51 },
  { R: 153, G: 51, B: 51 },
  { R: 25, G: 25, B: 25 },
  { R: 250, G: 238, B: 77 },
  { R: 92, G: 219, B: 213 },
  { R: 74, G: 128, B: 255 },
  { R: 0, G: 217, B: 58 },
  { R: 129, G: 86, B: 49 },
  { R: 112, G: 2, B: 0 },
  { R: 209, G: 177, B: 161 },
  { R: 159, G: 82, B: 36 },
  { R: 149, G: 87, B: 108 },
  { R: 112, G: 108, B: 138 },
  { R: 186, G: 133, B: 36 },
  { R: 103, G: 117, B: 53 },
  { R: 160, G: 77, B: 78 },
  { R: 57, G: 41, B: 35 },
  { R: 135, G: 107, B: 98 },
  { R: 87, G: 92, B: 92 },
  { R: 122, G: 73, B: 88 },
  { R: 76, G: 62, B: 92 },
  { R: 76, G: 50, B: 35 },
  { R: 76, G: 82, B: 42 },
  { R: 142, G: 60, B: 46 },
  { R: 37, G: 22, B: 16 },
  { R: 189, G: 48, B: 49 },
  { R: 148, G: 63, B: 97 },
  { R: 92, G: 25, B: 29 },
  { R: 22, G: 126, B: 134 },
  { R: 58, G: 142, B: 140 },
  { R: 86, G: 44, B: 62 },
  { R: 20, G: 180, B: 133 },
]

function getColorVariants(color: Color): Color[] {
  function applyMultiplier(multiplier: number): Color {
    return {
      R: Math.floor(color.R * multiplier / 255),
      G: Math.floor(color.G * multiplier / 255),
      B: Math.floor(color.B * multiplier / 255),
    }
  }

  return [
    applyMultiplier(180),
    applyMultiplier(220),
    applyMultiplier(255),
    applyMultiplier(135),
  ]
}

export const ALL_COLORS = BASE_COLORS.flatMap(getColorVariants)
const ALL_COLORS_WITH_IDS = [...ALL_COLORS.entries()].map(([i, color]) => ({ color, id: i + 4 }))

type ColorAndID = { color: Color, id: number }

const cache = new Map<string, ColorAndID>()
export function findClosestColor(color: Color): ColorAndID {
  const colorStr = JSON.stringify(color)

  // If in cache, return it
  const cachedColor = cache.get(colorStr)
  if (cachedColor) {
    return cachedColor
  }

  /*
   * Not in cache.
   * Find the closest color, then return it.
   */
  let bestId = ALL_COLORS_WITH_IDS[0].id
  let bestColor = ALL_COLORS_WITH_IDS[0].color
  let bestSimilarity = 999999

  for (const { id, color: mcColor } of ALL_COLORS_WITH_IDS) {
    const rMean = (color.R + mcColor.R) / 2
    const rDelta = color.R - mcColor.R
    const gDelta = color.G - mcColor.G
    const bDelta = color.B - mcColor.B

    // https://stackoverflow.com/a/9085524
    const similarity = (((512 + rMean) * rDelta ** 2) >> 8) + 4 * gDelta ** 2 + (((767 - rMean) * bDelta ** 2) >> 8)
    if (similarity < bestSimilarity) {
      bestId = id
      bestColor = mcColor
      bestSimilarity = similarity
    }
  }

  const result = {
    color: bestColor,
    id: bestId,
  }

  // Set in cache
  cache.set(colorStr, result)
  return result
}
