# Testing

## Setup

- the tests use node.js' **built-in test runner**: `"test": "node --test tests/*.test.ts"` - no test framework
  and no extra dependency is added, node.js runs the typescript files with its native type stripping
  (node.js >= 22.18.0, like `scripts/schemas.ts`)
- test files live in `tests/*.test.ts` so they are picked up by `npm test`, the manual diagnostic tools
  (`fts-offsets`, `constant-audit`, `nan-finder`) go into `tests/tools/*.ts` - those are not tests, they are
  not run by `npm test`
- `tests/**/*.ts` has to be part of the xo `files` array in `xo.config.ts` so the tests are linted too

## Fixtures

The game files come from [pkware-test-files](https://github.com/arx-tools/pkware-test-files), checked out next
to this repository (the same convention as [node-pkware](https://github.com/arx-tools/node-pkware)):

```
../pkware-test-files/arx-fatalis/level0/fast.fts.unpacked
../pkware-test-files/arx-fatalis/level0/level0.dlf.unpacked
../pkware-test-files/arx-fatalis/level0/level0.llf.unpacked
```

Resolve it from the repository root and fail with a message which tells where to download it when it is
missing - a silently empty test run would be worse than a failure:

```ts
const testFilesFolder = path.resolve(pathToRepoRoot(), '../pkware-test-files/')
```

The tests only use the **unpacked** files (the pkware compression is not a dependency of this project).

## What is worth asserting

1. **the two conversion paths produce the same output** (the most valuable one, it caught real bugs):
   `Format.save(JSON.parse(JSON.stringify(Format.load(bytes))))` has to equal `Format.save(Format.load(bytes))`
2. **`levelIdx`** matches the number in the folder name of the fixture (for FTS and DLF) - the regression test
   of the `\\ARKANESERVER\...` path fix
3. **no `null` in the generated JSON** and no `NaN`/`Infinity` in the parsed document (the JSON would be
   invalid per the schema)
4. sanity checks per format: the expected top level keys (`header`, `polygons`, `rooms`, ...) exist and the
   counts are positive
5. the tools can't be tested directly, but their results are recorded in `docs/`

## Rules

- real files, no mocks: these are integration tests over the game data
- keep `npm test` fast: the heavy JSON tests run on a couple of small levels by default, and on every fixture
  when `ARX_FULL_TEST=1` is set
- the assertions have to tell **which file** and **what** failed
- a new format or a changed JSON shape gets a new assertion, and the numbers in `docs/` are updated
