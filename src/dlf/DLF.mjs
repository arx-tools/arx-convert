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
  load(decompressedBuffer) {
    const file = new BinaryIO(decompressedBuffer.buffer)

    const header = new Header()
    header.readFrom(file)
    this.header = header

    if (this.header.numberOfScenes !== 0) {
      this.scene = new Scene()
      this.scene.readFrom(file)
    }

    this.interactiveObjects = times(() => {
      const inter = new InteractiveObject()
      inter.readFrom(file)
      return inter
    }, this.header.numberOfInteractiveObjects)

    if (this.header.lighting > 0) {
      const lightingHeader = new LightingHeader()
      lightingHeader.readFrom(file)

      this.lighting = {
        header: lightingHeader,
        colors: file.readUint32Array(lightingHeader.numberOfLights) // TODO is apparently BGRA if its in compact mode.
      }
    } else {
      this.lighting = {}
    }

    const numberOfLights = this.header.version < 1.003 ? 0 : this.header.numberOfLights

    const lightingFile = true // TODO check whether a lighting file (llf) exist
    if (lightingFile) {
      // skip lights in dlf
      const sizeofLight = Light.sizeOf()
      file.readUint8Array(sizeofLight * numberOfLights)
      this.lights = []
    } else {
      // load lights from dlf
      this.lights = times(() => {
        const light = new Light()
        light.readFrom(file)
        return light
      }, numberOfLights)
    }

    this.fogs = times(() => {
      const fog = new Fog()
      fog.readFrom(file)
      return fog
    }, this.header.numberOfFogs)

    // skip nodes for newer versions
    if (this.header.version >= 1.001) {
      file.readInt8Array(this.header.numberOfNodes * (204 + this.header.numberOfNodeLinks * 64))
    }

    this.paths = times(() => {
      const header = new PathHeader()
      header.readFrom(file)

      const pathways = times(() => {
        const pathways = new Pathways()
        pathways.readFrom(file)
        return pathways
      }, header.numberOfPathways)

      return {
        header,
        pathways
      }
    }, this.header.numberOfPaths)

    delete this.header.numberOfScenes
    delete this.header.numberOfInteractiveObjects
    delete this.header.numberOfNodes
    delete this.header.numberOfNodeLinks
    delete this.header.numberOfZones
    delete this.header.numberOfLights
    delete this.header.numberOfFogs
    delete this.header.numberOfBackgroundPolygons
    delete this.header.numberOfIgnoredPolygons
    delete this.header.numberOfChildPolygons
    delete this.header.numberOfPaths

    this.paths.forEach(path => {
      delete path.header.numberOfPathways
    })
  }
}
