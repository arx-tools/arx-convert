import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxVector3, type TripleOf } from '@common/types.js'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L105 */
export enum ArxFaceType {
  Flat = 0,
  Text = 1,
  DoubleSided = 2,
}

/**
 * the default value of transval is 0
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L103
 */
export type ArxFace = {
  faceType: ArxFaceType
  vertexIdx: TripleOf<number>
  textureIdx: number
  u: TripleOf<number>
  v: TripleOf<number>
  transval?: number
  norm: ArxVector3
}

export class Face {
  static readFrom(binary: BinaryIO): ArxFace {
    const faceType = binary.readInt32()

    binary.readUint32Array(3) // rgb - always [0, 0, 0]

    const dataBlock1 = {
      faceType,
      vertexIdx: binary.readUint16Array(3) as TripleOf<number>,
      textureIdx: binary.readInt16(),
      u: binary.readFloat32Array(3) as TripleOf<number>,
      v: binary.readFloat32Array(3) as TripleOf<number>,
    }

    binary.readInt16Array(3) // ou - ignored by Arx
    binary.readInt16Array(3) // ov - ignored by Arx

    const dataBlock2 = {
      transval: binary.readFloat32(),
      norm: binary.readVector3(),
    }

    binary.readVector3Array(3) // normals - ignored by Arx
    binary.readFloat32() // temp - ignored by Arx

    return {
      ...dataBlock1,
      ...dataBlock2,
    }
  }

  static accumulateFrom(face: ArxFace): Buffer {
    const buffer = Buffer.alloc(Face.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(face.faceType)
    binary.writeUint32Array([0, 0, 0]) // rgb
    binary.writeUint16Array(face.vertexIdx)
    binary.writeInt16(face.textureIdx)
    binary.writeFloat32Array(face.u)
    binary.writeFloat32Array(face.v)
    binary.writeInt16Array([0, 0, 0]) // ou
    binary.writeInt16Array([0, 0, 0]) // ov
    binary.writeFloat32(face.transval ?? 0)
    binary.writeVector3(face.norm)
    binary.writeVector3Array([
      // normals
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
    ])
    binary.writeFloat32(0) // temp

    return buffer
  }

  static sizeOf(): number {
    return (
      BinaryIO.sizeOfInt32() +
      BinaryIO.sizeOfUint32Array(3) +
      BinaryIO.sizeOfUint16Array(3) +
      BinaryIO.sizeOfInt16() +
      2 * BinaryIO.sizeOfFloat32Array(3) +
      2 * BinaryIO.sizeOfInt16Array(3) +
      BinaryIO.sizeOfFloat32() +
      BinaryIO.sizeOfVector3() +
      BinaryIO.sizeOfVector3Array(3) +
      BinaryIO.sizeOfFloat32()
    )
  }
}
