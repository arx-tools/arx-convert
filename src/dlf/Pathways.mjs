import nodemon from "nodemon"

export default class Pathways {
  readFrom(binary) {
    this.rpos = binary.readVector3()
    this.flag = binary.readInt32()
    this.time = binary.readUint32()
    
    binary.readFloat32Array(2) // fpad
    binary.readInt32Array(2) // lpad
    binary.readUint8Array(32) // cpad
  }
}
