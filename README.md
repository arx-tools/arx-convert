# arx-level-json-converter

Converts Arx Fatalis level data to JSON, YAML, BSON and vice versa.

## installation

`npm i arx-level-json-converter -g`

This will give you access to the following commands, both do the same:

- `arx-level-json-converter`
- `arx-convert`

### format of the commands

`arx-convert <inputfile> --from=<format> --to=<format> --output=<outputfile>`

the inputfile and --output parameters can be omitted and then the code can be used in pipelines

`cat <inputfile> | arx-convert --from=<format> --to=<format> > <outputfile>`

the format parameter can be one of the following arx formats: `dlf`, `llf`, `fts` and `ftl`(WIP)

and it can also a data format for the other side: `json`, `bson` and `yaml`(can also be spelled as `yml`)

## examples

```sh
# print out version
--version
-v

# convert and fts file to a json through piping
cat fast.fts | arx-convert --from=fts --to=json --pretty > fast.fts.json

# convert a dlf file to a minified json through files
arx-convert level8.dlf --from=dlf --to=json --output=level8.dlf.min.json

# convert a json to a dlf
cat level8.dlf.min.json | arx-convert --from=json --to=dlf > level8.dlf.repacked

# convert json to fts
arx-convert fast.fts.json --from=json --to=fts --output=fast.fts.repacked

# convert dlf to yaml
cat level8.dlf.unpacked | arx-convert --to=yaml --from=dlf > level8.dlf.yml

# convert yaml to dlf
cat level8.dlf.yml | arx-convert --from=yaml --to=dlf > level8.dlf.unpacked

# convert dlf to bson
cat level8.dlf.unpacked | arx-convert --to=bson --from=dlf > level8.dlf.bson

# convert bson to dlf
cat level8.dlf.bson | arx-convert --from=bson --to=dlf > level8.dlf.unpacked
```
