import Vector3 from '../binary/Vector3.mjs'
import Color from '../binary/Color.mjs'

export default class DanaeLsLight {
  constructor() {
    this.pos = new Vector3(0, 0, 0)
    this.rgb = new Color(0, 0, 0)
    this.fallstart = 0
    this.fallend = 0
    this.intensity = 0
    this.i = 0
    this.exFlicker = new Color(0, 0, 0)
    this.exRadius = 0
    this.exFrequency = 0
    this.exSize = 0
    this.exSpeed = 0
    this.exFlareSize = 0
    this.fpadd = new Array(24)
    this.extras = 0
    this.lpadd = new Array(31)
  }

  readFrom(binary) {
    this.pos = binary.readVector3()
    this.rgb = binary.readColor()
    this.fallstart = binary.readFloat32()
    this.fallend = binary.readFloat32()
    this.intensity = binary.readFloat32()
    this.i = binary.readFloat32()
    this.exFlicker = binary.readColor()
    this.exRadius = binary.readFloat32()
    this.exFrequency = binary.readFloat32()
    this.exSize = binary.readFloat32()
    this.exSpeed = binary.readFloat32()
    this.exFlareSize = binary.readFloat32()
    this.fpadd = binary.readFloat32Array(24)
    this.extras = binary.readInt32()
    this.lpadd = binary.readInt32Array(31)
  }

  writeTo(binary) {
    binary.writeVector3(this.pos)
    binary.writeColor(this.rgb)
    binary.writeFloat32(this.fallstart)
    binary.writeFloat32(this.fallend)
    binary.writeFloat32(this.intensity)
    binary.writeFloat32(this.i)
    binary.writeColor(this.exFlicker)
    binary.writeFloat32(this.exRadius)
    binary.writeFloat32(this.exFrequency)
    binary.writeFloat32(this.exSize)
    binary.writeFloat32(this.exSpeed)
    binary.writeFloat32(this.exFlareSize)
    binary.writeFloat32Array(this.fpadd)
    binary.writeInt32(this.extras)
    binary.writeInt32Array(this.lpadd)
  }

  static sizeOf() {
    // https://github.com/arx/ArxLibertatis/blob/85d293a69d486466e0c51de3ebf92f70941dc4f0/src/scene/LevelFormat.h#L114
    return 296 
  }
}
