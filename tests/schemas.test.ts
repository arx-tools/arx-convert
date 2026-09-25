import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { pathToRepoRoot } from './fixtures.ts'

const SCHEMAS_SCRIPT = 'scripts/schemas.ts'
const SOURCE_DIR = 'src/schemas'
const DEFS_FILENAME = '_defs.json'
const FORMATS = ['amb', 'dlf', 'ftl', 'fts', 'llf', 'tea']

type JsonObject = Record<string, unknown>

type ScriptResult = {
  status: number
  output: string
}

/**
 * Runs `scripts/schemas.ts` with the arguments through node.js itself - the typescript of the script is run
 * with the native type stripping of node.js, the built `dist` is never involved.
 */
async function runSchemasScript(args: string[]): Promise<ScriptResult> {
  const child = spawn(process.execPath, [SCHEMAS_SCRIPT, ...args], {
    cwd: pathToRepoRoot(),
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', (chunk: string) => {
    output = output + chunk
  })
  child.stderr.on('data', (chunk: string) => {
    output = output + chunk
  })

  return new Promise<ScriptResult>((resolve, reject) => {
    child.on('error', reject)

    // a missing status means the process was killed by a signal, which is a failure of the test as well
    child.on('close', (status) => {
      resolve({ status: status ?? -1, output })
    })
  })
}

async function pathExists(filename: string): Promise<boolean> {
  try {
    await access(filename)
    return true
  } catch {
    return false
  }
}

/**
 * Copies `src/schemas/` into a temporary folder, hands it over to `callback` together with an output folder and
 * removes both afterwards, so a test can break a schema source without touching the files of the repository.
 */
async function withSchemasCopy(callback: (schemasFolder: string, outFolder: string) => Promise<void>): Promise<void> {
  const tempFolder = await mkdtemp(path.join(tmpdir(), 'arx-convert-schemas-'))

  try {
    const schemasFolder = path.join(tempFolder, 'src')
    await cp(path.join(pathToRepoRoot(), SOURCE_DIR), schemasFolder, { recursive: true })
    await callback(schemasFolder, path.join(tempFolder, 'out'))
  } finally {
    await rm(tempFolder, { recursive: true, force: true })
  }
}

function schemaFilename(folder: string, format: string): string {
  return path.join(folder, `${format}.schema.json`)
}

async function readSchema(folder: string, format: string): Promise<JsonObject> {
  const text = await readFile(schemaFilename(folder, format), 'utf8')

  return JSON.parse(text) as JsonObject
}

async function writeSchema(folder: string, format: string, schema: JsonObject): Promise<void> {
  await writeFile(schemaFilename(folder, format), JSON.stringify(schema, null, 2))
}

/**
 * The names of every "#/$defs/x" reference found in the given JSON value.
 */
function collectRefNames(value: unknown, refNames: Set<string> = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectRefNames(item, refNames)
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      if (key === '$ref' && typeof child === 'string' && child.startsWith('#/$defs/')) {
        refNames.add(child.slice('#/$defs/'.length))
      } else {
        collectRefNames(child, refNames)
      }
    }
  }

  return refNames
}

void test('schemas.ts check passes on the schema sources of the repository', async () => {
  const { status, output } = await runSchemasScript(['check'])

  assert.equal(status, 0, `schemas.ts check exited with ${status}:\n${output}`)
})

