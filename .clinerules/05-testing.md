# Testing

## Setup

- the tests use node.js' **built-in test runner**: `"test": "node --test tests/*.test.ts"` - no test framework
  and no extra dependency is added, node.js runs the typescript files with its native type stripping
  (node.js >= 22.18.0, like `scripts/schemas.ts`)
- `"pretest": "npm run build"` is needed: the tests import the package through its own name (`arx-convert`,
  `arx-convert/utils`) because that is the interface a consumer gets, and node.js resolves it through the
  `exports` of `package.json` - into `dist`. The `@common/...` aliases of `src` are only rewritten by
  `tsc-alias` during a build, so the source can not be loaded by node directly (the relative `.js` imports of
  `src` would not resolve either). A test run with a stale `dist` tests the old code, always use `npm test`
  instead of calling `node --test` by hand.
- `tests/*.test.ts` files are picked up by `npm test`, the manual diagnostic tools (`fts-offsets`,
  `constant-audit`, `nan-finder`) live in `tests/tools/*.ts` together with their shared `documents.ts` - those
  are not tests, `npm test` doesn't run them
- `tests/tsconfig.json` maps the `arx-convert` entry points to the source and enables
  `allowImportingTsExtensions` (node.js needs the explicit `.ts` extension on the relative imports of the
  folder, typescript only allows that with `noEmit`). It is for type checking and linting only - the build
  uses the root tsconfig.json, whose `include` doesn't cover the tests, so `dist` stays free of them. Run it
  with `npx tsc -p tests/tsconfig.json`.
- `tests/**/*.ts` is part of the xo `files` array in `xo.config.ts`, with a block which turns off
  `import-x/order` and `import-x/extensions` (they disagree with the prettier sort-imports plugin about the
  self referencing import). A bare `test()` call has to be `void test()`, `no-floating-promises` requires it.

## Fixtures

The game files come from [pkware-test-files](https://github.com/arx-tools/pkware-test-files), checked out next
to this repository (the same convention as [node-pkware](https://github.com/arx-tools/node-pkware)):

```
../pkware-test-files/arx-fatalis/level0/fast.fts.unpacked
../pkware-test-files/arx-fatalis/level0/level0.dlf.unpacked
../pkware-test-files/arx-fatalis/level0/level0.llf.unpacked
```

`tests/fixtures.ts` resolves them from the repository root (`pathToTestFiles()`, `readFixture()`, ...) and
fails with a message which tells where to download them when they are missing - a silently empty test run
would be worse than a failure. Its helpers are async (see
[01-project-conventions.md](01-project-conventions.md)): a fixture is read once per level at the top of the
test file and the bytes are shared by the tests of that level. The tests only use the **unpacked** files (the
pkware compression is not a dependency of this project) and never write into the fixture folder.

## What is worth asserting

1. **the two conversion paths produce the same output** (the most valuable one, it caught real bugs):
   `Format.save(JSON.parse(compactFloat32Values(JSON.stringify(Format.load(bytes)))))` has to equal
   `Format.save(Format.load(bytes))` - the inner part is what the CLI writes and reads back (`toJsonRoundTrip()`
   in `tests/fixtures.ts`)
2. **`levelIdx`** matches the number in the folder name of the fixture (for every format which stores it in a
   header path) - level 6 is in the default set, because that is where the `\\ARKANESERVER\...` paths and the
   zones show up
3. **no `null` in the generated JSON** and no `NaN`/`Infinity` in the parsed document (the JSON would be
   invalid per the schema)
4. sanity checks per format: the expected top level keys (`header`, `polygons`, `rooms`, ...) exist and the
   counts are positive
5. the files of a level agree with each other (`tests/level-consistency.test.ts`): the LLF stores 3 colors for
   a triangle and 4 for a quad, so its color count pins the polygon count and the flags of the FTS together.
   `dlf.header.numberOfPolygonsInFTS` is **not** asserted: the game data itself disagrees with the FTS in
   level3, level11 and level21, and the game never reads that field.
6. the float32 helpers of the public `arx-convert/utils` entry point have unit tests (`tests/json.test.ts`),
   and the schema tooling is checked by running `scripts/schemas.ts` on a temporary copy of `src/schemas/`
7. the tools can't be tested directly, but their results are recorded in `docs/`

## Rules

- real files, no mocks: these are integration tests over the game data
- keep `npm test` fast: the heavy JSON tests run on a couple of small levels by default (level 8 and level 20,
  39 tests in 1.4 seconds), and on every fixture when `ARX_FULL_TEST=1` is set (287 tests in ~3 minutes)
- the assertions have to tell **which file** and **what** failed
- a new format or a changed JSON shape gets a new assertion, and the numbers in `docs/` are updated
- `assert.equal()` of `node:assert/strict` uses `Object.is()`, so it reports `0` and `-0` as different. Where
  that matters (the float32 round trips) compare with `!==` and `assert.fail()` instead of using `assert.equal()`
- the tools are diagnostics, not tests:
  `node tests/tools/constant-audit.ts [--constant] [fts|dlf|llf] [file.unpacked]` (also works on any file, not
  just on the fixtures) - they need a built `dist` as well

