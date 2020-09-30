export default class LightingHeader {
  constructor() {}

  readFrom(binary) {
    this.numberOfLights = binary.readInt32()
    this.viewMode = binary.readInt32() // unused
    this.modeLight = binary.readInt32() // unused
    binary.readInt32() // lpad
  }

  writeTo(binary) {}
}