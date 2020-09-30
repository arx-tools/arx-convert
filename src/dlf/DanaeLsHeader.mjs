import { TRUNCATE_ZERO_BYTES, KEEP_ZERO_BYTES } from '../binary/BinaryIO.mjs'
import Vector3 from '../binary/Vector3.mjs'
import Anglef from '../binary/Anglef.mjs'

export default class DanaeLsHeader {
  // TODO: should we just ignore the contents of padding fields?

  constructor() {
    this.version = 0
    this.identifier = ''
    this.lastUser = ''
    this.time = 0
    this.posEdit = new Vector3(0, 0, 0)
    this.angleEdit = new Anglef(0, 0, 0)
    this.numberOfScenes = 0
    this.numberOfInteractiveObjects = 0
    this.numberOfNodes = 0
    this.numberOfNodeLinks = 0
    this.numberOfZones = 0
    this.lighting = 0
    this.Bpad = new Array(256)
    this.numberOfLights = 0
    this.numberOfFogs = 0
    this.numberOfBackgroundPolygons = 0
    this.numberOfIgnoredPolygons = 0
    this.numberOfChildPolygons = 0
    this.numberOfPaths = 0
    this.pad = new Array(250)
    this.offset = new Vector3(0, 0, 0)
    this.fpad = new Array(253)
    this.cpad = ''
    this.bpad = new Array(256)
  }

  readFrom(binary) {
    this.version = binary.readFloat32()
    this.identifier = binary.readString(16)
    this.lastUser = binary.readString(256)
    this.time = binary.readInt32()
    this.posEdit = binary.readVector3()
    this.angleEdit = binary.readAnglef()
    this.numberOfScenes = binary.readInt32()
    this.numberOfInteractiveObjects = binary.readInt32()
    this.numberOfNodes = binary.readInt32()
    this.numberOfNodeLinks = binary.readInt32()
    this.numberOfZones = binary.readInt32()
    this.lighting = binary.readInt32()
    this.Bpad = binary.readInt32Array(256)
    this.numberOfLights = binary.readInt32()
    this.numberOfFogs = binary.readInt32()
    this.numberOfBackgroundPolygons = binary.readInt32()
    this.numberOfIgnoredPolygons = binary.readInt32()
    this.numberOfChildPolygons = binary.readInt32()
    this.numberOfPaths = binary.readInt32()
    this.pad = binary.readInt32Array(250)
    this.offset = binary.readVector3()
    this.fpad = binary.readFloat32Array(253)
    this.cpad = binary.readString(4096)
    this.bpad = binary.readInt32Array(256)
  }

  writeTo(binary) {
    binary.writeFloat32(this.version)
    binary.writeString(this.identifier, 16)
    binary.writeString(this.lastUser, 256)
    binary.writeInt32(this.time)
    binary.writeVector3(this.posEdit)
    binary.writeAnglef(this.angleEdit)
    binary.writeInt32(this.numberOfScenes)
    binary.writeInt32(this.numberOfInteractiveObjects)
    binary.writeInt32(this.numberOfNodes)
    binary.writeInt32(this.numberOfNodeLinks)
    binary.writeInt32(this.numberOfZones)
    binary.writeInt32(this.lighting)
    binary.writeInt32Array(this.Bpad)
    binary.writeInt32(this.numberOfLights)
    binary.writeInt32(this.numberOfFogs)
    binary.writeInt32(this.numberOfBackgroundPolygons)
    binary.writeInt32(this.numberOfIgnoredPolygons)
    binary.writeInt32(this.numberOfChildPolygons)
    binary.writeInt32(this.numberOfPaths)
    binary.writeInt32Array(this.pad)
    binary.writeVector3(this.offset)
    binary.writeFloat32Array(this.fpad)
    binary.writeString(this.cpad, 4096)
    binary.writeInt32Array(this.bpad)
  }

  static sizeOf() {
    return 8520 // calculated manually
  }
}
