export const maxAll = (arr: number[]) => {
  let len = arr.length
  let max = -Infinity

  while (len--) {
    max = arr[len] > max ? arr[len] : max
  }

  return max
}

export const isZeroVertex = ({ x, y, z }: { x: number; y: number; z: number }) => {
  return Math.abs(x) < Number.EPSILON && Math.abs(y) < Number.EPSILON && Math.abs(z) < Number.EPSILON
}

export const getLowestByte = (int: number) => int & 0xff

// https://stackoverflow.com/a/14438954/1806628
export const uniq = <T>(values: T[]) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const repeat = <T>(value: T, repetitions: number): T[] => {
  return Array(repetitions).fill(value)
}
