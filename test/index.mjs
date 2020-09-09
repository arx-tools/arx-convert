import { promises } from 'fs'
import DLF from '../src/dlf/DLF.mjs'

const { readFile, writeFile } = promises

;(async () => {
  const raw = await readFile('./test/files/level8.dlf.unpacked')
  const dlf = new DLF()

  dlf.load(raw)

  const output = JSON.stringify(dlf, 0, 4)

  await writeFile('E:/level8.dlf.json', output, 'utf-8')

  console.log('OK')
})()