void test('schemas.ts check rejects a reference which is neither local nor shared', async () => {
  await withSchemasCopy(async (schemasFolder) => {
    const schema = await readSchema(schemasFolder, 'fts')
    const properties = (schema.properties ?? {}) as JsonObject
    schema.properties = { ...properties, brokenRef: { $ref: '#/$defs/doesNotExist' } }

    await writeSchema(schemasFolder, 'fts', schema)

    const { status, output } = await runSchemasScript(['check', schemasFolder])

    assert.equal(status, 1, `schemas.ts check exited with ${status} instead of 1:\n${output}`)
    assert.match(output, /#\/\$defs\/doesNotExist/, `schemas.ts check did not name the broken reference:\n${output}`)
  })
})

void test('schemas.ts check rejects a shared definition in a format schema source', async () => {
  await withSchemasCopy(async (schemasFolder) => {
    const sharedDefsText = await readFile(path.join(schemasFolder, DEFS_FILENAME), 'utf8')
    const sharedDefs = JSON.parse(sharedDefsText) as { $defs: JsonObject }
    const schema = await readSchema(schemasFolder, 'fts')
    schema.$defs = { ...((schema.$defs ?? {}) as JsonObject), float32: sharedDefs.$defs.float32 }

    await writeSchema(schemasFolder, 'fts', schema)

    const { status, output } = await runSchemasScript(['check', schemasFolder])

    assert.equal(status, 1, `schemas.ts check exited with ${status} instead of 1:\n${output}`)
    assert.match(output, /shared definition/, `schemas.ts check did not report the shared definition:\n${output}`)
  })
})

void test('schemas.ts build writes self-contained schemas and leaves the sources alone', async () => {
  await withSchemasCopy(async (schemasFolder, outFolder) => {
    const { status, output } = await runSchemasScript(['build', schemasFolder, outFolder])
    assert.equal(status, 0, `schemas.ts build exited with ${status}:\n${output}`)

    for (const format of FORMATS) {
      assert.ok(
        await pathExists(schemaFilename(outFolder, format)),
        `schemas.ts build did not write ${format}.schema.json`,
      )

      const schema = await readSchema(outFolder, format)
      const defs = (schema.$defs ?? {}) as JsonObject
      for (const ref of collectRefNames(schema)) {
        assert.ok(ref in defs, `${format}.schema.json references "#/$defs/${ref}", which is not in its $defs`)
      }
    }

    const fts = await readSchema(outFolder, 'fts')
    const ftsDefs = (fts.$defs ?? {}) as JsonObject
    assert.ok('float32' in ftsDefs, 'the generated fts schema did not get the shared float32 definition')
    assert.ok('vector3' in ftsDefs, 'the generated fts schema did not get the shared vector3 definition')
    assert.ok('vertex' in ftsDefs, 'the generated fts schema lost its local vertex definition')

    const sharedDefsText = await readFile(path.join(schemasFolder, DEFS_FILENAME), 'utf8')
    const sharedNames = Object.keys((JSON.parse(sharedDefsText) as { $defs: JsonObject }).$defs)
    for (const format of FORMATS) {
      const sourceSchema = await readSchema(schemasFolder, format)
      const sourceDefs = (sourceSchema.$defs ?? {}) as JsonObject
      for (const name of sharedNames) {
        assert.ok(
          !(name in sourceDefs),
          `schemas.ts build wrote the shared definition "${name}" back into the ${format} source`,
        )
      }
    }
  })
})

void test('dist/schemas is what the schema sources generate', async () => {
  const distFolder = path.join(pathToRepoRoot(), 'dist', 'schemas')
  assert.ok(
    await pathExists(distFolder),
    'dist/schemas is missing - run "npm run build" first ("npm test" does it through its pretest script)',
  )

  await withSchemasCopy(async (schemasFolder, outFolder) => {
    const { status, output } = await runSchemasScript(['build', schemasFolder, outFolder])
    assert.equal(status, 0, `schemas.ts build exited with ${status}:\n${output}`)

    for (const format of FORMATS) {
      const generated = await readSchema(outFolder, format)
      const dist = await readSchema(distFolder, format)

      assert.deepEqual(dist, generated, `dist/schemas/${format}.schema.json is stale, run "npm run build"`)
    }
  })
})

void test('every generated schema declares the $id the generated JSON points to', async () => {
  const distFolder = path.join(pathToRepoRoot(), 'dist', 'schemas')

  for (const format of FORMATS) {
    const schema = await readSchema(distFolder, format)

    assert.equal(
      schema.$id,
      `https://arx-tools.github.io/schemas/${format}.schema.json`,
      `${format}.schema.json: $id has to match the $schema written into the generated JSON`,
    )
  }
})

void test('every generated schema is stamped with the version of this arx-convert', async () => {
  const packageJsonText = await readFile(path.join(pathToRepoRoot(), 'package.json'), 'utf8')
  const packageJson = JSON.parse(packageJsonText) as { name: string; version: string }
  const distFolder = path.join(pathToRepoRoot(), 'dist', 'schemas')

  for (const format of FORMATS) {
    const schema = await readSchema(distFolder, format)

    assert.equal(
      schema['x-generatedBy'],
      `${packageJson.name}@${packageJson.version}`,
      `${format}.schema.json: x-generatedBy has to name the release which generated it`,
    )
  }
})
