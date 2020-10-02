import { times } from '../../node_modules/ramda/src/index.mjs'
import TextureVertex from './TextureVertex.mjs'

export default class PortalPolygon {
  static readFrom(binary) {
    return {
      type: binary.readInt32(),
      min: binary.readVector3(),
      max: binary.readVector3(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      v: times(() => TextureVertex.readFrom(binary), 4),
      unused: binary.readUint8Array(32 * 4), //TODO: apparently this does hold data, question is what kind of data...
      nrml: binary.readVector3Array(4),
      tex: binary.readInt32(),
      center: binary.readVector3(),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      room: binary.readInt16(),
      misc: binary.readInt16(),
    }
  }
}
