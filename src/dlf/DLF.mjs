import { times } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import Scene from './Scene.mjs'
import InteractiveObject from './InteactiveObject.mjs'
import Light from '../common/Light.mjs'
import Fog from './Fog.mjs'
import PathHeader from './PathHeader.mjs'
import Pathways from './Pathways.mjs'
import LightingHeader from '../common/LightingHeader.mjs'

export default class DLF {
  static load(decompressedBuffer) {
    const file = new BinaryIO(decompressedBuffer.buffer)

    const {
      numberOfScenes,
      numberOfInteractiveObjects,
      numberOfNodes,
      numberOfNodeLinks,
      numberOfZones,
      numberOfLights,
      numberOfFogs,
      numberOfBackgroundPolygons,
      numberOfIgnoredPolygons,
      numberOfChildPolygons,
      numberOfPaths,
      ...header
    } = Header.readFrom(file)

    const data = {
      header: header,
      scene: numberOfScenes > 0 ? Scene.readFrom(file) : null,
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects),
    }

    if (header.lighting > 0) { // TODO: is this a boolean?
      const { numberOfLights, ...lightingHeader } = LightingHeader.readFrom(file)

      data.lighting = {
        header: lightingHeader,
        colors: file.readUint32Array(numberOfLights) // TODO is apparently BGRA if it's in compact mode.
      }
    } else {
      data.lighting = null
    }

    const lightingFileExists = true // TODO check whether a lighting file (llf) exist
    if (lightingFileExists) {
      file.readInt8Array(Light.sizeOf() * (header.version < 1.003 ? 0 : numberOfLights)) // TODO make a method to indicate, that we are wasting these bytes on purpose
      data.lights = [] // TODO: read llf file data
    } else {
      data.lights = times(() => Light.readFrom(file), header.version < 1.003 ? 0 : numberOfLights)
    }

    data.fogs = times(() => Fog.readFrom(file), numberOfFogs)

    // waste bytes if format has newer version
    if (header.version >= 1.001) {
      file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64)) // TODO: what are these magic numbers?
    }

    data.paths = times(() => {
      const { numberOfPathways, ...header } = PathHeader.readFrom(file)
      const pathways = times(() => Pathways.readFrom(file), numberOfPathways)

      return {
        header,
        pathways
      }
    }, numberOfPaths)

    return data
  }

  static save(json) {
    return Buffer.from([])
  }
}
