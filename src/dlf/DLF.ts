import { BinaryIO } from '@common/BinaryIO.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import { type ArxDlfHeader, DlfHeader } from '@dlf/DlfHeader.js'
import { type ArxFog, Fog } from '@dlf/Fog.js'
import { type ArxInteractiveObject, InteractiveObject } from '@dlf/InteactiveObject.js'
import { ArxZoneAndPathFlags, type ArxZoneAndPathHeader, ZoneAndPathHeader } from '@dlf/ZoneAndPathHeader.js'
import { type ArxZoneAndPathPoint, ZoneAndPathPoint } from '@dlf/ZoneAndPathPoint.js'
import { type ArxScene, Scene } from '@dlf/Scene.js'
import type { SetOptional, Simplify } from 'type-fest'

export type ArxZone = Simplify<
  SetOptional<
    Omit<ArxZoneAndPathHeader, 'numberOfPoints' | 'pos' | 'flags'>,
    'backgroundColor' | 'ambience' | 'ambienceMaxVolume' | 'drawDistance'
  > & {
    points: ArxZoneAndPathPoint[]
  }
>

export type ArxPath = Pick<ArxZone, 'name' | 'points'>

export type ArxDLF = {
  header: Omit<ArxDlfHeader, 'numberOfInteractiveObjects' | 'numberOfFogs' | 'numberOfZonesAndPaths'>
  scene: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  fogs: ArxFog[]
  paths: ArxPath[]
  zones: ArxZone[]
}

export class DLF {
  static load(decompressedFile: ArrayBufferLike): ArxDLF {
    const file = new BinaryIO(decompressedFile)

    const { numberOfInteractiveObjects, numberOfFogs, numberOfZonesAndPaths, ...header } = DlfHeader.readFrom(file)

    const data: ArxDLF = {
      header,
      scene: Scene.readFrom(file),
      interactiveObjects: times(() => {
        return InteractiveObject.readFrom(file)
      }, numberOfInteractiveObjects),
      fogs: times(() => {
        return Fog.readFrom(file)
      }, numberOfFogs),
      paths: [],
      zones: [],
    }

    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64))

    times(() => {
      const { numberOfPoints, pos, height, name, backgroundColor, ambience, ambienceMaxVolume, drawDistance, flags } =
        ZoneAndPathHeader.readFrom(file)

      const points = times(() => {
        return ZoneAndPathPoint.readFrom(file, pos)
      }, numberOfPoints)

      /**
       * zones and paths are the same, the only difference is if height = 0 then it's a path, otherwise a zone
       *
       * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/scene/LoadLevel.cpp#L407
       */
      if (height === 0) {
        const path: ArxPath = { name, points }
        data.paths.push(path)
      } else {
        const zone: ArxZone = { name, points, height }

        if (flags & ArxZoneAndPathFlags.SetAmbience) {
          zone.ambience = ambience
          zone.ambienceMaxVolume = ambienceMaxVolume
        }

        if (flags & ArxZoneAndPathFlags.SetBackgroundColor) {
          zone.backgroundColor = backgroundColor
        }

        if (flags & ArxZoneAndPathFlags.SetDrawDistance) {
          zone.drawDistance = drawDistance
        }

        data.zones.push(zone)
      }
    }, numberOfZonesAndPaths)

    return data
  }

  static save(json: ArxDLF): ArrayBuffer {
    const header = DlfHeader.accumulateFrom(json)
    const scene = Scene.accumulateFrom(json.scene)
    const interactiveObjects = concatArrayBuffers(json.interactiveObjects.map(InteractiveObject.accumulateFrom))
    const fogs = concatArrayBuffers(json.fogs.map(Fog.accumulateFrom))
    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    const nodes = new ArrayBuffer(numberOfNodes * (204 + numberOfNodeLinks * 64))

    const paths = concatArrayBuffers(
      json.paths.flatMap((path) => {
        const header = ZoneAndPathHeader.allocateFrom(path)
        const { pos } = path.points[0]
        const points = path.points.map((point) => {
          return ZoneAndPathPoint.allocateFrom(point, pos)
        })

        return [header, ...points]
      }),
    )

    const zones = concatArrayBuffers(
      json.zones.flatMap((zone) => {
        const header = ZoneAndPathHeader.allocateFrom(zone)
        const { pos } = zone.points[0]
        const points = zone.points.map((point) => {
          return ZoneAndPathPoint.allocateFrom(point, pos)
        })

        return [header, ...points]
      }),
    )

    return concatArrayBuffers([header, scene, interactiveObjects, fogs, nodes, paths, zones])
  }
}
