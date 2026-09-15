import type { Float32 } from '@common/types.js'

/**
 * a float32 value has at most 9 significant decimal digits, so 9 is the highest precision worth trying
 */
const MAX_SIGNIFICANT_DIGITS_OF_FLOAT32 = 9

/**
 * sticky, so it can be positioned with `lastIndex` without slicing the json text
 */
const NUMBER_PATTERN = /-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/y

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9'
}

/**
 * Returns the index of the first character after the string literal opening at `indexOfOpeningQuote`.
 * Escaped characters (like `\"`) are skipped, so they don't end the string literal.
 */
function skipStringLiteral(json: string, indexOfOpeningQuote: number): number {
  let index = indexOfOpeningQuote + 1

  while (index < json.length) {
    const char = json[index]

    if (char === '\\') {
      index = index + 2
      continue
    }

    if (char === '"') {
      return index + 1
    }

    index = index + 1
  }

  return index
}

/**
 * Returns the shortest decimal string which still parses back to the very same float32 value.
 *
 * @see {@link Float32} for how a float32 is represented in JavaScript
 *
 * @example
 * ```js
 * shortestFloat32(369.9998779296875)    -> '369.9999'
 * shortestFloat32(0.9932892322540283)   -> '0.99328923'
 * shortestFloat32(2.772158483926956e-38) -> '2.7721585e-38'
 * ```
 */
export function shortestFloat32(value: Float32): string {
  const rounded = Math.fround(value)

  if (!Number.isFinite(rounded)) {
    return rounded.toString()
  }

  for (let significantDigits = 1; significantDigits <= MAX_SIGNIFICANT_DIGITS_OF_FLOAT32; significantDigits++) {
    const candidate = Number.parseFloat(rounded.toPrecision(significantDigits))

    if (Math.fround(candidate) === rounded) {
      return candidate.toString()
    }
  }

  return rounded.toString()
}

/**
 * Rewrites every float32 value of an already stringified JSON into its shortest decimal representation
 * (see {@link shortestFloat32}), so the output text becomes smaller without changing any of the values.
 *
 * - only number tokens containing a `.` or an `e` are rewritten, integers are already printed in their
 *   shortest form by `JSON.stringify()`
 * - only values which are exactly representable as a float32 (`Math.fround(value) === value`) are rewritten,
 *   so computed doubles (like the `uint8 / 255` color alphas) keep their precision
 * - the text is scanned as JSON, so numbers inside strings (like file names) are never touched
 */
export function compactFloat32Values(json: string): string {
  const parts: string[] = []
  let index = 0
  let indexOfPlainTextStart = 0

  while (index < json.length) {
    const char = json[index]

    if (char === '"') {
      index = skipStringLiteral(json, index)
      continue
    }

    if (char !== '-' && !isDigit(char)) {
      index = index + 1
      continue
    }

    NUMBER_PATTERN.lastIndex = index
    const match = NUMBER_PATTERN.exec(json)

    if (match === null) {
      index = index + 1
      continue
    }

    const token = match[0]
    const indexOfTokenEnd = NUMBER_PATTERN.lastIndex

    if (token.includes('.') || token.includes('e') || token.includes('E')) {
      const value = Number.parseFloat(token)

      if (Math.fround(value) === value) {
        const shortest = shortestFloat32(value)

        if (shortest.length < token.length) {
          parts.push(json.slice(indexOfPlainTextStart, index), shortest)
          indexOfPlainTextStart = indexOfTokenEnd
        }
      }
    }

    index = indexOfTokenEnd
  }

  parts.push(json.slice(indexOfPlainTextStart))

  return parts.join('')
}
