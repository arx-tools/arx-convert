import { Buffer } from 'node:buffer'
import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxFtlHeader, FtlHeader } from '@ftl/FtlHeader.js'
import { type ArxFtlVertex, FtlVertex } from '@ftl/FtlVertex.js'
import { type ArxFtlTextureContainer, FtlTextureContainer } from '@ftl/FtlTextureContainer.js'
import { type ArxFace, Face } from '@ftl/Face.js'
import { type ArxGroup, Group } from '@ftl/Group.js'
import { Action, type ArxAction } from '@ftl/Action.js'
import { type ArxSelection, Selection } from '@ftl/Selections.js'
import { times } from '@common/helpers.js'

export type ArxFTL = {
  header: Omit<
    ArxFtlHeader,
    | 'numberOfVertices'
    | 'numberOfFaces'
    | 'numberOfTextures'
    | 'numberOfGroups'
    | 'numberOfActions'
    | 'numberOfSelections'
  >
  vertices: ArxFtlVertex[]
  faces: ArxFace[]
  textureContainers: ArxFtlTextureContainer[]
  groups: ArxGroup[]
  actions: ArxAction[]
  selections: ArxSelection[]
}

export class FTL {
  static load(decompressedFile: Buffer) {
    const file = new BinaryIO(decompressedFile)

    const {
      numberOfVertices,
      numberOfFaces,
      numberOfTextures,
      numberOfGroups,
      numberOfActions,
      numberOfSelections,
      ...header
    } = FtlHeader.readFrom(file)

    const data: ArxFTL = {
      header,
      vertices: times(() => FtlVertex.readFrom(file), numberOfVertices),
      faces: times(() => Face.readFrom(file), numberOfFaces),
      textureContainers: times(() => FtlTextureContainer.readFrom(file), numberOfTextures),
      groups: times(() => Group.readFrom(file), numberOfGroups).map(({ numberOfIndices, ...group }) => {
        group.indices = file.readInt32Array(numberOfIndices)
        return group
      }),
      actions: times(() => Action.readFrom(file), numberOfActions),
      selections: times(() => Selection.readFrom(file), numberOfSelections).map(
        ({ numberOfSelected, ...selection }) => {
          selection.selected = file.readInt32Array(numberOfSelected)
          return selection
        },
      ),
    }

    return data
  }

  static save(json: ArxFTL) {
    const header = FtlHeader.accumulateFrom(json)
    const vertices = Buffer.concat(json.vertices.map(FtlVertex.accumulateFrom))
    const faces = Buffer.concat(json.faces.map(Face.accumulateFrom))
    const textureContainers = Buffer.concat(json.textureContainers.map(FtlTextureContainer.accumulateFrom))
    const groups = Buffer.concat(json.groups.map(Group.accumulateFrom))
    const indices = Buffer.concat(
      json.groups.map(({ indices }) => {
        const buffer = Buffer.alloc(BinaryIO.sizeOfInt32Array(indices.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(indices)
        return buffer
      }),
    )
    const actions = Buffer.concat(json.actions.map(Action.accumulateFrom))
    const selections = Buffer.concat(json.selections.map(Selection.accumulateFrom))
    const selected = Buffer.concat(
      json.selections.map(({ selected }) => {
        const buffer = Buffer.alloc(BinaryIO.sizeOfInt32Array(selected.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(selected)
        return buffer
      }),
    )

    return Buffer.concat([header, vertices, faces, textureContainers, groups, indices, actions, selections, selected])
  }
}
