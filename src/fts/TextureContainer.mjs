export default class TextureContainer {
  static readFrom(binary) {
    return {
      tc: binary.readInt32(),
      temp: binary.readInt32(),
      fic: binary.readUint8Array(256)
    }
  }
}
