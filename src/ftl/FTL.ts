import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO'
import { ArxFtlHeader, FtlHeader } from '@ftl/FtlHeader'
import { ArxFtlVertex, FtlVertex } from '@ftl/FtlVertex'
import { ArxFtlTextureContainer, FtlTextureContainer } from '@ftl/FtlTextureContainer'
import { times } from '@common/helpers'
import { ArxFace, Face } from '@ftl/Face'
import { ArxGroup, Group } from '@ftl/Group'

export type ArxFTL = {
  header: Omit<ArxFtlHeader, 'numberOfVertices' | 'numberOfFaces' | 'numberOfTextures' | 'numberOfGroups'>
  vertices: ArxFtlVertex[]
  faces: ArxFace[]
  textureContainers: ArxFtlTextureContainer[]
  groups: ArxGroup[]
  remainingBytes: number[]
}

/*
struct Texture_Container_FTL {
  char name[256];
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
*/

export class FTL {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile)

    const { numberOfVertices, numberOfFaces, numberOfTextures, numberOfGroups, ...header } = FtlHeader.readFrom(file)

    const data: ArxFTL = {
      header,
      vertices: times(() => FtlVertex.readFrom(file), numberOfVertices),
      faces: times(() => Face.readFrom(file), numberOfFaces),
      textureContainers: times(() => FtlTextureContainer.readFrom(file), numberOfTextures),
      groups: times(() => Group.readFrom(file), numberOfGroups),

      remainingBytes: file.readUint8Array(decompressedFile.byteLength - file.position),
    }

    return data
  }

  static save(json: ArxFTL) {
    const header = FtlHeader.accumulateFrom(json)
    const vertices = Buffer.concat(json.vertices.map(FtlVertex.accumulateFrom))
    const faces = Buffer.concat(json.faces.map(Face.accumulateFrom))
    const textureContainers = Buffer.concat(json.textureContainers.map(FtlTextureContainer.accumulateFrom))
    const groups = Buffer.concat(json.groups.map(Group.accumulateFrom))

    const remainingBytes = Buffer.from(json.remainingBytes)

    return Buffer.concat([header, vertices, faces, textureContainers, groups, remainingBytes])
  }
}
