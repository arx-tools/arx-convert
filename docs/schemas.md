# JSON schemas

The JSON produced by `arx-convert` has a JSON Schema for every format in the `schemas` folder. They are
published through `jsonschema` `$id`-s (e.g. `https://arx-tools.github.io/schemas/fts.schema.json`, the same
URL that is written into the generated JSON as `$schema`).

The schemas are [draft 2020-12](https://json-schema.org/draft/2020-12/schema) and are **self-contained**: the
`$defs` of a format schema contains every definition it references, so a schema can be used on its own (in an
editor, or on [jsonschemavalidator.net](https://www.jsonschemavalidator.net/)).

## The shared definitions

Most of the formats use the same primitives (`uint8`, `uint32`, `positiveInt16`, `positiveInt32`, `float32`,
`vector3`, `color`). These are maintained in a single place, in `schemas/defs.json`, and
`scripts/schemas.ts` injects them into the format schemas:

- `defs.json` is **not published**, it is the canonical source of the shared `$defs`
- every format schema keeps a copy of the definitions it uses, so it stays self-contained
- the copies are **generated**, never hand edited: run `npm run schemas:sync` after changing `defs.json` (or
  after changing which shared definitions a format schema references)
- `npm run schemas:check` exits with 1 when a schema is out of sync - it runs in `prepublishOnly`, so an
  out-of-sync schema can't be published

The script is run with node.js' native typescript support, so it needs node >= 22.18.0 (`engines` is not
raised for it, the published package still works on node >= 18 - see the `dist` output).

## Rules enforced by `scripts/schemas.ts check`

- a `#/$defs/x` reference has to resolve **in the same file**: either `x` is defined locally, or it is in
  `defs.json` and gets injected
- if a definition exists in `defs.json` and a format schema also defines it, they have to be identical -
  otherwise the script asks you to remove the local copy and let `sync` inject the canonical one
- `defs.json` has to be self-contained as well: its definitions may only reference each other
- a shared definition is only injected where it is actually referenced (transitively), unreferenced shared
  definitions are dropped from the format schemas

## Example: the float32 type

The `float32` definition was introduced for the FTS schema (see [json-optimization.md](json-optimization.md))
and describes that the values of those fields are stored as 32 bit floats in the game files, together with how
to encode/decode them in javascript. It lives in `defs.json` now, and the canonical `vector3` references it,
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
