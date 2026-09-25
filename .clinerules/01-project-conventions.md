# Project conventions

## Language and files

- **TypeScript only**: every new file is `.ts`, there are no `.js`/`.mjs` files in the repository
  (`dist` is generated, `scripts/schemas.ts` is run by node.js' native typescript support)
- node.js **>= 22.18.0** is needed for the tooling (`scripts`, tests) because of the native type stripping;
  the published package keeps `engines.node >= 18` - never raise it for a tooling reason
- the generated JSON is the public output of the library, treat a change in its shape as a breaking change

## Code style

- linting/formatting is `xo` with the config in `xo.config.ts` (2 spaces, no semicolons, single quotes,
  120 columns, prettier through xo). Always run `npm run lint` after a change.
- rules which show up in every review:
  - no ternary (`no-ternary`), use if/else
  - `operator-assignment: never` (`position = position + 4`, never `+=`) and
    `logical-assignment-operators: never`
  - explicit return types on every function
  - function declarations instead of `const foo = () => ...`, and `arrow-body-style: always`
    (the arrow bodies start on a new line with `return`)
  - `curly: all`, `guard-for-in: off`, `no-await-in-loop: off`, `no-bitwise: off`
  - the wrapper objects are never called as conversion functions: `String(value)` is `value.toString()`,
    `Number(value)` is `Number.parseFloat(value)` (or `Number.parseInt(value, 10)`), `Boolean(value)` is an
    explicit comparison - the wrappers coerce everything, `Number(null)` and `Number('')` are `0`
- imports use the `@bin`, `@common`, `@dlf`, `@fts`, `@llf`, `@ftl`, `@tea`, `@amb` aliases; their order is
  enforced by `@trivago/prettier-plugin-sort-imports` (see `.prettierrc`)
- type-only imports are separate (`import type { ... }`), see `consistent-type-imports` in the config

## File operations

- **no synchronous file operations**: `readFileSync`, `writeFileSync`, `readdirSync`, `existsSync`,
  `mkdirSync`, `cpSync`, `rmSync`, `statSync` and their friends are banned everywhere (`src`, `scripts`,
  `tests`). They block the whole process, so nothing next to them could ever run in parallel. Import from
  `node:fs/promises` and `await` the call - `src/bin/helpers.ts` is the reference
- an existence check is `await access()` (or the read itself) in a try/catch, never `existsSync()`
- the blocking process calls are replaced as well: `spawnSync`/`execSync` are `spawn`/`execFile`, awaited
- a helper which touches the file system is `async` and returns a `Promise`, even when its callers run it
  one by one today - the async signature is what keeps the option of parallelizing them open
- `createReadStream()` and `createWriteStream()` are the only ones which stay in `node:fs` (they have no
  `node:fs/promises` counterpart and they don't block)

## JSDoc and comments

- every format class/type/field which mirrors a piece of the binary format links to the exact line of the
  ArxLibertatis source:
  `@see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h#L73`
- useful functions get an `@example` block with a small js snippet
- comments are lowercase and short
- binary fields which are read but not used, or written back with a hardcoded value, get a **single line
  trailing comment** in the `// <field> - always <value>` form, e.g.:

```ts
binary.readInt16() // paddy - unused by Arx, always 0
binary.readInt16() // flags - always 0
binary.writeFloat32(50) // radius
```

- **no module level constants for the format values**: the maintainer prefers the literal value in the call
  with the trailing comment (a constant name hides the actual on-disk value). Named constants are used for
  the things which are not format data (e.g. `MAX_SIGNIFICANT_DIGITS_OF_FLOAT32`)

## Working style

- **never commit or push**: prepare the changes, show the diff and let the maintainer commit
- ask before anything destructive (deleting files, force push, rewriting history, dropping data)
- when a format question comes up, check the ArxLibertatis source (it is checked out at
  `../ArxLibertatis/src`) for the field before changing anything
- data driven decisions: measure on the game files (see `docs/`) and write the numbers into the issue or the
  documentation
