import { times, map } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../binary/BinaryIO.mjs'
import Header from './Header.mjs'
import Scene from './Scene.mjs'
import InteractiveObject from './InteactiveObject.mjs'
import Light from '../common/Light.mjs'
import Fog from './Fog.mjs'
import PathHeader from './PathHeader.mjs'
import Pathways from './Pathways.mjs'
import LightingHeader from '../common/LightingHeader.mjs'
import Color from '../common/Color.mjs'

export default class DLF {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer)

    const {
      numberOfScenes,
      numberOfInteractiveObjects,
      // numberOfNodes,
      // numberOfNodeLinks,
      // numberOfZones,
      numberOfLights,
      numberOfFogs,
      // numberOfBackgroundPolygons,
      // numberOfIgnoredPolygons,
      // numberOfChildPolygons,
      numberOfPaths,
      ...header
    } = Header.readFrom(file)

    const data = {
      meta: {
        type: "dlf",
        numberOfLeftoverBytes: 0
      },
      header: header,
      scene: numberOfScenes > 0 ? Scene.readFrom(file) : null,
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects)
    }

    if (header.lighting > 0) { // TODO: is this a boolean?
      const { numberOfColors } = LightingHeader.readFrom(file)

      data.colors = times(() => Color.readFrom(file, header.version > 1.001), numberOfColors)
    } else {
      data.colors = null
    }

    data.lights = times(() => Light.readFrom(file), header.version < 1.003 ? 0 : numberOfLights)

    data.fogs = times(() => Fog.readFrom(file), numberOfFogs)

    if (header.version > 1.001) {
      // waste bytes
      file.readInt8Array(header.numberOfNodes * (204 + header.numberOfNodeLinks * 64)) // TODO: what are these magic numbers?
    } else {
      // TODO: read data into data.nodes and data.numberOfNodeLinks
    }

    data.paths = times(() => {
      const { numberOfPathways, ...pathHeader } = PathHeader.readFrom(file)

      return {
        header: pathHeader,
        pathways: times(() => Pathways.readFrom(file), numberOfPathways)
      }
    }, numberOfPaths)

    const remainedBytes = decompressedFile.length - file.position
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes
    }

    return data
  }

  static save(json) {
    const header = Header.accumulateFrom(json)
    const scene = Scene.accumulateFrom(json)
    const interactiveObjects = Buffer.concat(map(InteractiveObject.accumulateFrom.bind(InteractiveObject), json.interactiveObjects))

    let lighting
    if (json.header.lighting > 0) {
      const lightingHeader = LightingHeader.accumulateFrom(json)

      const colors = Buffer.concat(map(color => Color.accumulateFrom(color, json.header.version > 1.001), json.colors))

      lighting = Buffer.concat([lightingHeader, colors])
    } else {
      lighting = Buffer.from([])
    }

    const lights = Buffer.concat(map(Light.accumulateFrom.bind(Light), json.lights))
    const fogs = Buffer.concat(map(Fog.accumulateFrom.bind(Fog), json.fogs))

    let nodes
    if (json.header.version >= 1.001) {
      nodes = Buffer.alloc(json.header.numberOfNodes * (204 + json.header.numberOfNodeLinks * 64), 0)
    } else {
      nodes = Buffer.from([])
    }

    const paths = Buffer.concat(map(path => {
      const pathHeader = PathHeader.allocateFrom(path)
      const pathways = Buffer.concat(map(Pathways.allocateFrom.bind(Pathways), path.pathways))

      return Buffer.concat([pathHeader, pathways])
    }, json.paths))

    return Buffer.concat([header, scene, interactiveObjects, lighting, lights, fogs, nodes, paths])
  }
}
