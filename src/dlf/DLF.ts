import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxDlfHeader, DlfHeader } from './DlfHeader'
import { ArxFog, Fog } from './Fog'
import { ArxInteractiveObject, InteractiveObject } from './InteactiveObject'
import { ArxZoneHeader, ZoneHeader } from './ZoneHeader'
import { ArxZonePoint, ZonePoint } from './ZonePoint'
import { ArxScene, Scene } from './Scene'

export type ArxZone = Omit<ArxZoneHeader, 'numberOfPoints'> & {
  points: ArxZonePoint[]
}

export type ArxDLF = {
  header: Omit<ArxDlfHeader, 'numberOfInteractiveObjects' | 'numberOfFogs' | 'numberOfZones'>
  scene: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  fogs: ArxFog[]
  zones: ArxZone[]
}

export class DLF {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfInteractiveObjects, numberOfFogs, numberOfZones, ...header } = DlfHeader.readFrom(file)

    const data: ArxDLF = {
      header: header,
      scene: Scene.readFrom(file),
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects),
      fogs: times(() => Fog.readFrom(file), numberOfFogs),
      zones: [],
    }

    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64))

    data.zones = times((): ArxZone => {
      const { numberOfPoints, ...zoneHeader } = ZoneHeader.readFrom(file)

      return {
        ...zoneHeader,
        points: times(() => ZonePoint.readFrom(file), numberOfPoints),
      }
    }, numberOfZones)

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
      json.zones.map((zone) => {
        const header = ZoneHeader.allocateFrom(zone)
        const points = zone.points.map(ZonePoint.allocateFrom)
        return Buffer.concat([header, ...points])
      }),
    )

    return Buffer.concat([header, scene, interactiveObjects, fogs, nodes, zones])
  }
}
