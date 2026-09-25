// Reports every value of the parsed documents which a JSON can not represent: `NaN`, `Infinity`, `-0` and
// `null`. A clean run over the fixtures proves that `BinaryIO.readFloat32()` normalizes them and that the
// JSON an editor reads is valid - see docs/pitfalls.md.
//
// usage:
//   node tests/tools/nan-finder.ts                          every FTS fixture
//   node tests/tools/nan-finder.ts dlf llf                  the fixtures of the given formats
//   node tests/tools/nan-finder.ts some/file.dlf.unpacked   a single file
import process from 'node:process'
import { visitValues } from '../fixtures.ts'
import { forEachDocument } from './documents.ts'

function describe(value: number): string {
  if (Object.is(value, -0)) {
    return '-0'
  }

  return value.toString()
}

let documents = 0
let problems = 0

await forEachDocument(process.argv.slice(2), ({ name, document }) => {
  documents = documents + 1

  visitValues(document, (jsonPath, value) => {
    if (typeof value === 'number' && (!Number.isFinite(value) || Object.is(value, -0))) {
      problems = problems + 1
      console.log(`${name} ${jsonPath} = ${describe(value)}`)
    }

    if (value === null) {
      problems = problems + 1
      console.log(`${name} ${jsonPath} is null`)
    }
  })
})

console.log(`${documents} documents, ${problems} values a JSON can not represent`)
