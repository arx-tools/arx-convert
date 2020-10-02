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

    const header = Header.readFrom(file)

    const data = {
      header: header,
      scene: header.numberOfScenes > 0 ? Scene.readFrom(file) : null,
      interactiveObjects: times(() => InteractiveObject.readFrom(file), header.numberOfInteractiveObjects),
    }

    if (header.lighting > 0) {
      const lightingHeader = LightingHeader.readFrom(file)

      data.lighting = {
        header: lightingHeader,
        colors: file.readUint32Array(lightingHeader.numberOfLights) // TODO is apparently BGRA if it's in compact mode.
      }
    } else {
      data.lighting = null
    }

    const numberOfLights = header.version < 1.003 ? 0 : header.numberOfLights

    const lightingFileExists = true // TODO check whether a lighting file (llf) exist
    if (lightingFileExists) {
      file.readInt8Array(Light.sizeOf() * numberOfLights) // TODO make a method to indicate, that we are wasting these bytes on purpose
      data.lights = [] // TODO: read llf file data
    } else {
      data.lights = times(() => Light.readFrom(file), numberOfLights)
    }

    data.fogs = times(() => Fog.readFrom(file), header.numberOfFogs)

    // waste bytes if format has newer version
    if (header.version >= 1.001) {
      file.readInt8Array(header.numberOfNodes * (204 + header.numberOfNodeLinks * 64))
    }

    data.paths = times(() => {
      const header = PathHeader.readFrom(file)
      const pathways = times(() => Pathways.readFrom(file), header.numberOfPathways)

      return {
        header,
        pathways
      }
    }, header.numberOfPaths)

    delete data.header.numberOfScenes
    delete data.header.numberOfInteractiveObjects
    delete data.header.numberOfNodes
    delete data.header.numberOfNodeLinks
    delete data.header.numberOfZones
    delete data.header.numberOfLights
    delete data.header.numberOfFogs
    delete data.header.numberOfBackgroundPolygons
    delete data.header.numberOfIgnoredPolygons
    delete data.header.numberOfChildPolygons
    delete data.header.numberOfPaths

    data.paths.forEach(path => {
      delete path.header.numberOfPathways
    })

    return data
  }
}
