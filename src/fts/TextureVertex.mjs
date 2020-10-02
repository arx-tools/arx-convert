export default class TextureVertex {
  static readFrom(binary) {
    return {
      pos: binary.readVector3(),
      rhw: binary.readFloat32(),
      color: binary.readUint32(),
      specular: binary.readUint32(),
      tu: binary.readFloat32(),
      tv: binary.readFloat32()
    }
  }
}