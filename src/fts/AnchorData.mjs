export default class AnchorData {
  static readFrom(binary) {
    return {
      position: binary.readVector3(),
      radius: binary.readFloat32(),
      height: binary.readFloat32(),
      numberOfLinkedAnchors: binary.readInt16(),
      flags: binary.readInt16()
    }
  }
}