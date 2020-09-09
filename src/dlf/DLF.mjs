import { times } from '../../node_modules/ramda/src/index.mjs'
import BinaryIO from '../Binary/BinaryIO.mjs'
import DanaeLsHeader from './DanaeLsHeader.mjs'
import DanaeLsScene from './DanaeLsScene.mjs'
import DanaeLsInteractiveObject from './DanaeLsInteactiveObject.mjs'
import DanaeLsLight from './DanaeLsLight.mjs'
import DanaeLsFog from './DanaeLsFog.mjs'
import DanaeLsPath from './DanaeLsPath.mjs'

export default class DLF {
  load(decompressedBuffer) {
    const body = new BinaryIO(decompressedBuffer.buffer)

    this._readHeader(body)
    this._readScene(body)

    this.interactiveObjects = times(() => {
      const inter = new DanaeLsInteractiveObject()
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
      const sizeofDanaeLsLight = DanaeLsLight.sizeOf()
      body.readInt8Array(sizeofDanaeLsLight * numberOfLights)
    }

    this.fogs = times(() => {
      const fog = new DanaeLsFog()
      fog.readFrom(body)
      return fog
    }, this.header.numberOfFogs)

    // skip nodes for newer versions
    if (this.header.version >= 1.001) {
      body.readInt8Array(this.header.numberOfNodes * (204 + this.header.numberOfNodeLinks * 64))
    }

    this.paths = times(() => {
      const path = new DanaeLsPath()
      path.readFrom(body)
      return path
    }, this.header.numberOfPaths)
  }

  _readHeader(file) {
    const header = new DanaeLsHeader()
    header.readFrom(file)
    this.header = header
  }

  _readScene(file) {
    if (this.header.numberOfScenes !== 0) {
      this.scene = new DanaeLsScene()
      this.scene.readFrom(file)
    }
  }
}
