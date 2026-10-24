import { createXoConfig } from '@arx-tools/config'
import type { XoConfigItem } from 'xo'

// the annotation keeps the type portability: without it the inferred type points into the
// `node_modules` of the package, which typescript does not accept
const xoConfig: XoConfigItem[] = [
  ...createXoConfig(),
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'scripts/**/*.ts'],
    rules: {
      // the formatter strips the parentheses that this rule asks for, so the two can never be
      // satisfied together: `BinaryIO.sizeOfInt32() * 2 + BinaryIO.sizeOfQuat()` is a sum whose
      // fields are products, and the precedence is intentional
      '@stylistic/no-mixed-operators': 'off',
      // the serializers pass static methods as unbound callbacks (`map(Polygon.accumulateFrom)`),
      // where `this` would be wrong, so the class reference is the intended form
      'unicorn/class-reference-in-static-methods': 'off',
      // `ArxKeyFrame` / `isKeyFrame` are part of the published api: renaming them belongs to the
      // breaking-change round (the enums go then too), not to the tooling migration
      'unicorn/consistent-compound-words': 'off',
    },
  },
]

export default xoConfig
