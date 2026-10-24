// ----------------
//  types
// ----------------

export type { ArxColor } from './common/Color.ts'
export type { ArxVector3, ArxRotation, ArxQuaternion } from './common/types.ts'

export type { ArxZone, ArxPath, ArxDLF } from './dlf/DLF.ts'
export type { ArxDlfHeader } from './dlf/DlfHeader.ts'
export type { ArxFog } from './dlf/Fog.ts'
export type { ArxInteractiveObject } from './dlf/InteractiveObject.ts'
export type { ArxZoneAndPathHeader } from './dlf/ZoneAndPathHeader.ts'
export type { ArxZoneAndPathPoint } from './dlf/ZoneAndPathPoint.ts'
export type { ArxScene } from './dlf/Scene.ts'

export type { ArxFTL } from './ftl/FTL.ts'
export type { ArxAction } from './ftl/Action.ts'
export type { ArxFtlHeader } from './ftl/FtlHeader.ts'
export type { ArxFtlVertex } from './ftl/FtlVertex.ts'
export type { ArxSelection } from './ftl/Selections.ts'
export type { ArxGroup } from './ftl/Group.ts'
export type { ArxFtlTextureContainer } from './ftl/FtlTextureContainer.ts'
export type { ArxFace } from './ftl/Face.ts'

export type { ArxAnchor } from './fts/Anchor.ts'
export type { ArxAnchorData } from './fts/AnchorData.ts'
export type { ArxCell } from './fts/Cell.ts'
export type { ArxEPData } from './fts/EPData.ts'
export type { ArxFTS } from './fts/FTS.ts'
export type { ArxFtsHeader } from './fts/FtsHeader.ts'
export type { ArxPolygon } from './fts/Polygon.ts'
export type { ArxPortal } from './fts/Portal.ts'
export type { ArxPortalPolygon } from './fts/PortalPolygon.ts'
export type { ArxRoom } from './fts/Room.ts'
export type { ArxRoomData } from './fts/RoomData.ts'
export type { ArxRoomDistance } from './fts/RoomDistance.ts'
export type { ArxSceneHeader } from './fts/SceneHeader.ts'
export type { ArxSceneInfo } from './fts/SceneInfo.ts'
export type { ArxTextureContainer } from './fts/TextureContainer.ts'
export type { ArxTextureVertex } from './fts/TextureVertex.ts'
export type { ArxUniqueHeader } from './fts/UniqueHeader.ts'
export type { ArxVertex } from './fts/Vertex.ts'

export type { ArxLLF } from './llf/LLF.ts'
export type { ArxLightingHeader } from './llf/LightingHeader.ts'
export type { ArxLlfHeader } from './llf/LlfHeader.ts'
export type { ArxLight } from './llf/Light.ts'

export type { ArxTEA } from './tea/TEA.ts'
export type { ArxTeaHeader } from './tea/TeaHeader.ts'
export type { ArxKeyFrame, ArxTheoAnimationGroup } from './tea/KeyFrame.ts'
export type { ArxTheaSample } from './tea/types.ts'

export type { ArxAMB } from './amb/AMB.ts'
export type { ArxAmbHeader } from './amb/AmbHeader.ts'
export type { ArxTrack } from './amb/Track.ts'
export type { ArxKey } from './amb/Key.ts'
export type { ArxSetting } from './amb/Setting.ts'

// ----------------
//  enums
// ----------------

export { ArxZoneAndPathPointType } from './dlf/ZoneAndPathPoint.ts'
export { ArxPolygonFlags } from './fts/Polygon.ts'
export { ArxLightFlags } from './llf/Light.ts'
export { ArxTrackFlags } from './amb/Track.ts'
export { ArxSettingFlag } from './amb/Setting.ts'
export { ArxFaceType } from './ftl/Face.ts'
export { ArxAnimationPlayingFlags } from './tea/KeyFrame.ts'
