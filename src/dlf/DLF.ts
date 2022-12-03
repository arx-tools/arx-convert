import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
import { ArxLight, Light } from '../common/Light'
import { ArxDlfHeader, DlfHeader } from './DlfHeader'
import { ArxFog, Fog } from './Fog'
import { ArxInteractiveObject, InteractiveObject } from './InteactiveObject'
import { ArxPathHeader, PathHeader } from './PathHeader'
import { ArxPathway, Pathway } from './Pathway'
import { ArxScene, Scene } from './Scene'

export type ArxPath = {
  header: Omit<ArxPathHeader, 'numberOfPathways'>
  pathways: ArxPathway[]
}

export type ArxDLF = {
  header: Omit<
    ArxDlfHeader,
    'hasScene' | 'numberOfInteractiveObjects' | 'numberOfLights' | 'numberOfFogs' | 'numberOfPaths'
  >
  scene?: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  lights: ArxLight[]
  fogs: ArxFog[]
  paths: ArxPath[]
}

export class DLF {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { hasScene, numberOfInteractiveObjects, numberOfLights, numberOfFogs, numberOfPaths, ...header } =
      DlfHeader.readFrom(file)

    const data: ArxDLF = {
      header: header,
      scene: hasScene ? Scene.readFrom(file) : undefined,
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects),
      lights: times(() => Light.readFrom(file), header.version < 1.003 ? 0 : numberOfLights),
      fogs: times(() => Fog.readFrom(file), numberOfFogs),
      paths: [],
    }

    file.readInt8Array(header.numberOfNodes * (204 + header.numberOfNodeLinks * 64))

    data.paths = times((): ArxPath => {
      const { numberOfPathways, ...pathHeader } = PathHeader.readFrom(file)

      return {
        header: pathHeader,
        pathways: times(() => Pathway.readFrom(file), numberOfPathways),
      }
    }, numberOfPaths)

    return data
  }

  static save(json: ArxDLF) {
    const header = DlfHeader.accumulateFrom(json)
    const scene = typeof json.scene !== 'undefined' ? Scene.accumulateFrom(json.scene) : Buffer.from([])
    const interactiveObjects = Buffer.concat(json.interactiveObjects.map(InteractiveObject.accumulateFrom))
    const lights = Buffer.concat(json.lights.map(Light.accumulateFrom))
    const fogs = Buffer.concat(json.fogs.map(Fog.accumulateFrom))
    const nodes = Buffer.alloc(json.header.numberOfNodes * (204 + json.header.numberOfNodeLinks * 64))
    const paths = Buffer.concat(
      json.paths.map((path) => {
        const pathHeader = PathHeader.allocateFrom(path)
        const pathways = Buffer.concat(path.pathways.map(Pathway.allocateFrom))
        return Buffer.concat([pathHeader, pathways])
      }),
    )

    return Buffer.concat([header, scene, interactiveObjects, lights, fogs, nodes, paths])
  }
}
