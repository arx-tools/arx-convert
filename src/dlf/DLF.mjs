import { times } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import Header from './Header.mjs'
import Scene from './Scene.mjs'
import InteractiveObject from './InteactiveObject.mjs'
import Light from './Light.mjs'
import Fog from './Fog.mjs'
import PathHeader from './PathHeader.mjs'
import Pathways from './Pathways.mjs'

export default class DLF {
  load(decompressedBuffer) {
    const body = new BinaryIO(decompressedBuffer.buffer)

    this._readHeader(body)
    this._readScene(body)

    this.interactiveObjects = times(() => {
      const inter = new InteractiveObject()
      inter.readFrom(body)
      return inter
    }, this.header.numberOfInteractiveObjects)

    if (this.header.lighting > 0) {
      // TODO: load lighting
    }

    const numberOfLights = this.header.version < 1.003 ? 0 : this.header.numberOfLights

    const lightingFile = true // does a lighting file (llf) exist?
    if (!lightingFile) {
      // load lights from dlf
      // loadLights(dat, pos, numberOf_lights);
    } else {
      // skip lights in dlf
      const sizeofLight = Light.sizeOf()
      body.readUint8Array(sizeofLight * numberOfLights)
    }

    this.fogs = times(() => {
      const fog = new Fog()
      fog.readFrom(body)
      return fog
    }, this.header.numberOfFogs)

    // skip nodes for newer versions
    if (this.header.version >= 1.001) {
      body.readInt8Array(this.header.numberOfNodes * (204 + this.header.numberOfNodeLinks * 64))
    }

    this.paths = times(() => {
      const header = new PathHeader()
      header.readFrom(body)

      const pathways = times(() => {
        const pathways = new Pathways()
        pathways.readFrom(body)
        return pathways
      }, header.numberOfPathways)

      return {
        header,
        pathways
      }
    }, this.header.numberOfPaths)
  }

  _readHeader(file) {
    const header = new Header()
    header.readFrom(file)
    this.header = header
  }

  _readScene(file) {
    if (this.header.numberOfScenes !== 0) {
      this.scene = new Scene()
      this.scene.readFrom(file)
    }
  }
}
