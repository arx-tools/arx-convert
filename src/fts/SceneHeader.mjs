export default class SceneHeader {
  constructor() {}

  readFrom(binary) {
    this.version = binary.readFloat32()
    this.sizex = binary.readInt32()
    this.sizez = binary.readInt32()
    this.nb_textures = binary.readInt32()
    this.nb_polys = binary.readInt32()
    this.nb_anchors = binary.readInt32()
    this.playerpos = binary.readVector3()
    this.Mscenepos = binary.readVector3()
    this.nb_portals = binary.readInt32()
    this.nb_rooms = binary.readInt32()
  }

  writeTo(binary) {}
}
