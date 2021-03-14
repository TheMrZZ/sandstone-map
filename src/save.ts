/**
 * This file is just an example.
 * You can delete it!
 */
import * as fs from 'fs'
import * as nbt from 'prismarine-nbt'
import { promisify } from 'util'
import * as zlib from 'zlib'

const gzip = promisify(zlib.gzip)

export async function saveNBT(file: nbt.NBT, outputPath: string) {
  // Write it back
  const newBuf = zlib.gzipSync(nbt.writeUncompressed(file, 'big'))

  fs.writeFileSync(outputPath, newBuf)
}
