import { promises } from 'fs'
// import DLF from '../src/dlf/DLF.mjs'
import FTS from '../src/fts/FTS.mjs'

const { readFile, writeFile } = promises

;(async () => {
  /*
  const raw = await readFile('./test/files/level8.dlf.unpacked')
  const dlf = new DLF()

  dlf.load(raw)

  const output = JSON.stringify(dlf, 0, 4)

  await writeFile('E:/level8.dlf.json', output, 'utf-8')
  */

  // ------------

  const raw = await readFile('./test/files/fast.fts.unpacked')
  const fts = new FTS()

  fts.load(raw)

  const output = JSON.stringify(fts, 0, 4)

  await writeFile('E:/fast.fts.json', output, 'utf-8')

  console.log('OK')
})()