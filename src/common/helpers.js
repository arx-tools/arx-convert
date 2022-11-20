const maxAll = (arr) => {
  let len = arr.length
  let max = -Infinity

  while (len--) {
    max = arr[len] > max ? arr[len] : max
  }

  return max
}

const isZeroVertex = ({ x, y, z }) => {
  return Math.abs(x) < Number.EPSILON && Math.abs(y) < Number.EPSILON && Math.abs(z) < Number.EPSILON
}

const getLowestByte = (int) => int & 0xff

// https://stackoverflow.com/a/14438954/1806628
const uniq = (values) => {
  return values.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
}

const times = (fn, repetitions) => {
  return [...Array(repetitions)].map(() => fn())
}

const repeat = (value, repetitions) => {
  return Array(repetitions).fill(value)
}

module.exports = {
  maxAll,
  isZeroVertex,
  getLowestByte,
  uniq,
  times,
  repeat,
}
