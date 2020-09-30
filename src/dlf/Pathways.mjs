import nodemon from "nodemon"

export default class Pathways {
  readFrom(binary) {
    this.rpos = binary.readVector3()
    this.flag = binary.readInt32()
    this.time = binary.readUint32()
    
    this.fpadd = binary.readFloat32Array(2)
    this.lpadd = binary.readInt32Array(2)
    this.cpadd = binary.readUint8Array(32)
  }
}
