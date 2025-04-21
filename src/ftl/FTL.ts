import { BinaryIO } from '@common/BinaryIO.js'
import { concatArrayBuffers, times } from '@common/helpers.js'
import { Action, type ArxAction } from '@ftl/Action.js'
import { type ArxFace, Face } from '@ftl/Face.js'
import { type ArxFtlHeader, FtlHeader } from '@ftl/FtlHeader.js'
import { type ArxFtlTextureContainer, FtlTextureContainer } from '@ftl/FtlTextureContainer.js'
import { type ArxFtlVertex, FtlVertex } from '@ftl/FtlVertex.js'
import { type ArxGroup, Group } from '@ftl/Group.js'
import { type ArxSelection, Selection } from '@ftl/Selections.js'

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
  static load(decompressedFile: ArrayBufferLike): ArxFTL {
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

  static save(json: ArxFTL): ArrayBuffer {
    const header = FtlHeader.accumulateFrom(json)
    const vertices = concatArrayBuffers(json.vertices.map(FtlVertex.accumulateFrom))
    const faces = concatArrayBuffers(json.faces.map(Face.accumulateFrom))
    const textureContainers = concatArrayBuffers(json.textureContainers.map(FtlTextureContainer.accumulateFrom))
    const groups = concatArrayBuffers(json.groups.map(Group.accumulateFrom))
    const indices = concatArrayBuffers(
      json.groups.map(({ indices }) => {
        const buffer = new ArrayBuffer(BinaryIO.sizeOfInt32Array(indices.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(indices)
        return buffer
      }),
    )
    const actions = concatArrayBuffers(json.actions.map(Action.accumulateFrom))
    const selections = concatArrayBuffers(json.selections.map(Selection.accumulateFrom))
    const selected = concatArrayBuffers(
      json.selections.map(({ selected }) => {
        const buffer = new ArrayBuffer(BinaryIO.sizeOfInt32Array(selected.length))
        const binary = new BinaryIO(buffer)
        binary.writeInt32Array(selected)
        return buffer
      }),
    )

    return concatArrayBuffers([
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
