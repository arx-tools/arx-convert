# Format handling

Rules for the classes which read and write the binary formats (`src/<format>/...`).

## One class per struct

Every structure in the game has a class with three static methods, and they have to stay in sync:

```ts
static readFrom(binary: BinaryIO<ArrayBufferLike>): ArxSomething { ... }
static accumulateFrom(data: ArxSomething): ArrayBuffer { ... }
static sizeOf(): number { ... }
```

- the read order has to match the order of the fields in the C struct (`#pragma pack(push, 1)`, so the sizes
  add up without padding) - the structs are linked in the JSDoc of the type
- **every** field has to be consumed, even the ones which are not used: a skipped field with a wrong size
  shifts everything after it
- `sizeOf()` must return exactly the number of bytes `readFrom()` consumes (and `accumulateFrom()` writes)
- the field order in the binary is not always the logical order, e.g. `FAST_VERTEX` stores y before x - do not
  "fix" it, it is documented in a comment

## Ignored fields and constants

When a field is not written into the JSON, it is either

1. **not read by the game** - then the read is skipped with a trailing comment explaining it, e.g.
   `binary.readInt16() // paddy - unused by Arx, always 0`, or
2. **a constant in the game data** - then the value is documented next to the ignored read
   (`binary.readFloat32() // radius - always 50`) and written back with the literal when saving
   (`binary.writeFloat32(50) // radius`)

Never drop a field which the game reads *and* which can differ between the files - that would make the format
lossy for mods. Verify with the ArxLibertatis source (`../ArxLibertatis/src`) that a field is really unused
before skipping it, and note the result in the code.

## float32 values

- always go through `BinaryIO` (`readFloat32()`, `readVector3()`, ...) and never call `DataView` directly:
  the values have to be normalized while reading (`NaN`/`Infinity`/`-0` -> `0`, see
  [docs/pitfalls.md](../docs/pitfalls.md))
- the shortest form serialization is applied by `stringifyToJSON()` (`src/bin/helpers.ts`), so the JSON of the
  CLI always goes through that function instead of `JSON.stringify()` directly
- a float32 in the JSON only has to round trip *as a float32* - a saved file has to be byte identical with the
  file the JSON came from, which is why `getCellCoords()` rounds the coordinates back to float32 before
  comparing them

## Legacy variants in the game data

The files of the original game are not uniform: the early builds stored their assets on a shared Windows drive
(the header paths can be `\\ARKANESERVER\Public\Arx\...`), values can have multiple representations (`0` and
`-0`), and a few fields contain values JSON can not represent (`NaN`). When a value is parsed out of a file, do
not assume a single layout or a single representation: normalize the values while reading (`readFloat32()`) and
parse the paths leniently (`levelIdxFromPath()` in `src/common/helpers.ts`).

## Changing the JSON shape

- the shape of the generated JSON is a public interface: removing/renaming a field, or changing its type is a
  **breaking change**, note it in the commit (`!`) and in the release notes
- update the matching schema source in `src/schemas/` (see [03-schemas.md](03-schemas.md)) and the `Float32`
  types, and mention the change in `docs/`
- keep the JSON self describing: `$schema` is written by the format classes, the field names are camelCase and
  follow the names of the struct fields
