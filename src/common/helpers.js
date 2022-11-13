const roundTo3Decimals = (num) => Math.round((num * 10 ** 3) / 10 ** 3)

const minAll = (xs) => Math.min.apply(Math, xs)

const isZeroVertex = (vertex) => {
  const { posX, posY, posZ, texU, texV } = vertex
  return posX === 0 && posY === 0 && posZ === 0 && texU === 0 && texV === 0
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
  roundTo3Decimals,
  minAll,
  isZeroVertex,
  getLowestByte,
  uniq,
  times,
  repeat,
}
