#!/usr/bin/env node
// Syncs/validates the shared $defs primitives of schemas/defs.json into the self-contained
// format schemas (schemas/*.schema.json).
//
// usage:
//   node scripts/schemas.mjs sync   rewrites the format schemas in place
//   node scripts/schemas.mjs check  exits with 1 when the format schemas are out of sync
//
// An optional schemas directory can be given as the last argument (used by tests):
//   node scripts/schemas.mjs check /tmp/schemas-copy
//
// The format schemas stay self-contained: every def they reference with a "#/$defs/x" $ref has
// to be defined in the same file. The shared primitives are maintained in a single place
// (schemas/defs.json) and this script injects/updates the copies, so they can never drift apart.
// Referencing a def that is neither defined locally nor in defs.json is an error - this is what
// catches accidentally using a def that only exists in another format schema.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_SCHEMAS_DIR = 'schemas'
const DEFS_FILENAME = 'defs.json'
const REF_PREFIX = '#/$defs/'

async function loadJson(filename) {
  return JSON.parse(await readFile(filename, 'utf8'))
}

function deepEqual(a, b) {
  if (a === b) {
    return true
  }

  if (typeof a !== typeof b || a === null || b === null) {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false
  }

  if (Array.isArray(a)) {
    if (a.length !== b.length) {
      return false
    }

    return a.every((value, index) => {
      return deepEqual(value, b[index])
    })
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) {
      return false
    }

    return keysA.every((key) => {
      return Object.hasOwn(b, key) && deepEqual(a[key], b[key])
    })
  }

  return false
}

/**
 * Collects every "#/$defs/name" reference name found in the given JSON value.
 */
function collectRefNames(value, refNames = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefNames(item, refNames)
    }
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string' && child.startsWith(REF_PREFIX)) {
        refNames.add(child.slice(REF_PREFIX.length))
      } else {
        collectRefNames(child, refNames)
      }
    }
  }

  return refNames
}

/**
 * The names of the shared defs a format schema needs: the referenced shared defs plus every
 * shared def they themselves reference (for example `color` references `uint8`).
 */
function requiredSharedDefs(referencedNames, canonicalDefs) {
  const required = new Set()

  function visit(name) {
    if (required.has(name)) {
      return
    }

    required.add(name)

    for (const ref of collectRefNames(canonicalDefs[name])) {
      if (ref in canonicalDefs) {
        visit(ref)
      }
    }
  }

  for (const name of referencedNames) {
    if (name in canonicalDefs) {
      visit(name)
    }
  }

  return required
}

/**
 * Returns a copy of the format schema with its shared defs brought in sync with the canonical
 * ones. Throws an Error describing the problem when the schema references an undefined def or
 * locally overrides a shared def with different content.
 */
function syncSchema(doc, canonicalDefs) {
  const referencedNames = collectRefNames(doc)
  const required = requiredSharedDefs(referencedNames, canonicalDefs)

  const newDefs = { ...doc.$defs }

  for (const name of Object.keys(newDefs)) {
    if (name in canonicalDefs) {
      if (!required.has(name)) {
        delete newDefs[name] // unreferenced shared defs are not kept around
      } else if (!deepEqual(newDefs[name], canonicalDefs[name])) {
        throw new Error(
          `"${name}" is defined in defs.json, but this file defines it differently - remove the local copy, sync will inject the canonical definition`,
        )
      }
    }
  }

  for (const name of Object.keys(canonicalDefs)) {
    if (required.has(name) && !(name in newDefs)) {
      newDefs[name] = structuredClone(canonicalDefs[name])
    }
  }

  const newDoc = { ...doc, $defs: newDefs }

  for (const ref of collectRefNames(newDoc)) {
    if (!(ref in newDefs)) {
      throw new Error(
        `"#/$defs/${ref}" is referenced, but it is not defined in this file nor in defs.json. If it's only defined in another format schema and you want to share it, move it into defs.json`,
      )
    }
  }

  return {
    changed: !deepEqual(doc, newDoc),
    newDoc,
  }
}

async function main() {
  const [command, schemasDirArg] = process.argv.slice(2)
  if (command !== 'sync' && command !== 'check') {
    console.error('usage: node scripts/schemas.mjs <sync|check> [schemasDir]')
    process.exit(1)
  }

  const schemasDir = path.resolve(schemasDirArg ?? DEFAULT_SCHEMAS_DIR)

  const defsDoc = await loadJson(path.join(schemasDir, DEFS_FILENAME))
  const canonicalDefs = defsDoc.$defs
  if (canonicalDefs === undefined || Object.keys(canonicalDefs).length === 0) {
    console.error(`"${DEFS_FILENAME}" has no $defs`)
    process.exit(1)
  }

  // defs.json has to be self-contained
  for (const [name, def] of Object.entries(canonicalDefs)) {
    for (const ref of collectRefNames(def)) {
      if (!(ref in canonicalDefs)) {
        console.error(`"${DEFS_FILENAME}": "${name}" references "#/$defs/${ref}", which is not defined in defs.json`)
        process.exit(1)
      }
    }
  }

  const schemaFilenames = await readdir(schemasDir)
  const schemaFiles = schemaFilenames
    .filter((filename) => {
      return filename.endsWith('.schema.json')
    })
    .sort()

  if (schemaFiles.length === 0) {
    console.error(`no *.schema.json files found in "${schemasDir}"`)
    process.exit(1)
  }

  let hadErrors = false
  let isOutOfSync = false

  for (const filename of schemaFiles) {
    const filePath = path.join(schemasDir, filename)
    const doc = await loadJson(filePath)

    let result
    try {
      result = syncSchema(doc, canonicalDefs)
    } catch (error) {
      console.error(`${filename}: ${error.message}`)
      hadErrors = true
      continue
    }

    if (result.changed) {
      isOutOfSync = true
      if (command === 'sync') {
        await writeFile(filePath, JSON.stringify(result.newDoc, null, 2))
        console.error(`${filename}: synced`)
      }
    }
  }

  if (command === 'check') {
    if (isOutOfSync || hadErrors) {
      console.error('the schemas are out of sync with defs.json - run "npm run schemas:sync"')
      process.exit(1)
    }

    console.log('all schemas are in sync with defs.json')
  } else {
    if (hadErrors) {
      console.error('some schemas could not be synced, see the errors above')
      process.exit(1)
    }

    if (!isOutOfSync) {
      console.log('all schemas are already in sync')
    }
  }
}

await main()
