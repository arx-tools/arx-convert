// Prints the size of the header of a compressed FTS file - the `--offset` argument of `explode` - together
// with the expected size of its unpacked pair, which is what a partial compression of an FTS needs.
//
// usage:
//   node tests/tools/fts-offsets.ts                     every fixture
//   node tests/tools/fts-offsets.ts path/to/fast.fts    a single file (its `.unpacked` pair is read too)
//
// The header of a compressed FTS is the 280 byte fixed part of an FTS header plus 768 bytes for every
// unique header (a 256 byte path and a 512 byte check), and the number of unique headers is stored in the
// header of the compressed file.
import { stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { FTS } from 'arx-convert'
import { availableLevels, pathToLevelFolder, readBinaryFile } from '../fixtures.ts'

function defaultCompressedFiles(levels: number[]): string[] {
  return levels.map((level) => {
    return path.join(pathToLevelFolder(level), 'fast.fts')
  })
}

async function numberOfUniqueHeadersOf(compressedFile: string): Promise<number> {
  // the path of the level is a fixed 256 byte string, the count of the unique headers follows it
  const bytes = await readBinaryFile(compressedFile)

  return new DataView(bytes).getInt32(256, true)
}

const args = process.argv.slice(2)
let compressedFiles = args
if (compressedFiles.length === 0) {
  compressedFiles = defaultCompressedFiles(await availableLevels())
}

for (const compressedFile of compressedFiles) {
  const unpackedFile = `${compressedFile}.unpacked`
  const json = FTS.load(await readBinaryFile(unpackedFile))
  const numberOfUniqueHeaders = await numberOfUniqueHeadersOf(compressedFile)
  const uniqueHeaders = json.uniqueHeaders?.length ?? 0

  if (numberOfUniqueHeaders !== uniqueHeaders) {
    throw new Error(
      `${compressedFile} has ${numberOfUniqueHeaders} unique headers, its unpacked pair has ${uniqueHeaders}`,
    )
  }

  const headerSize = 280 + uniqueHeaders * 768
  const { size: unpackedSize } = await stat(unpackedFile)
  const { size: compressedSize } = await stat(compressedFile)

  console.log(
    `${path.relative(process.cwd(), compressedFile)}: offset=${headerSize}` +
      ` unpacked=${unpackedSize} compressed=${compressedSize}`,
  )
}
