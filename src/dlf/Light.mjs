export default class Light {
  constructor() {}

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

  writeTo(binary) {}

  static sizeOf() {
    // https://github.com/arx/ArxLibertatis/blob/85d293a69d486466e0c51de3ebf92f70941dc4f0/src/scene/LevelFormat.h#L114
    return 296 
  }
}
