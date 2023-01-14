import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxDlfHeader, DlfHeader } from './DlfHeader'
import { ArxFog, Fog } from './Fog'
import { ArxInteractiveObject, InteractiveObject } from './InteactiveObject'
import { ArxZoneAndPathFlags, ZoneAndPathHeader } from './ZoneAndPathHeader'
import { ArxZoneAndPathPoint, ZoneAndPathPoint } from './ZoneAndPathPoint'
import { ArxScene, Scene } from './Scene'
import { ArxColor } from '../common/Color'

export type ArxZone = {
  name: string
  points: ArxZoneAndPathPoint[]
  height: number
  backgroundColor?: ArxColor
  drawDistance?: number
  ambience?: string
  ambienceMaxVolume?: number
}

export type ArxPath = {
  name: string
  points: ArxZoneAndPathPoint[]
}

export type ArxDLF = {
  header: Omit<ArxDlfHeader, 'numberOfInteractiveObjects' | 'numberOfFogs' | 'numberOfZonesAndPaths'>
  scene: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  fogs: ArxFog[]
  paths: ArxPath[]
  zones: ArxZone[]
}

export class DLF {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfInteractiveObjects, numberOfFogs, numberOfZonesAndPaths, ...header } = DlfHeader.readFrom(file)

    const data: ArxDLF = {
      header,
      scene: Scene.readFrom(file),
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects),
      fogs: times(() => Fog.readFrom(file), numberOfFogs),
      paths: [],
      zones: [],
    }

    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64))

    times(() => {
      const { numberOfPoints, pos, height, name, backgroundColor, ambience, ambienceMaxVolume, drawDistance, flags } =
        ZoneAndPathHeader.readFrom(file)

      const points = times(() => ZoneAndPathPoint.readFrom(file, pos), numberOfPoints)

      /**
       * zones and paths are the same, the only difference is whether the height is equal to 0
       *
       * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LoadLevel.cpp#L407
       */
      if (height === 0) {
        data.paths.push({ name, points })
      } else {
        data.zones.push({
          name,
          points,
          height,
          ...(flags & ArxZoneAndPathFlags.SetAmbience ? { ambience, ambienceMaxVolume } : {}),
          ...(flags & ArxZoneAndPathFlags.SetBackgroundColor ? { backgroundColor } : {}),
          ...(flags & ArxZoneAndPathFlags.SetDrawDistance ? { drawDistance } : {}),
        })
      }
    }, numberOfZonesAndPaths)

    return data
  }

  static save(json: ArxDLF) {
    const header = DlfHeader.accumulateFrom(json)
    const scene = Scene.accumulateFrom(json.scene)
    const interactiveObjects = Buffer.concat(json.interactiveObjects.map(InteractiveObject.accumulateFrom))
    const fogs = Buffer.concat(json.fogs.map(Fog.accumulateFrom))
    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    const nodes = Buffer.alloc(numberOfNodes * (204 + numberOfNodeLinks * 64))

    const paths = Buffer.concat(
      json.paths.flatMap((path) => {
        const header = ZoneAndPathHeader.allocateFrom(path)
        const pos = path.points[0].pos
        const points = path.points.map((point) => ZoneAndPathPoint.allocateFrom(point, pos))
        return [header, ...points]
      }),
    )

    const zones = Buffer.concat(
      json.zones.flatMap((zone) => {
        const header = ZoneAndPathHeader.allocateFrom(zone)
        const pos = zone.points[0].pos
        const points = zone.points.map((point) => ZoneAndPathPoint.allocateFrom(point, pos))
        return [header, ...points]
      }),
    )

    return Buffer.concat([header, scene, interactiveObjects, fogs, nodes, paths, zones])
  }
}
