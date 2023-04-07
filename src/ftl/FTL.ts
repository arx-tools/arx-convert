import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { ArxFtlHeader, FtlHeader } from '@ftl/FtlHeader'
import { ArxFtlVertex, FtlVertex } from '@ftl/FtlVertex'
import { times } from '@common/helpers'
import { ArxFace, Face } from '@ftl/Face'

export type ArxFTL = {
  header: Omit<ArxFtlHeader, 'numberOfVertices' | 'numberOfFaces'>
  vertices: ArxFtlVertex[]
  faces: ArxFace[]
  remainingBytes: number[]
}

/*
struct Texture_Container_FTL {
  char name[256];
};

const size_t IOPOLYVERT_FTL = 3;

struct EERIE_GROUPLIST_FTL {
  char name[256];
  s32 origin; // TODO this is always positive use u32 ?
  s32 nb_index;
  s32 indexes;
  f32 siz;
};

struct EERIE_ACTIONLIST_FTL {
  char name[256];
  s32 idx; // index vertex;
  s32 action;
  s32 sfx;
  
  operator EERIE_ACTIONLIST() const {
    EERIE_ACTIONLIST a;
    a.name = util::toLowercase(util::loadString(name));
    a.idx = ActionPoint(idx);
    return a;
  }
};

struct EERIE_SELECTIONS_FTL {
  char name[64];
  s32 nb_selected;
  s32 selected;
};

struct EERIE_OLD_VERTEX {
  char unused[32];
  SavedVec3 v;
  SavedVec3 norm;
  
  operator EERIE_VERTEX() const {
    EERIE_VERTEX a;
    a.v = v.toVec3(), a.norm = norm.toVec3();
    return a;
  }
};

*/

export class FTL {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile)

    const { numberOfVertices, numberOfFaces, ...header } = FtlHeader.readFrom(file)

    const data: ArxFTL = {
      header,
      vertices: times(() => FtlVertex.readFrom(file), numberOfVertices),
      faces: times(() => Face.readFrom(file), numberOfFaces),
      remainingBytes: file.readUint8Array(decompressedFile.byteLength - file.position),
    }

    return data
  }

  static save(json: ArxFTL) {
    const header = FtlHeader.accumulateFrom(json)
    const vertices = Buffer.concat(json.vertices.map(FtlVertex.accumulateFrom))
    const faces = Buffer.concat(json.faces.map(Face.accumulateFrom))

    const remainingBytes = Buffer.from(json.remainingBytes)

    return Buffer.concat([header, vertices, faces, remainingBytes])
  }
}
