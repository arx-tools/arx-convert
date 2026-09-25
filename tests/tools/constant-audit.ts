// Collects the distinct values, the occurrence count and the number of documents of every property path of
// the parsed documents, so fields which are always the same in the game data can be found - the recorded
// results of the last run are in docs/constant-audit.md.
//
// usage:
//   node tests/tools/constant-audit.ts                          every FTS fixture
//   node tests/tools/constant-audit.ts dlf llf                  the fixtures of the given formats
//   node tests/tools/constant-audit.ts --constant               only the paths with a single distinct value
//   node tests/tools/constant-audit.ts some/file.fts.unpacked   a single file
//
// The indices of the arrays of objects are dropped, because the length of those arrays is data in itself
// (`polygons[].transval`). The fixed arity arrays (`vertices`, `normals`) are expanded by index instead.
import process from 'node:process'
import { visitValues } from '../fixtures.ts'
import { forEachDocument } from './documents.ts'

/**
 * The arrays which always have the same length (a polygon has 3 or 4 vertices, the normal of a vertex is a
 * single vector), so their indices are part of the path.
 */
const FIXED_ARITY_ARRAYS = new Set(['vertices', 'normals'])

type Audit = {
  values: Map<string, number>
  occurrences: number
  documents: Set<string>
}

function normalizePath(jsonPath: string): string {
  return jsonPath.replaceAll(/\.([A-Za-z]+)\[(\d+)]/g, (match: string, property: string) => {
    if (FIXED_ARITY_ARRAYS.has(property)) {
      return match
    }

    return `.${property}[]`
  })
}

const audits = new Map<string, Audit>()

function record(jsonPath: string, value: string, documentName: string): void {
  let audit = audits.get(jsonPath)

  if (audit === undefined) {
    audit = { values: new Map<string, number>(), occurrences: 0, documents: new Set<string>() }
    audits.set(jsonPath, audit)
  }

  audit.values.set(value, (audit.values.get(value) ?? 0) + 1)
  audit.occurrences = audit.occurrences + 1
  audit.documents.add(documentName)
}

const args = process.argv.slice(2)
const onlyConstants = args.includes('--constant')
const documentArguments = args.filter((arg) => {
  return !arg.startsWith('--')
})

await forEachDocument(documentArguments, ({ name, document }) => {
  visitValues(document, (jsonPath, value) => {
    if (jsonPath === '$') {
      return
    }

    const normalizedPath = normalizePath(jsonPath)

    if (Array.isArray(value)) {
      record(`${normalizedPath}.length`, value.length.toString(), name)
      return
    }

    if (typeof value === 'object' && value !== null) {
      return
    }

    // a parsed document has only the primitives JSON has, so the value is null, a string, a number or a boolean
    if (value === null) {
      record(normalizedPath, 'null', name)
      return
    }

    if (typeof value === 'string') {
      record(normalizedPath, value, name)
      return
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      record(normalizedPath, value.toString(), name)
    }
  })
})

let constants = 0

for (const jsonPath of [...audits.keys()].toSorted()) {
  const audit = audits.get(jsonPath)

  if (audit === undefined) {
    continue
  }

  if (audit.values.size === 1) {
    constants = constants + 1
  }

  if (onlyConstants && audit.values.size !== 1) {
    continue
  }

  let valueList = ''
  if (audit.values.size <= 4) {
    valueList = `  ${[...audit.values.keys()].join(' | ')}`
  }

  console.log(
    `${jsonPath}  values=${audit.values.size}  occurrences=${audit.occurrences}` +
      `  documents=${audit.documents.size}${valueList}`,
  )
}

let hint = 'use --constant to show only them'
if (onlyConstants) {
  hint = 'showing the constants'
}

console.log(`${audits.size} property paths, ${constants} of them have a single distinct value (${hint})`)
