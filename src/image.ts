import jimp from 'jimp'
import hash from 'object-hash'
import { summon } from 'sandstone/commands'
import { relative } from 'sandstone/_internals'
import { NBT } from 'sandstone/_internals/variables/NBTs'
import type { Color } from './colors'
import { findClosestColor } from './colors'

import { saveNBT } from './save'

// Black magic to get the return type of jimp.read, corresponding to an image, since JIMP doesn't have that as a builtin type.
export type JimpImage = Parameters<NonNullable<Parameters<ReturnType<typeof jimp['read']>['then']>['0']>>['0']

function scan(image: JimpImage, callback: (color: Color, row: number, col: number, idx: number) => void) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (col: number, row: number, idx: number) => {
    const red = image.bitmap.data[idx + 0]
    const green = image.bitmap.data[idx + 1]
    const blue = image.bitmap.data[idx + 2]
    const color = { R: red, G: green, B: blue }

    callback(color, row, col, idx)
  })
}

function create2dArray<T>(height: number, width: number, fill: T): T[][] {
  return (new Array(height)).fill(0).map(() => new Array(width).fill(fill))
}

function imageToPixels(image: JimpImage): Color[][] {
  const pixels = create2dArray(image.bitmap.height, image.bitmap.width, { R: 0, G: 0, B: 0 })
  scan(image, (color, row, col) => {
    pixels[row][col] = color
  })
  return pixels
}

function pixelsToMinecraftColorsIds(pixels: Color[][]): number[][] {
  return pixels.map((pixels1d) => pixels1d.map((pixel) => findClosestColor(pixel).id))
}

export class MCImage {
  path

  constructor(path: string) { this.path = path }

  async displayOn(screen: MediaScreen, options: {
    /** @default "scaleToFit" */
    preprocess?: 'scaleToFit' | 'resize' | 'crop'
    /** @default 0 */
    dither?: number
    /** @default false */
    normalize?: boolean
  } = {}) {
    // eslint-disable-next-line prefer-const
    let image = await jimp.read(this.path)

    const { preprocess, dither, normalize } = {
      preprocess: 'scaleToFit',
      dither: 0,
      normalize: false,
      ...options,
    }

    const { height, width } = screen

    if (preprocess === 'scaleToFit') {
      image = image.scaleToFit(128 * width, 128 * height).contain(128 * width, 128 * height)
    }
    if (preprocess === 'resize') {
      image = image.resize(128 * width, 128 * height)
    }
    if (preprocess === 'crop') {
      image = image.cover(128 * width, 128 * height)
    }

    for (let i = 0; i < dither; i += 1) {
      image.dither16()
    }

    if (normalize) {
      image.normalize()
    }

    const maps = await screen._imageToMaps(imageToPixels(image))
    screen._displayMaps(maps)
  }
}

function slice<T>(array: T[][], fromHeight: number, toHeight: number, fromWidth: number, toWidth: number): T[][] {
  return array.slice(fromHeight, toHeight).map((array1d) => array1d.slice(fromWidth, toWidth))
}

export class MediaScreen {
  static mapId = 22_000

  static cache = new Map<string, number>()

  width

  height

  facing

  constructor(width: number, height: number, facing: 'east' | 'west' | 'south' | 'north' | 'top' | 'bottom') {
    this.width = width
    this.height = height

    //  3 is south, 4 is west, 2 is north, 5 is east, 1 is top, and 0 is bottom.
    this.facing = {
      south: 3,
      west: 4,
      north: 2,
      east: 5,
      top: 1,
      bottom: 0,
    }[facing]
  }

  private async getMapId(pixelsColorIds: number[]) {
    // Normalize
    pixelsColorIds = pixelsColorIds.map((id) => (id <= 127 ? id : id - 256))

    const hashedIDs = hash(pixelsColorIds)

    const cachedMapId = MediaScreen.cache.get(hashedIDs)
    if (cachedMapId) {
      return cachedMapId
    }

    const { mapId } = MediaScreen
    MediaScreen.mapId += 1
    MediaScreen.cache.set(hashedIDs, mapId)

    const mapNBT: any = {
      type: 'compound',
      name: '',
      value: {
        data: {
          type: 'compound',
          value: {
            scale: {
              type: 'byte',
              value: 0,
            },
            dimension: {
              type: 'byte',
              value: 0,
            },
            trackingPosition: {
              type: 'byte',
              value: 0,
            },
            locked: {
              type: 'byte',
              value: 1,
            },
            height: {
              type: 'short',
              value: 128,
            },
            width: {
              type: 'short',
              value: 128,
            },
            xCenter: {
              type: 'int',
              value: 0,
            },
            zCenter: {
              type: 'int',
              value: 0,
            },
            colors: {
              type: 'byteArray',
              value: pixelsColorIds,
            },
          },
        },
      },
    }

    await saveNBT(mapNBT, `C:\\Users\\Florian\\AppData\\Roaming\\.minecraft\\saves\\world\\data\\map_${mapId}.dat`)

    return mapId
  }

  _imageToMaps = async (pixels: Color[][]): Promise<number[][]> => {
    if (pixels.length !== 128 * this.height) {
      throw new Error(`Expected a height of ${128 * this.height}, got ${pixels.length}.`)
    }

    if (pixels[0].length !== 128 * this.width) {
      throw new Error(`Expected a height of ${128 * this.width}, got ${pixels[0].length}.`)
    }

    const allPixelsColorIds = pixelsToMinecraftColorsIds(pixels)

    return Promise.all(create2dArray(this.height, this.width, 0).map((pixelsRow, row) => Promise.all(pixelsRow.map((_, col) => {
      const pixelsColorIds = slice(allPixelsColorIds, row * 128, (row + 1) * 128, col * 128, (col + 1) * 128).flat()

      return this.getMapId(pixelsColorIds)
    }))))
  }

    _displayMaps = (maps: (number | null)[][]) => {
      maps.forEach((mapsLine, row) => mapsLine.forEach((mapId, col) => {
        if (mapId === null || mapId === undefined) { return }

        summon('minecraft:item_frame', relative(this.width - col - 1, this.height - row - 1, 0), {
          Item: { id: 'minecraft:filled_map', Count: NBT.byte(1), tag: { map: mapId } },
          Fixed: NBT.byte(1),
          Invisible: NBT.byte(1),
          Facing: NBT.byte(this.facing),
        })
      }))
    }
}
