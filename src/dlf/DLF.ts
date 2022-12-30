import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxDlfHeader, DlfHeader } from './DlfHeader'
import { ArxFog, Fog } from './Fog'
import { ArxInteractiveObject, InteractiveObject } from './InteactiveObject'
import { ArxZoneHeader, ZoneHeader } from './ZoneHeader'
import { ArxZonePoint, ZonePoint } from './ZonePoint'
import { ArxScene, Scene } from './Scene'

export type ArxZone = Omit<ArxZoneHeader, 'numberOfPoints' | 'pos'> & {
  points: ArxZonePoint[]
}

export type ArxDLF = {
  header: Omit<ArxDlfHeader, 'numberOfInteractiveObjects' | 'numberOfFogs' | 'numberOfZonesAndPaths'>
  scene: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  fogs: ArxFog[]
  zones: ArxZone[]
  paths: ArxPath[]
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
      zones: [],
      paths: [],
    }

    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64))

    times(() => {
      const { numberOfPoints, pos, ...zoneHeader } = ZoneHeader.readFrom(file)

      const zoneOrPath = {
        ...zoneHeader,
        points: times(() => ZonePoint.readFrom(file, pos), numberOfPoints),
      }

      /**
       * zones and paths are stored in the same place
       *
       * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LoadLevel.cpp#L407
       */
      if (zoneHeader.height === 0) {
        data.paths.push(zoneOrPath)
      } else {
        data.zones.push(zoneOrPath)
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
    const zones = Buffer.concat(
      json.zones.flatMap((zone) => {
        const header = ZoneHeader.allocateFrom(zone)
        const pos = zone.points[0].pos
        const points = zone.points.map((point) => ZonePoint.allocateFrom(point, pos))
        return [header, ...points]
      }),
    )

    return Buffer.concat([header, scene, interactiveObjects, fogs, nodes, zones])
  }
}
