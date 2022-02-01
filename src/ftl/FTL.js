const Header = require("./Header");

class FTL {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer);

    const header = Header.readFrom(file);

    const data = {
      meta: {
        type: "ftl",
        numberOfLeftoverBytes: 0,
      },
      header: header,
    };

    return data;
  }

  static save(json) {
    return Buffer.concat([]);
  }
}

module.exports = FTL;
