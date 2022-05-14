# arx-level-json-converter

Converts Arx Fatalis level data to JSON, YAML, BSON and vice versa.

## installation

`npm i arx-level-json-converter -g`

This will give you access to the following commands:

- `to-json`
- `from-json`
- `to-yaml`
- `from-yaml`
- `to-bson`
- `from-bson`

## examples

`--version` or `-v` will give you the version for any tool

`cat fast.fts | to-json --ext=fts --pretty > fast.fts.json`

`to-json level8.dlf --output=level8.dlf.min.json`

`cat level8.dlf.min.json | from-json --ext=dlf > level8.dlf.repacked`

`from-json fast.fts.json --ext=fts --output=fast.fts.repacked`

`cat level8.dlf.unpacked | to-yaml --ext=dlf > level8.dlf.yml`

`cat level8.dlf.yml | from-yaml --ext=dlf > level8.dlf.unpacked`

`cat level8.dlf.unpacked | to-bson --ext=dlf > level8.dlf.bson`

`cat level8.dlf.bson | from-bson --ext=dlf > level8.dlf.unpacked`
