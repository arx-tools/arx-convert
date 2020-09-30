import { promises } from 'fs'
import DLF from '../src/dlf/DLF.mjs'
import FTS from '../src/fts/FTS.mjs'

const { readFile, writeFile } = promises

;(async () => {
  const rawDlf = await readFile('./test/files/level8.dlf.unpacked')
  const dlf = new DLF()

  dlf.load(rawDlf)

  await writeFile('E:/level8.dlf.json', JSON.stringify(dlf, 0, 4), 'utf-8')

  // ------------

  const rawFts = await readFile('./test/files/fast.fts.unpacked')
  const fts = new FTS()

  fts.load(rawFts)

  await writeFile('E:/fast.fts.json', JSON.stringify(fts, 0, 4), 'utf-8')

  console.log('OK')
})()