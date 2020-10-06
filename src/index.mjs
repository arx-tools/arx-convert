import fs from 'fs'
import DLF from '../src/dlf/DLF.mjs'
import FTS from '../src/fts/FTS.mjs'

const { readFile, writeFile } = fs.promises

const cmd = process.argv.slice(2)[0]

  ; (async () => {
    if (cmd === 'dlf-to-json') {
      const rawDlf = await readFile('./test/files/level8.dlf.unpacked')
      await writeFile('E:/level8.dlf.json', JSON.stringify(DLF.load(rawDlf), 0, 4), 'utf-8')
    }

    if (cmd === 'fts-to-json') {
      const rawFts = await readFile('./test/files/fast.fts.unpacked')
      await writeFile('E:/fast.fts.json', JSON.stringify(FTS.load(rawFts), 0, 4), 'utf-8')
    }

    if (cmd === 'json-to-dlf') {
      const jsonDlf = JSON.parse(await readFile('E:/level8.dlf.json', 'utf-8'))
      await writeFile('E:/level8.dlf.mod.unpacked', DLF.save(jsonDlf))
    }

    if (cmd === 'json-to-fts') {
      const jsonFts = JSON.parse(await readFile('E:/fast.fts.json', 'utf-8'))
      await writeFile('E:/fast.fts.mod.unpacked', FTS.save(jsonFts))
    }

    console.log('finished without any errors')
  })()
