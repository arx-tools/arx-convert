# The FTS format

Notes collected while working on the format. The C structs are from
[ArxLibertatis 1.2.1](https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FastSceneFormat.h) -
`arx-convert` links to the exact lines of the original source code in the JSDoc of the classes.

## File layout

An FTS file is a *partially* compressed file: the header is stored as is, only the scene data after it is
compressed with the pkware/implode algorithm (see [pitfalls.md](pitfalls.md) about decompression).

| Offset | Size | Content |
|---|---|---|
| `0` | 280 | `UNIQUE_HEADER` (`FtsHeader`) |
| `280` | `uniqueHeaders × 768` | `UNIQUE_HEADER3` entries (`.scn` file list + check data) |
| `280 + uniqueHeaders × 768` | rest of the file | the compressed scene data |

The size of the uncompressed part (called *offset* by `explode`) is therefore
`280 + numberOfUniqueHeaders × 768`:

| unique headers | offset | example |
|---|---|---|
| 2 | 1816 | 21 of the 23 levels |
| 1 | 1048 | level 10 |
| 3 | 2584 | level 5 |

`node tests/tools/fts-offsets.ts` prints this offset (and the size of the unpacked pair) for the fixtures of the
[test files](https://github.com/arx-tools/pkware-test-files), and checks the unique header count of a
compressed file against its unpacked pair.

`UNIQUE_HEADER` (`arx-convert`: `FtsHeader`) is:

```c
struct UNIQUE_HEADER {
    char path[256];       // e.g. "C:\ARX\Game\Graph\Levels\level2\" - never read by the game
    s32 count;            // number of UNIQUE_HEADER3 entries
    f32 version;          // always 0.141 (FTS_VERSION)
    s32 uncompressedsize; // size of the scene data *after* the header
    s32 pad[3];           // ?
};
```

Two things follow from this:

- the decompressed file is `offset + uncompressedsize` bytes long - a handy way to verify a decompression
- the `path` field is **never read by the game** (the loader only uses `version`, `count` and
  `uncompressedsize`), it only carries the level number in textual form

`path` is where `levelIdx` comes from: early builds kept the assets on a shared Windows drive, so the path can
be `\\ARKANESERVER\Public\Arx\Game\Graph\Levels\Level5\` instead of `C:\ARX\Game\Graph\Levels\level5\` - see
`levelIdxFromPath()` in `src/common/helpers.ts`.

## Scene header

`FAST_SCENE_HEADER` follows the unique headers inside the decompressed data: `version` (again), `sizex` and
`sizez` (always 160x160 = `MAP_WIDTH_IN_CELLS` x `MAP_DEPTH_IN_CELLS`), `nb_textures`, `nb_polys`,
`nb_anchors`, `playerpos`, `Mscenepos` (the position of the scene in the world), `nb_portals`, `nb_rooms`.

## Cells and polygons

The 160x160 grid is stored cell by cell: every cell holds a polygon count and the polygons themselves. A
polygon belongs to a cell based on the average of the x and z coordinates of its **first three** vertices
(`getCellCoords()`); a handful of vertex triples add up to an exact multiple of 300, those are listed in
`COORDS_THAT_ROUND_UP` because they have to be rounded up instead of down. `arx-convert` stores the polygons
in a flat `polygons` array in the JSON and keeps the cell coordinates in `rooms[].polygons[]`; the cell
assignment is recalculated when saving, which is why `getCellCoords()` rounds the coordinates back to
float32 first.

```c
struct FAST_EERIEPOLY {
    FAST_VERTEX v[4];  // x, z, y, u, v - the y before x order is not a typo
    s32 tex;           // index of the texture container
    SavedVec3 norm;    // the normal of the polygon
    SavedVec3 norm2;   // used by the renderer (Scene.cpp), not derivable from norm
    SavedVec3 nrml[4]; // per vertex normals, not derivable from norm/norm2
    f32 transval;      // opacity type and amount
    f32 area;          // used by the collision code (Collisions.cpp)
    s32 type;          // ArxPolygonFlags, the Quad flag decides whether it is a triangle or a quad
    s16 room;
    s16 paddy;         // unused, the game never reads it - the files contain garbage in it
};
```

The 4th vertex of a triangle is **not** always zero: in level 1 only 4 of the 21,250 triangles have a zero
there, the rest carries garbage left behind by the original editor (in level 1 only two distinct values
repeat). It cannot be dropped without changing the data.

## Anchors

`FAST_ANCHOR_DATA` (24 bytes) is followed by `nb_linked` 32 bit integers, the indices of the linked anchors:

```c
struct FAST_ANCHOR_DATA {
    SavedVec3 pos;
    f32 radius;
    f32 height;
    s16 nb_linked;
    s16 flags; // FastAnchorFlagBlocked = 1 << 3
};
```

`radius` and `height` are used by the game as a filter: an anchor can only be used by an NPC whose physics
cylinder is at least as tall as `height` and at most as wide as `radius` (`NPC.cpp` > `AnchorData_GetNearest()`
and `PathFinder.cpp`). All 50,483 anchors of the 23 levels of the original game use the same "no restriction"
values (`radius`: 50, `height`: -165, `flags`: 0), so `arx-convert` does not write them into the JSON and
always writes these values back when saving - see [constant-audit.md](constant-audit.md).

`numberOfLinkedAnchors` is stored in the file but not in the JSON, it is derived from `linkedAnchors.length`
when saving.

## Portals

`EERIE_SAVE_PORTALS` is a `SAVE_EERIEPOLY` followed by the two rooms, the `useportal` flag and a padding
value. `SAVE_EERIEPOLY` is a different struct than `FAST_EERIEPOLY`: it has `min`, `max`, `center`, a 128 byte
`unused` block, `tex`, `misc`, and its vertices also carry a color, a specular color, texture coordinates and
an `rhw` value.

The game reads the following fields of a portal: `room_1`, `room_2`, `useportal`, `center`, `min`, `max`,
`norm`, the *positions* of all 4 vertices and **only the `rhw` of the first vertex**
(`portal.poly.rhw = epo->poly.v[0].rhw;`). Everything else - `norm2`, `nrml[4]`, `tex`, `transval`, `area` and
the `rhw` of vertices 1..3 - is dead data for portals. `arx-convert` keeps them in the JSON (they are only
required to be exactly right for the fields the game reads) and already writes the hardcoded or zero values
back, e.g. `binary.writeFloat32(0)` for the `rhw` of the vertices after the first one.

`type` is always 64 (`ArxPolygonFlags.Quad`), except two polygons in level 2 where it is 0 - for those the
game recalculates the 4th vertex as the midpoint of vertices 1 and 2.

## Room distances

`nb_rooms × nb_rooms` entries of `ROOM_DIST_DATA_SAVE`: a `distance` (-1 means "use truedist"), a start
position and an end position. Some files contain NaN values in these positions, they are normalized to 0 (see
[json-optimization.md](json-optimization.md)).

