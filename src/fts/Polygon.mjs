import { times } from '../../node_modules/ramda/src/index.mjs'
import Vertex from './Vertex.mjs'

export default class Polygon {
  static readFrom(binary) {
    const data = {
      verticles: times(() => Vertex.readFrom(binary), 4),
      tex: binary.readInt32(),
      norm: binary.readVector3(),
      norm2: binary.readVector3(),
      normals: times(() => binary.readVector3(), 4),
      transval: binary.readFloat32(),
      area: binary.readFloat32(),
      type: binary.readInt32(),
      room: binary.readInt16(),
      paddy: binary.readInt16(),
    }

    return data
  }
}
