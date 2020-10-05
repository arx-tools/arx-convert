import BinaryIO from '../Binary/BinaryIO.mjs'

export default class Vertex {
  static readFrom(binary) {
    return {
      posY: binary.readFloat32(),
      posX: binary.readFloat32(),
      posZ: binary.readFloat32(),
      texU: binary.readFloat32(),
      texV: binary.readFloat32()
    }
  }

  static accumulateFrom(vertex) {
    const buffer = Buffer.alloc(this.sizeOf(), 0)
    const binary = new BinaryIO(buffer.buffer)

    binary.writeFloat32(vertex.posY)
    binary.writeFloat32(vertex.posX)
    binary.writeFloat32(vertex.posZ)
    binary.writeFloat32(vertex.texU)
    binary.writeFloat32(vertex.texV)

    return buffer
  }

  static sizeOf() {
    return 5 * 4
  }
}