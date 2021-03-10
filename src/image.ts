import jimp from 'jimp'
import type { JimpConstructors } from '@jimp/core/types'
import type { Color } from './colors'
import { findClosestColor } from './colors'

const SCALE = 4
// Black magic to get the return type of jimp.read, corresponding to an image, since JIMP doesn't have that as a builtin type.
type JimpImage = Parameters<NonNullable<Parameters<ReturnType<typeof jimp['read']>['then']>['0']>>['0']

function scan(image: JimpImage, callback: (color: Color, row: number, col: number, idx: number) => void) {
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (col: number, row: number, idx: number) => {
    const red = image.bitmap.data[idx + 0]
    const green = image.bitmap.data[idx + 1]
    const blue = image.bitmap.data[idx + 2]
    const color = { R: red, G: green, B: blue }

    callback(color, row, col, idx)
  })
}

async function imageToMinecraftColors(image: JimpImage) {
  const pixelsArray: Color[][] = (new Array(image.bitmap.height)).fill(0).map(() => new Array(image.bitmap.width).fill({ R: 0, G: 0, B: 0 }))
  console.log(image.getWidth(), image.getHeight())
  scan(image, (color, row, col, idx) => {
    const closestColor = findClosestColor(color)

    image.bitmap.data[idx + 0] = closestColor.color.R
    image.bitmap.data[idx + 1] = closestColor.color.G
    image.bitmap.data[idx + 2] = closestColor.color.B

    if (pixelsArray[row] === undefined) {
      console.log(row, col)
    }
    pixelsArray[row][col] = color
  })
  return image
}

async function imageToMap(image: JimpImage, height: number, width: number, preprocess: 'scaleToFit' | 'resize' | 'crop' = 'scaleToFit') {
  if (preprocess === 'scaleToFit') {
    image = image.scaleToFit(128 * height, 128 * width).contain(128 * height, 128 * width)
  }
  if (preprocess === 'resize') {
    image = image.resize(128 * height, 128 * width)
  }
  if (preprocess === 'crop') {
    image = image.cover(128 * height, 128 * width)
  }

  // Change colors of the image
  await imageToMinecraftColors(image)

  image.write('new.png')
}

class MCImage {
  image: Promise<JimpImage>

  constructor(path: string) {
    this.image = jimp.read(path).then((image) => imageToMinecraftColors(image))
  }
}

jimp.read('src/image3.png').then(async (image) => {
  await imageToMap(image, 8, 8, 'crop')
})
