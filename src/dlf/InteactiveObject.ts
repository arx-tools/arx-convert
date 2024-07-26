import path from 'node:path'
import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { repeat } from '@common/helpers.js'
import { type ArxRotation, type ArxVector3 } from '@common/types.js'

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
  static readFrom(binary: BinaryIO): ArxInteractiveObject {
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

  static accumulateFrom(interactiveObject: ArxInteractiveObject): Buffer {
    const buffer = Buffer.alloc(InteractiveObject.sizeOf())
    const binary = new BinaryIO(buffer)

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
   * from: `\\\\ARKANESERVER\\PUBLIC\\ARX\\GRAPH\\OBJ3D\\INTERACTIVE\\ITEMS\\PROVISIONS\\PIE\\PIE.teo`
   *   to: `items/provisions/pie`
   *
   * from: `C:\\ARX\\Graph\\Obj3D\\Interactive\\System\\Marker\\Marker.teo`
   *   to: `system/marker`
   *
   * If the last folder in the path and filename differs, like `...\\ITEMS\\PROVISIONS\\MUSHROOM\\FOOD_MUSHROOM.teo`
   * then it should keep the full path, but change the extension to `.asl`
   */
  static toRelativePath(filePath: string): string {
    // items/provisions/pie/pie.teo
    // items/provisions/mushroom/food_mushroom.teo
    filePath = filePath.toLowerCase().replaceAll('\\', '/').split('graph/obj3d/interactive/')[1]

    const { dir, name } = path.parse(filePath)

    if (dir.split('/').at(-1) !== name) {
      return dir + '/' + name + '.asl'
    }

    return dir
  }

  /**
   * from: `items/provisions/pie`
   *   to: `c:\\arx\\graph\\obj3d\\interactive\\items\\provisions\\pie\\pie.teo`
   *
   * If the path also has a file specified with extension, like `items/provisions/mushroom/food_mushroom.asl`
   * then keep the file part too, but change the extension to `.teo`
   */
  static toAbsolutePath(filePath: string): string {
    filePath = filePath.toLowerCase().replace(/\/$/, '')

    if (filePath.endsWith('.asl')) {
      const { dir, name } = path.parse(filePath)
      return `c:\\arx\\graph\\obj3d\\interactive\\${dir.replaceAll('/', '\\')}\\${name}.teo`
    }

    const dir = filePath
    const name = filePath.split('/').at(-1)
    return `c:\\arx\\graph\\obj3d\\interactive\\${dir.replaceAll('/', '\\')}\\${name}.teo`
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfString(512) +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfRotation() +
      BinaryIO.sizeOfInt32Array(16) +
      BinaryIO.sizeOfFloat32Array(16)
    )
  }
}
