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
}