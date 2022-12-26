import { Buffer } from 'node:buffer'
import { BinaryIO } from '../common/BinaryIO'
import { times } from '../common/helpers'
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
  header: Omit<ArxDlfHeader, 'numberOfInteractiveObjects' | 'numberOfFogs' | 'numberOfPaths'>
  scene: ArxScene
  interactiveObjects: ArxInteractiveObject[]
  fogs: ArxFog[]
  paths: ArxPath[]
}

export class DLF {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile.buffer)

    const { numberOfInteractiveObjects, numberOfFogs, numberOfPaths, ...header } = DlfHeader.readFrom(file)

    const data: ArxDLF = {
      header: header,
      scene: Scene.readFrom(file),
      interactiveObjects: times(() => InteractiveObject.readFrom(file), numberOfInteractiveObjects),
      fogs: times(() => Fog.readFrom(file), numberOfFogs),
      paths: [],
    }

    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    file.readInt8Array(numberOfNodes * (204 + numberOfNodeLinks * 64))

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
    const scene = Scene.accumulateFrom(json.scene)
    const interactiveObjects = Buffer.concat(json.interactiveObjects.map(InteractiveObject.accumulateFrom))
    const fogs = Buffer.concat(json.fogs.map(Fog.accumulateFrom))
    const numberOfNodes = 0
    const numberOfNodeLinks = 12
    const nodes = Buffer.alloc(numberOfNodes * (204 + numberOfNodeLinks * 64))
    const paths = Buffer.concat(
      json.paths.map((path) => {
        const pathHeader = PathHeader.allocateFrom(path)
        const pathways = Buffer.concat(path.pathways.map(Pathway.allocateFrom))
        return Buffer.concat([pathHeader, pathways])
      }),
    )

    return Buffer.concat([header, scene, interactiveObjects, fogs, nodes, paths])
  }
}
