# JSON schemas

The JSON produced by `arx-convert` has a JSON Schema for every format. The sources live in `src/schemas`, the
build generates the published schemas from them into `dist/schemas`, which is what gets published - through
`jsonschema` `$id`-s (e.g. `https://arx-tools.github.io/schemas/fts.schema.json`, the same URL that is written
into the generated JSON as `$schema`).

The schemas are [draft 2020-12](https://json-schema.org/draft/2020-12/schema) and are **self-contained**: the
`$defs` of a format schema contains every definition it references, so a schema can be used on its own (in an
editor, or on [jsonschemavalidator.net](https://www.jsonschemavalidator.net/)).

## Where the files live

| path | what it is |
|---|---|
| `src/schemas/_defs.json` | the canonical source of the shared `$defs` - the underscore marks it as the file which is not a format schema |
| `src/schemas/<format>.schema.json` | the source of a format schema: only the definitions which are local to that format, the shared ones are `$ref`-ed |
| `dist/schemas/<format>.schema.json` | the generated, self-contained schema - a build artifact |

The generation goes in one direction (`src/schemas` -> `dist/schemas`), so there is no sync step and no
committed copy which could go stale. `dist` is git ignored, `npm run build` regenerates it, and `npm test`
(through its `pretest` script) and `prepublishOnly` both run a build.

## The shared definitions

Most of the formats use the same primitives (`uint8`, `uint32`, `positiveInt16`, `positiveInt32`, `float32`,
`vector3`, `color`). These are maintained in a single place, in `src/schemas/_defs.json`, and
`scripts/schemas.ts` injects the ones a source references into the generated schema:

- `_defs.json` is **not published** - neither it nor the format schema sources are part of the package, only
  the generated schemas are
- every generated format schema keeps a copy of the definitions it uses (transitively: `vector3` pulls in
  `float32`), so it stays self-contained
- the injected copies are never hand edited: they are cloned from `_defs.json`, and a source format schema
  which defines one of them is an error
- `npm run schemas:build` writes `dist/schemas` on its own, `npm run schemas:check` validates the sources and
  exits with 1 on a problem - it runs in `prepublishOnly`, so a broken schema source can't be published

The script is run with node.js' native typescript support, so it needs node >= 22.18.0 (`engines` is not
raised for it, the published package still works on node >= 18 - see the `dist` output).

## The version of the generator

The build stamps every generated schema with the release which generated it, in a custom annotation:

```json
"x-generatedBy": "arx-convert@13.0.2"
```

`x-generatedBy` is an unknown keyword for a validator: JSON Schema allows such annotations, they are simply
ignored. It comes from the `name` and `version` of the `package.json` of the repository, the sources do not
carry it, and it makes a copy of a schema traceable - the schemas served on
[arx-tools.github.io](https://github.com/arx-tools/arx-tools.github.io) are copies of `dist/schemas`, and this
is what tells which release that copy came from.

## Rules enforced by `npm run schemas:check`

- a source format schema must not define a name which exists in `_defs.json` (the build injects the canonical
  definition there, a local copy can only be wrong)
- a `#/$defs/x` reference has to resolve **in the same file** after the injection: either `x` is defined in the
  source, or it is a shared definition of `_defs.json`
- `_defs.json` has to be self-contained as well: its definitions may only reference each other
- a shared definition is only injected where it is actually referenced (transitively)

## Example: the float32 type

The `float32` definition was introduced for the FTS schema (see [json-optimization.md](json-optimization.md))
and describes that the values of those fields are stored as 32 bit floats in the game files, together with how
to encode/decode them in javascript. It lives in `_defs.json` now, and the canonical `vector3` references it,
so every format schema which has a `vector3` automatically types its components as `float32` as well.

```json
"vector3": {
  "type": "object",
  "properties": {
    "x": { "$ref": "#/$defs/float32" },
    "y": { "$ref": "#/$defs/float32" },
    "z": { "$ref": "#/$defs/float32" }
  },
  "required": ["x", "y", "z"]
}
```
