import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { repeat } from '../common/helpers'
import { ArxRotation, ArxVector3 } from '../common/types'

/**
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LevelFormat.h#L193
 */
export type ArxInteractiveObject = {
  name: string
  pos: ArxVector3
  angle: ArxRotation
  identifier: number
}

export class InteractiveObject {
  static readFrom(binary: BinaryIO) {
    const data: ArxInteractiveObject = {
      name: InteractiveObject.toRelativePath(binary.readString(512)),
      pos: binary.readVector3(),
      angle: binary.readRotation(),
      identifier: binary.readInt32(),
    }

    binary.readInt32() // flags - always 0
    binary.readInt32Array(14) // pad - ?
    binary.readFloat32Array(16) // fpad - ?

    return data
  }

  static accumulateFrom(interactiveObject: ArxInteractiveObject) {
    const buffer = Buffer.alloc(InteractiveObject.sizeOf())
    const binary = new BinaryIO(buffer.buffer)

    binary.writeString(InteractiveObject.toAbsolutePath(interactiveObject.name), 512)
    binary.writeVector3(interactiveObject.pos)
    binary.writeRotation(interactiveObject.angle)
    binary.writeInt32(interactiveObject.identifier)
    binary.writeInt32(0) // flags

    binary.writeInt32Array(repeat(0, 14)) // pad
    binary.writeFloat32Array(repeat(0, 16)) // fpad

    return buffer
  }

  /**
   * from: \\\\ARKANESERVER\\PUBLIC\\ARX\\GRAPH\\OBJ3D\\INTERACTIVE\\ITEMS\\PROVISIONS\\PIE\\PIE.teo
   *   to: items/provisions/pie
   *
   * from: C:\\ARX\\Graph\\Obj3D\\Interactive\\System\\Marker\\Marker.teo
   *   to: system/marker
   */
  static toRelativePath(name: string) {
    return name
      .toLowerCase()
      .replace(/\\/g, '/')
      .split('graph/obj3d/interactive/')[1]
      .replace(/\/[^/]+$/, '')
  }

  /**
   * from: items/provisions/pie
   *   to: c:\\arx\\graph\\obj3d\\interactive\\items\\provisions\\pie\\pie.teo
   */
  static toAbsolutePath(name: string) {
    const filename = name.split('/').pop() + '.teo'
    return 'c:\\arx\\graph\\obj3d\\interactive\\' + name.toLowerCase().replace(/\//g, '\\') + '\\' + filename
  }

  static sizeOf() {
    return (
      BinaryIO.sizeOfString(512) +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfRotation() +
      BinaryIO.sizeOfInt32Array(16) +
      BinaryIO.sizeOfFloat32Array(16)
    )
  }
}
