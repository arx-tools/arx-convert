# JSON size optimization

The work tracked by [issue #17](https://github.com/arx-tools/arx-convert/issues/17). Goal: the JSON should
stay **editable** (plain text, loadable in a browser) while being as small as possible, and it has to stay
lossless - a JSON which was converted back has to produce the same binary as the file it came from.

## The problem

| | `fast.fts` (pkware) | `fast.fts.unpacked` | minified JSON | pretty JSON |
|---|---|---|---|---|
| level 8 | 91.7 KB | 447.5 KB | 1.01 MB | 1.69 MB |
| level 1 | 5.3 MB | 11.2 MB | 47.1 MB | 75.2 MB |

Two reasons for the explosion:

1. the game stores its numbers as 32 bit floats, but `JSON.stringify()` prints the 64 bit double
   representation of them with up to 17 significant digits (`0.9932892322540283` instead of `0.99328923`)
2. the polygons dominate the output: on level 1 they are 88.6% of the generated JSON
   (58,963 polygons, of which 37,713 are quads and 21,250 are triangles)

## What has been done

### float32 values are written in their shortest form

Every number token which is **exactly representable as a float32** (`Math.fround(value) === value`) is
rewritten to the shortest decimal string which still parses back to a value rounding to the same float32
(`src/common/float32.ts`, applied by `stringifyToJSON()` in `src/bin/helpers.ts`).

- only number tokens containing a `.` or an `e` are touched, `JSON.stringify()` already prints integers in
  their shortest form
- the scanner is JSON aware, so numbers inside strings (file names) are never touched
- computed doubles (like the `uint8 / 255` color alphas) keep their precision - they are not exactly
  representable as a float32, so they are left alone

Measured with a minified output, without a single byte of precision lost:

| | before | after | saving |
|---|---|---|---|
| level 8 | 1,245,203 B | 1,010,614 B | -18.8% |
| level 1 | 60,982,033 B | 47,094,794 B | -22.8% |

The JSON is minified by default, `--format`, `--pretty` or `--prettify` asks for the formatted output.

### Constants are not written into the JSON

The anchor fields `radius`, `height` and `isBlocked` are always 50, -165 and false in the 23 levels of the
original game (50,483 anchors), so they are not part of the JSON anymore and are always written back as these
values when saving (`src/fts/AnchorData.ts`). Saving them costs 44 bytes per anchor in a minified and 62 bytes
in a pretty JSON - 0.26% of the minified level 1 output.

The 23 levels were audited for further constants, see [constant-audit.md](constant-audit.md) - there are no
meaningful ones left, the remaining size is dominated by unique data.

### Canonical values

The same value can have multiple representations in the data, and a JSON round trip has to produce the same
output as loading and saving the binary directly. While reading, every float32 is normalized
(`src/common/BinaryIO.ts` > `readFloat32()`):

- `NaN` and `Infinity` become `0` - JSON can't represent them, they would become `null` (which is also invalid
  per the schema) and `0` again when saving
- `-0` becomes `0`

The second one is a deliberate trade-off: it makes the regenerated files differ from the original ones in more
bytes (1 byte per `-0`, e.g. 5,553 bytes in level 1), but the data has a single representation and the two
conversion paths (JSON and binary) produce the exact same output.

## What is left

| | idea | measured saving |
|---|---|---|
| 1 | tuple representation: `Vec3` as `[x, y, z]`, a vertex as `[x, y, z, u, v]`, a room's EPData as `[cellX, cellY, polygonIdx]` | ~9.4 MB (level 1) |
| 2 | sparse `cells`: 25,600 entries per level, of which only ~1,900-3,500 are not empty | small |
| 3 | re-measure the levels after every change | - |
| 4 | (rejected) dropping the 4th vertex of triangles, the `norm`/`norm2`/`normals` fields or `llfColorIdx` - all of them are lossy or needed by the game | - |

Ideas which were measured and rejected because they are a lot of work for ~0.01%: not writing the dead data
of portals (`norm2`, the `rhw` of vertices 1..3) into the JSON, see [constant-audit.md](constant-audit.md).

## How the numbers were measured

- the files are converted with the CLI (`arx-convert fast.fts.unpacked --from=fts --to=json ...`), then the
  binary is rebuilt with `FTS.save(JSON.parse(text), false)` and compared with the original `.unpacked` file
- "lossless" means: `FTS.save(JSON.parse(JSON.stringify(FTS.load(file))))` produces the same bytes as
  `FTS.save(FTS.load(file))`
- see [pitfalls.md](pitfalls.md) for the test files and the decompression
