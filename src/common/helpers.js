const roundTo3Decimals = (num) => Math.round((num * 10 ** 3) / 10 ** 3);

const minAll = (xs) => Math.min.apply(Math, xs);

const isZeroVertex = (vertex) => {
  const { posX, posY, posZ, texU, texV } = vertex;
  return posX === 0 && posY === 0 && posZ === 0 && texU === 0 && texV === 0;
};

const getLowestByte = (int) => {
  return int & 0xff;
};

module.exports = {
  roundTo3Decimals,
  minAll,
  isZeroVertex,
  getLowestByte,
};
