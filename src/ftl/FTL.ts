import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxFtlHeader, FtlHeader } from '@ftl/FtlHeader.js'
import { type ArxFtlVertex, FtlVertex } from '@ftl/FtlVertex.js'
import { type ArxFtlTextureContainer, FtlTextureContainer } from '@ftl/FtlTextureContainer.js'
import { type ArxFace, Face } from '@ftl/Face.js'
import { type ArxGroup, Group } from '@ftl/Group.js'
import { Action, type ArxAction } from '@ftl/Action.js'
import { type ArxSelection, Selection } from '@ftl/Selections.js'
import { concatUint8Arrays, times } from '@common/helpers.js'

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
  static load(decompressedFile: Uint8Array): ArxFTL {
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

    return {
      header,
      vertices: times(() => {
        return FtlVertex.readFrom(file)
      }, numberOfVertices),
      faces: times(() => {
        return Face.readFrom(file)
      }, numberOfFaces),
      textureContainers: times(() => {
        return FtlTextureContainer.readFrom(file)
      }, numberOfTextures),
      groups: times(() => {
        return Group.readFrom(file)
      }, numberOfGroups).map(({ numberOfIndices, ...group }) => {
        group.indices = file.readInt32Array(numberOfIndices)
        return group
      }),
      actions: times(() => {
        return Action.readFrom(file)
      }, numberOfActions),
      selections: times(() => {
        return Selection.readFrom(file)
      }, numberOfSelections).map(({ numberOfSelected, ...selection }) => {
        selection.selected = file.readInt32Array(numberOfSelected)
        return selection
      }),
    }
  }

  static save(json: ArxFTL): Uint8Array {
    const header = FtlHeader.accumulateFrom(json)
    const vertices = concatUint8Arrays(json.vertices.map(FtlVertex.accumulateFrom))
    const faces = concatUint8Arrays(json.faces.map(Face.accumulateFrom))
    const textureContainers = concatUint8Arrays(json.textureContainers.map(FtlTextureContainer.accumulateFrom))
    const groups = concatUint8Arrays(json.groups.map(Group.accumulateFrom))
    const indices = concatUint8Arrays(
      json.groups.map(({ indices }) => {
        const buffer = new Uint8Array(BinaryIO.sizeOfInt32Array(indices.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(indices)
        return buffer
      }),
    )
    const actions = concatUint8Arrays(json.actions.map(Action.accumulateFrom))
    const selections = concatUint8Arrays(json.selections.map(Selection.accumulateFrom))
    const selected = concatUint8Arrays(
      json.selections.map(({ selected }) => {
        const buffer = new Uint8Array(BinaryIO.sizeOfInt32Array(selected.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(selected)
        return buffer
      }),
    )

    return concatUint8Arrays([
      header,
      vertices,
      faces,
      textureContainers,
      groups,
      indices,
      actions,
      selections,
      selected,
    ])
  }
}
