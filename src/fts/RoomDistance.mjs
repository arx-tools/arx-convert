export default class RoomDistance {
  static readFrom(binary) {
    return {
      distance: binary.readFloat32(), // -1 means use truedist
      startPosition: binary.readVector3(),
      endPosition: binary.readVector3()
    }
  }
}
