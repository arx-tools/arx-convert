import { KEEP_ZERO_BYTES } from '../binary/BinaryIO.mjs'
import Vector3 from '../binary/Vector3.mjs'
import Anglef from '../binary/Anglef.mjs'
import Color from '../binary/Color.mjs'

export default class DanaeLsFog {
  constructor() {
    this.pos = new Vector3(0, 0, 0)
    this.rgb = new Color(0, 0, 0)
    this.size = 0
    this.special = 0
    this.scale = 0
    this.move = new Vector3(0, 0, 0)
    this.angle = new Anglef(0, 0, 0)
    this.speed = 0
    this.rotatespeed = 0
    this.tolive = 0
    this.blend = 0
    this.frequency = 0
    this.fpadd = new Array(32)
    this.lpadd = new Array(32)
    this.cpadd = '' // 256 bytes
  }

  readFrom(binary) {
    this.pos = binary.readVector3()
    this.rgb = binary.readColor()
    this.size = binary.readFloat32()
    this.special = binary.readInt32()
    this.scale = binary.readFloat32()
    this.move = binary.readVector3()
    this.angle = binary.readAnglef()
    this.speed = binary.readFloat32()
    this.rotatespeed = binary.readFloat32()
    this.tolive = binary.readInt32()
    this.blend = binary.readInt32()
    this.frequency = binary.readFloat32()
    this.fpadd = binary.readFloat32Array(32)
    this.lpadd = binary.readInt32Array(32)
    this.cpadd = binary.readString(256, KEEP_ZERO_BYTES)
  }

  writeTo(binary) {
    binary.writeVector3(this.pos)
    binary.writeColor(this.rgb)
    binary.writeFloat32(this.size)
    binary.writeInt32(this.special)
    binary.writeFloat32(this.scale)
    binary.writeVector3(this.move)
    binary.writeAnglef(this.angle)
    binary.writeFloat32(this.speed)
    binary.writeFloat32(this.rotatespeed)
    binary.writeInt32(this.tolive)
    binary.writeInt32(this.blend)
    binary.writeFloat32(this.frequency)
    binary.writeFloat32Array(this.fpadd)
    binary.writeInt32Array(this.lpadd)
    binary.writeString(this.cpadd, 256)
  }
}
