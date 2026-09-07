#!/usr/bin/env node
// Syncs/validates the shared $defs primitives of schemas/defs.json into the self-contained
// format schemas (schemas/*.schema.json).
//
// usage:
//   node scripts/schemas.ts sync   rewrites the format schemas in place
//   node scripts/schemas.ts check  exits with 1 when the format schemas are out of sync
//
// An optional schemas directory can be given as the last argument (used by tests):
//   node scripts/schemas.ts check /tmp/schemas-copy
//
// The format schemas stay self-contained: every def they reference with a "#/$defs/x" $ref has
// to be defined in the same file. The shared primitives are maintained in a single place
// (schemas/defs.json) and this script injects/updates the copies, so they can never drift apart.
// Referencing a def that is neither defined locally nor in defs.json is an error - this is what
// catches accidentally using a def that only exists in another format schema.
// This file only uses erasable TypeScript syntax so that node.js can run it with type stripping.
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_SCHEMAS_DIR = 'schemas'
const DEFS_FILENAME = 'defs.json'
const REF_PREFIX = '#/$defs/'

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function loadJson(filename: string): Promise<JsonObject> {
  return JSON.parse(await readFile(filename, 'utf8')) as JsonObject
}

function deepEqual(a: unknown, b: unknown): boolean {
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
    const bArray = b as unknown[]
    if (a.length !== bArray.length) {
      return false
    }

    return a.every((value, index) => {
      return deepEqual(value, bArray[index])
    })
  }

  if (typeof a === 'object') {
    const aObject = a as JsonObject
    const bObject = b as JsonObject
    const keysA = Object.keys(aObject)
    const keysB = Object.keys(bObject)
    if (keysA.length !== keysB.length) {
      return false
    }

    return keysA.every((key) => {
      return Object.hasOwn(bObject, key) && deepEqual(aObject[key], bObject[key])
    })
  }

  return false
}

/**
 * Collects every "#/$defs/name" reference name found in the given JSON value.
 */
function collectRefNames(value: unknown, refNames: Set<string> = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefNames(item, refNames)
    }
  } else if (isObject(value)) {
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
function requiredSharedDefs(referencedNames: Set<string>, canonicalDefs: JsonObject): Set<string> {
  const required = new Set<string>()

  function visit(name: string): void {
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
function syncSchema(doc: JsonObject, canonicalDefs: JsonObject): { changed: boolean; newDoc: JsonObject } {
  const referencedNames = collectRefNames(doc)
  const required = requiredSharedDefs(referencedNames, canonicalDefs)

  let sourceDefs: JsonObject
  if (isObject(doc.$defs)) {
    sourceDefs = doc.$defs
  } else {
    sourceDefs = {}
  }

  const newDefs: JsonObject = {}
  for (const [name, def] of Object.entries(sourceDefs)) {
    if (name in canonicalDefs) {
      if (!required.has(name)) {
        continue // unreferenced shared defs are not kept around
      }

      if (!deepEqual(def, canonicalDefs[name])) {
        throw new Error(
          `"${name}" is defined in defs.json, but this file defines it differently - remove the local copy, sync will inject the canonical definition`,
        )
      }
    }

    newDefs[name] = def
  }

  for (const name of Object.keys(canonicalDefs)) {
    if (required.has(name) && !(name in newDefs)) {
      newDefs[name] = structuredClone(canonicalDefs[name])
    }
  }

  const newDoc: JsonObject = { ...doc, $defs: newDefs }

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

// ---------------------------------

const [command, schemasDirArg] = process.argv.slice(2)
if (command !== 'sync' && command !== 'check') {
  console.error('usage: node scripts/schemas.ts <sync|check> [schemasDir]')
  process.exit(1)
}

const schemasDir = path.resolve(schemasDirArg ?? DEFAULT_SCHEMAS_DIR)
const defsDoc = await loadJson(path.join(schemasDir, DEFS_FILENAME))

const canonicalDefsValue = defsDoc.$defs
if (!isObject(canonicalDefsValue) || Object.keys(canonicalDefsValue).length === 0) {
  console.error(`"${DEFS_FILENAME}" has no $defs`)
  process.exit(1)
}

const canonicalDefs = canonicalDefsValue

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

  let result: { changed: boolean; newDoc: JsonObject } | undefined
  try {
    result = syncSchema(doc, canonicalDefs)
  } catch (error) {
    console.error(`${filename}: ${(error as Error).message}`)
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
