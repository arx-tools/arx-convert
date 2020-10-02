export default class EPData {
  static readFrom(binary) {
    const data = {
      px: binary.readInt16(),
      py: binary.readInt16(),
      idx: binary.readInt16()
    }

    binary.readInt16()

    return data
  }
}
