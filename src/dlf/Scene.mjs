export default class Scene {
  constructor() {}

  readFrom(binary) {
    this.name = binary.readString(512)
    this.pad = binary.readInt32Array(16)
    this.fpad = binary.readFloat32Array(16)
  }

  writeTo(binary) {}
}
