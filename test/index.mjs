import fs from 'fs'
import DLF from '../src/dlf/DLF.mjs'
import FTS from '../src/fts/FTS.mjs'

const { readFile, writeFile } = fs.promises

;(async () => {
  const rawDlf = await readFile('./test/files/level8.dlf.unpacked')

  await writeFile('E:/level8.dlf.json', JSON.stringify(DLF.load(rawDlf), 0, 4), 'utf-8')

  // ------------

  const rawFts = await readFile('./test/files/fast.fts.unpacked')

  await writeFile('E:/fast.fts.json', JSON.stringify(FTS.load(rawFts), 0, 4), 'utf-8')

  console.log('OK')
})()