import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compactFloat32Values, shortestFloat32 } from 'arx-convert/utils'

/**
 * float32 values which are hard to print/parse: the smallest subnormal, the smallest normal, the largest
 * finite value and values which need a rounding to become a float32
 */
const TRICKY_FLOAT32_VALUES = [
  0,
  -0,
  1,
  -1,
  Math.fround(0.1),
  Math.fround(1 / 3),
  Math.fround(Math.PI),
  1.401_298_464_324_817e-45,
  1.175_494_350_822_287_5e-38,
  3.402_823_466_385_288_6e+38,
  16_777_217,
]

void test('shortestFloat32() returns the examples of its jsdoc', () => {
  assert.equal(shortestFloat32(369.999_877_929_687_5), '369.99988')
  assert.equal(shortestFloat32(0.993_289_232_254_028_3), '0.99328923')
  assert.equal(shortestFloat32(2.772_158_483_926_956e-38), '2.7721585e-38')
})

void test('shortestFloat32() parses back to the same float32', () => {
  TRICKY_FLOAT32_VALUES.forEach((value) => {
    const float32 = Math.fround(value)
    const parsedBack = Math.fround(Number.parseFloat(shortestFloat32(float32)))

    // not `assert.equal()`: it uses `Object.is()`, which sees the difference between 0 and -0
    if (parsedBack !== float32) {
      assert.fail(`shortestFloat32(${float32}) gave ${shortestFloat32(float32)}, which parses back to ${parsedBack}`)
    }
  })
})

void test('shortestFloat32() keeps the values JSON can not represent', () => {
  assert.equal(shortestFloat32(Number.POSITIVE_INFINITY), 'Infinity')
  assert.equal(shortestFloat32(Number.NEGATIVE_INFINITY), '-Infinity')
  assert.equal(shortestFloat32(Number.NaN), 'NaN')
  // there is no -0 in JSON, and `BinaryIO.readFloat32()` normalizes it as well
  assert.equal(shortestFloat32(-0), '0')
})

void test('compactFloat32Values() shortens the float32 values of a document', () => {
  assert.equal(compactFloat32Values(JSON.stringify({ v: 369.999_877_929_687_5 })), '{"v":369.99988}')
})

void test('compactFloat32Values() keeps the values JSON.stringify() already wrote in their shortest form', () => {
  assert.equal(compactFloat32Values('{"i":1234567,"j":-42}'), '{"i":1234567,"j":-42}')
  // a computed double (like the `uint8 / 255` color alpha) is not a float32, so its precision is kept
  assert.equal(compactFloat32Values('{"v":0.1}'), '{"v":0.1}')
})

void test('compactFloat32Values() never touches the text inside a string', () => {
  const document = { path: 'C:\\ARX\\level8\\', v: 369.999_877_929_687_5 }

  assert.equal(
    compactFloat32Values(JSON.stringify(document)),
    JSON.stringify({ path: 'C:\\ARX\\level8\\', v: 369.999_88 }),
  )
})

void test('compactFloat32Values() is idempotent', () => {
  const compacted = compactFloat32Values(
    JSON.stringify({ positions: [369.999_877_929_687_5, 0.993_289_232_254_028_3], name: 'level8' }),
  )

  assert.equal(compactFloat32Values(compacted), compacted)
})

void test('compactFloat32Values() keeps every value as the same float32', () => {
  const document: Record<string, number> = {}

  TRICKY_FLOAT32_VALUES.forEach((value, index) => {
    document[`v${index}`] = value
  })

  const compacted = JSON.parse(compactFloat32Values(JSON.stringify(document))) as Record<string, number>

  Object.keys(document).forEach((key) => {
    // not `assert.equal()`: it uses `Object.is()`, which sees the difference between 0 and -0
    if (Math.fround(compacted[key]) !== Math.fround(document[key])) {
      assert.fail(`compactFloat32Values() changed ${key} (${document[key]}) to ${compacted[key]}`)
    }
  })
})
