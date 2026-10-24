import type { Simplify } from 'type-fest'
import { BinaryIO } from '../common/BinaryIO.ts'
import { type ArxColor, Color } from '../common/Color.ts'
import { concatArrayBuffers, times } from '../common/helpers.ts'
import { type ArxLight, Light } from './Light.ts'
import { LightingHeader } from './LightingHeader.ts'
import { type ArxLlfHeader, LlfHeader } from './LlfHeader.ts'

export type ArxLLF = {
  $schema?: string
  header: Simplify<Omit<ArxLlfHeader, 'numberOfLights'>>
  lights: ArxLight[]
  /**
   * Pre-computed vertex light colors for FTS.polygons.
   */
  colors: ArxColor[]
}

export class LLF {
  static load(decompressedFile: ArrayBufferLike): ArxLLF {
    const file = new BinaryIO(decompressedFile)

    const { numberOfLights, ...header } = LlfHeader.readFrom(file)
    const lights = times(() => {
      return Light.readFrom(file)
    }, numberOfLights)

    const { numberOfColors } = LightingHeader.readFrom(file)
    const colors = times(() => {
      return Color.readFrom(file, 'bgra')
    }, numberOfColors)

    return {
      $schema: 'https://arx-tools.github.io/schemas/llf.schema.json',
      header,
      lights,
      colors,
    }
  }

  static save(json: ArxLLF): ArrayBuffer {
    const header = LlfHeader.accumulateFrom(json)

    const lights = concatArrayBuffers(json.lights.map(Light.accumulateFrom))

    const lightingHeader = LightingHeader.accumulateFrom(json.colors)

    const colors = concatArrayBuffers(
      json.colors.map((color) => {
        return Color.accumulateFrom(color, 'bgra')
      }),
    )

    return concatArrayBuffers([header, lights, lightingHeader, colors])
  }
}
