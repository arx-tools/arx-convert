export default class Scene {
  constructor() {}

  readFrom(binary) {
    this.name = binary.readString(512)
    binary.readInt32Array(16) // pad
    binary.readFloat32Array(16) // fpad
  }

  writeTo(binary) {}
}
