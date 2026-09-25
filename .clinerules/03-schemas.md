# Schemas

The sources of the JSON Schema files of the formats live in `src/schemas/`, the shared definitions in
`src/schemas/_defs.json`. `npm run build` generates the self-contained, published schemas from them into
`dist/schemas/` - see [docs/schemas.md](../docs/schemas.md) for the details.

## Layout

- `src/schemas/_defs.json` - the canonical shared `$defs` (`uint8`, `float32`, `vector3`, ...); the leading
  underscore marks the file which is not a format schema (the build picks up `*.schema.json`)
- `src/schemas/<format>.schema.json` - the source of a format schema: only the `$defs` which are local to that
  format, the shared ones are `$ref`-ed (`#/$defs/float32`)
- `dist/schemas/<format>.schema.json` - the generated, self-contained schema: a build artifact in `dist/`
  (git ignored), never committed and never edited by hand

## Rules

- the generation goes one way: `src/schemas` -> `dist/schemas`. There is no sync step, and no committed copy
  which could go stale: a build always writes the output from scratch, the sources are the truth.
- a source format schema must not define a name which exists in `_defs.json` - the build injects those
  definitions (transitively, so `vector3` pulls in `float32`), and `npm run schemas:check` fails on a local
  copy of one.
- a `#/$defs/x` reference has to resolve inside the same file after the injection: either `x` is defined in the
  source, or it is a shared definition. `npm run schemas:check` fails on a reference which is neither.
- `npm run schemas:check` runs in `prepublishOnly` (the clean build right after it regenerates `dist/schemas`),
  so a broken schema source can not be published. It also runs before a release, together with `npm run lint`.
- the tooling needs node.js >= 22.18.0 (native typescript support). The published package does not.
- every generated schema is stamped with `x-generatedBy` (`arx-convert@<version>`, read from `package.json`) by
  the build. The sources do not carry it - a published copy has to be traceable back to its release.
- after changing the JSON shape of a format, update its schema source in the same commit.
- the schema of a field which is stored as a 32 bit float in the binary references `#/$defs/float32`; integer
  fields never use it.

## Example workflow

```sh
# add/change a shared definition
vim src/schemas/_defs.json
npm run schemas:build    # regenerates dist/schemas
npm run schemas:check    # has to exit with 0, prints the problems otherwise
```
