export default class Scene {
  static readFrom(binary) {
    const data = {
      name: binary.readString(512)
    }

    binary.readInt32Array(16) // pad
    binary.readFloat32Array(16) // fpad

    return data
  }

  writeTo(binary) {}
}
