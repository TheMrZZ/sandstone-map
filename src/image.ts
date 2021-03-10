import jimp from 'jimp'
import { findClosestColor } from './colors'

const SCALE = 4

async function imageToMinecraftColors() {
  console.time('Read')
  const image = await jimp.read('src/image.png')
  console.timeEnd('Read')
  console.time('Scale')
  image.scaleToFit(128 * SCALE, 128 * SCALE)
  console.timeEnd('Scale')

  console.time('Scan')
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const red = image.bitmap.data[idx + 0]
    const green = image.bitmap.data[idx + 1]
    const blue = image.bitmap.data[idx + 2]

    const color = { R: red, G: green, B: blue }
    const closestColor = findClosestColor(color)

    image.bitmap.data[idx + 0] = closestColor.color.R
    image.bitmap.data[idx + 1] = closestColor.color.G
    image.bitmap.data[idx + 2] = closestColor.color.B
  })

  console.timeEnd('Scan')
  console.time('Write')
  image.write('./src/outputVeryFast.png')
  console.timeEnd('Write')
}

imageToMinecraftColors()
