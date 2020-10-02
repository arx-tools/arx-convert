export default class Pathways {
  static readFrom(binary) {
    const data = {
      rpos: binary.readVector3(),
      flag: binary.readInt32(),
      time: binary.readUint32(),
    }

    binary.readFloat32Array(2) // fpad
    binary.readInt32Array(2) // lpad
    binary.readUint8Array(32) // cpad

    return data
  }
}
