import { BinaryIO } from '@common/BinaryIO.js'
import { type ArxColor, Color } from '@common/Color.js'
import { concatUint8Arrays, times } from '@common/helpers.js'
import { type ArxLight, Light } from '@llf/Light.js'
import { LightingHeader } from '@llf/LightingHeader.js'
import { type ArxLlfHeader, LlfHeader } from '@llf/LlfHeader.js'

export type ArxLLF = {
  header: Omit<ArxLlfHeader, 'numberOfLights'>
  lights: ArxLight[]
  colors: ArxColor[]
}

export class LLF {
  static load(decompressedFile: Uint8Array): ArxLLF {
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
      header,
      lights,
      colors,
    }
  }

  static save(json: ArxLLF): Uint8Array {
    const header = LlfHeader.accumulateFrom(json)

    const lights = concatUint8Arrays(json.lights.map(Light.accumulateFrom))

    const lightingHeader = LightingHeader.accumulateFrom(json.colors)

    const colors = concatUint8Arrays(
      json.colors.map((color) => {
        return Color.accumulateFrom(color, 'bgra')
      }),
    )

    return concatUint8Arrays([header, lights, lightingHeader, colors])
  }
}
