# Schemas

The JSON Schema files of the formats live in `schemas/`, the shared definitions in `schemas/defs.json` - see
[docs/schemas.md](../docs/schemas.md) for the details.

## Rules

- `schemas/defs.json` is the **canonical** source of the shared `$defs` (`uint8`, `float32`, `vector3`, ...).
  The format schemas contain generated copies so they stay self-contained (they are published on their own).
- never hand-edit a shared definition inside a format schema: change `defs.json` and run
  `npm run schemas:sync` (it injects the canonical definitions and drops the ones which are not referenced).
- a `#/$defs/x` reference has to resolve inside the same file - `npm run schemas:check` fails on a reference
  which is neither defined locally nor in `defs.json`.
- `npm run schemas:check` runs in `prepublishOnly`, an out-of-sync schema can not be published. It also runs
  before a release, together with `npm run lint`.
- the tooling needs node.js >= 22.18.0 (native typescript support). The published package does not.
- after changing the JSON shape of a format, update its schema in the same commit.
- the schema of a field which is stored as a 32 bit float in the binary references `#/$defs/float32`; integer
  fields never use it.

## Example workflow

```sh
# add/change a shared definition
vim schemas/defs.json
npm run schemas:sync     # rewrites the format schemas
npm run schemas:check    # has to exit with 0, prints the problems otherwise
```
