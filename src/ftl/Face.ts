import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { ArxVector3, TripleOf } from '@common/types'

/** @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/graphics/data/FTLFormat.h#L105 */
export enum ArxFaceType {
  Flat = 0,
  Text = 1,
  DoubleSided = 2,
}

export type ArxFace = {
  faceType: ArxFaceType
  rgb: TripleOf<number>
  vid: TripleOf<number>
  texId: number
  u: TripleOf<number>
  v: TripleOf<number>
  ou: TripleOf<number>
  ov: TripleOf<number>
  transval: number
  norm: ArxVector3
  normals: TripleOf<ArxVector3>
  temp: number
}

export class Face {
  static readFrom(binary: BinaryIO): ArxFace {
    return {
      faceType: binary.readInt32(),
      rgb: binary.readUint32Array(3) as TripleOf<number>, // TODO: convert it to ArxColor
      vid: binary.readUint16Array(3) as TripleOf<number>,
      texId: binary.readInt16(),
      u: binary.readFloat32Array(3) as TripleOf<number>,
      v: binary.readFloat32Array(3) as TripleOf<number>,
      ou: binary.readInt16Array(3) as TripleOf<number>,
      ov: binary.readInt16Array(3) as TripleOf<number>,

      transval: binary.readFloat32(), // is this the same as in polygons?
      norm: binary.readVector3(),
      normals: binary.readVector3Array(3) as TripleOf<ArxVector3>,
      temp: binary.readFloat32(),
    }
  }

  static accumulateFrom(face: ArxFace) {
    const buffer = Buffer.alloc(Face.sizeOf())
    const binary = new BinaryIO(buffer)

    binary.writeInt32(face.faceType)
    binary.writeUint32Array(face.rgb)
    binary.writeUint16Array(face.vid)
    binary.writeInt16(face.texId)
    binary.writeFloat32Array(face.u)
    binary.writeFloat32Array(face.v)
    binary.writeInt16Array(face.u)
    binary.writeInt16Array(face.v)

    binary.writeFloat32(face.transval)
    binary.writeVector3(face.norm)
    binary.writeVector3Array(face.normals)
    binary.writeFloat32(face.temp)

    return buffer
  }

  static sizeOf() {
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
