# arx-level-json-converter

Converts Arx Fatalis level data to JSON or YAML and vice versa.

**IMPORTANT: Arx Fatalis files are partially compressed. See "compression" section for more info**

## installation

`npm i arx-level-json-converter -g`

This will give you access to the following commands, both do the same:

- `arx-level-json-converter`
- `arx-convert`

### Requirements

nodejs 18+ (because the lib uses prefix-only core modules)

### format of the commands

`arx-convert <inputfile> --from=<format> --to=<format> --output=<outputfile> --prettify`

the inputfile and --output parameters can be omitted and then the code can be used in pipelines

`cat <inputfile> | arx-convert --from=<format> --to=<format> > <outputfile>`

the format parameter can be one of the following arx formats: `dlf`, `llf`, `fts`

work in progress formats: `ftl` and `tea`

and it can also a data format for the other side: `json` and `yaml`(can also be spelled as `yml`)

## examples

```sh
# prints out version
--version
-v

# converts an unpacked fts file to a json through piping
cat fast.fts.unpacked | arx-convert --from=fts --to=json --prettify > fast.fts.json

# converts an unpacked dlf file to a minified json through files
arx-convert level8.dlf.unpacked --from=dlf --to=json --output=level8.dlf.min.json

# converts a json to an unpacked dlf
cat level8.dlf.min.json | arx-convert --from=json --to=dlf > level8.dlf.repacked

# converts json to an unpacked fts
arx-convert fast.fts.json --from=json --to=fts --output=fast.fts.repacked

# converts an unpacked dlf to yaml
cat level8.dlf.unpacked | arx-convert --to=yaml --from=dlf > level8.dlf.yml

# converts yaml to an unpacked dlf
cat level8.dlf.yml | arx-convert --from=yaml --to=dlf > level8.dlf.repacked
```

## Compression

Arx Fatalis files are partially compressed with Stormlib Pkware and you need a separate
tool for unpacking/repacking: [node-pkware](https://www.npmjs.com/package/node-pkware)

Also, Arx Fatalis file headers are not constant in size, but there is a tool
that can give you the exact offset you need to pipe into node-pkware: [arx-header-size](https://www.npmjs.com/package/arx-header-size)

Install these tools by running

```sh
npm i node-pkware arx-header-size -g
```

### Example for unpacking

```sh
arx-header-size level3.dlf --format=dlf # this will print out 8520
explode level3.dlf --offset=8520 --output=level3.dlf.unpacked
arx-convert level3.dlf.unpacked --from=dlf --to=yaml --output=level3.dlf.yml
```

### Example for repacking

```sh
arx-convert level3.dlf.yml --from=yaml --to=dlf --output=level3.dlf.repacked
implode level3.dlf.repacked --offset=8520 --binary --large --output=level3.dlf
```
