import { Buffer } from 'node:buffer'
import { BinaryIO } from '../binary/BinaryIO'
import { ArxFtlHeader, FtlHeader } from './FtlHeader'

export type ArxFTL = {
  meta: {
    type: 'ftl'
    numberOfLeftoverBytes: number
  }
  header: ArxFtlHeader
}

/*

// FTL FILE Structure:
//
// ARX_FTL_PRIMARY_HEADER
// Checksum (512 bytes?)
// --> All the following data is then compressed and must be expanded
// ARX_FTL_SECONDARY_HEADER;
// -> Then depending on offsets just read data directly.

struct ARX_FTL_SECONDARY_HEADER {
	s32 offset_3Ddata; // -1 = no
	s32 offset_cylinder; // -1 = no
	s32 offset_progressive_data; // -1 = no
	s32 offset_clothes_data; // -1 = no
	s32 offset_collision_spheres; // -1 = no
	s32 offset_physics_box; // -1 = no
};

struct ARX_FTL_3D_DATA_HEADER {
	s32 nb_vertex;
	s32 nb_faces;
	s32 nb_maps;
	s32 nb_groups;
	s32 nb_action;
	s32 nb_selections; // data will follow this order
	s32 origin; // TODO this is always >= 0 replace with u32
	char name[256];
};

struct Texture_Container_FTL {
	char name[256];
};

const size_t IOPOLYVERT_FTL = 3;

struct EERIE_FACE_FTL {
	s32 facetype; // 0 = flat, 1 = text, 2 = Double-Side
	
	u32 rgb[IOPOLYVERT_FTL];
	u16 vid[IOPOLYVERT_FTL];
	s16 texid;
	f32 u[IOPOLYVERT_FTL];
	f32 v[IOPOLYVERT_FTL];
	s16 ou[IOPOLYVERT_FTL];
	s16 ov[IOPOLYVERT_FTL];
	
	f32 transval;
	SavedVec3 norm;
	SavedVec3 nrmls[IOPOLYVERT_FTL];
	f32 temp;
};

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
    const file = new BinaryIO(decompressedFile.buffer)

    const header = FtlHeader.readFrom(file)

    const data: ArxFTL = {
      meta: {
        type: 'ftl',
        numberOfLeftoverBytes: 0,
      },
      header: header,
    }

    return data
  }

  static save(json: ArxFTL) {
    return Buffer.concat([])
  }
}
