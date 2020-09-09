import { TRUNCATE_ZERO_BYTES, KEEP_ZERO_BYTES } from '../binary/BinaryIO.mjs'
import Vector3 from '../binary/Vector3.mjs'
import Color from '../binary/Color.mjs'

export default class DanaeLsPath {
  constructor() {
    this.name = ''
    this.idx = 0
    this.flags = 0
    this.initpos = new Vector3(0, 0, 0)
    this.pos = new Vector3(0, 0, 0)
    this.numberOfPathways = 0
    this.rgb = new Color(0, 0, 0)
    this.farclip = 0
    this.reverb = 0
    this.ambMaxVol = 0
    this.fpadd = new Array(26)
    this.height = 0
    this.lpadd = new Array(31)
    this.ambiance = '' // 128 chars
    this.cpadd = '' // 128 bytes
  }

  readFrom(binary) {
    this.name = binary.readString(64, TRUNCATE_ZERO_BYTES)
    this.idx = binary.readInt16()
    this.flags = binary.readInt16()
    this.initpos = binary.readVector3()
    this.pos = binary.readVector3()
    this.numberOfPathways = binary.readInt32()
    this.rgb = binary.readColor()
    this.farclip = binary.readFloat32()
    this.reverb = binary.readFloat32()
    this.ambMaxVol = binary.readFloat32()
    this.fpadd = binary.readFloat32Array(26)
    this.height = binary.readInt32()
    this.lpadd = binary.readInt32Array(31)
    this.ambiance = binary.readString(128, TRUNCATE_ZERO_BYTES)
    this.cpadd = binary.readString(128, KEEP_ZERO_BYTES)
  }

  writeTo(binary) {
    binary.writeString(this.name, 64)
    binary.writeInt16(this.idx)
    binary.writeInt16(this.flags)
    binary.writeVector3(this.initpos)
    binary.writeVector3(this.pos)
    binary.writeInt32(this.numberOfPathways)
    binary.writeColor(this.rgb)
    binary.writeFloat32(this.farclip)
    binary.writeFloat32(this.reverb)
    binary.writeFloat32(this.ambMaxVol)
    binary.writeFloat32Array(this.fpadd)
    binary.writeInt32(this.height)
    binary.writeInt32Array(this.lpadd)
    binary.writeString(this.ambiance, 128)
    binary.writeString(this.cpadd, 128)
  }
}
