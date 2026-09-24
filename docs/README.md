# Documentation

Notes about the binary formats, the design decisions and the tooling of `arx-convert`.

| File | Content |
|---|---|
| [fts-format.md](fts-format.md) | How an FTS file is built up, and which parts of it the game actually reads |
| [json-optimization.md](json-optimization.md) | The JSON size optimization work ([issue #17](https://github.com/arx-tools/arx-convert/issues/17)): measurements, what is done, what is left |
| [constant-audit.md](constant-audit.md) | Audit of the 23 levels of the original game: constant/dead fields, the bugs it uncovered |
| [schemas.md](schemas.md) | How the JSON schemas are kept in sync (`defs.json` + `scripts/schemas.ts`) |
| [pitfalls.md](pitfalls.md) | Common mistakes when working with the game files and this tool |

See also:

- [../README.md](../README.md) - installation, CLI and API usage
- [../ROADMAP.md](../ROADMAP.md) - what is planned next
- [../.clinerules](../.clinerules) - conventions of the codebase
