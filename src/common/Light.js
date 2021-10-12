const BinaryIO = require("../binary/BinaryIO.js");
const { repeat } = require("ramda");

class Light {
  static readFrom(binary) {
    const data = {
      pos: binary.readVector3(),
      rgb: binary.readColor(),
      fallstart: binary.readFloat32(),
      fallend: binary.readFloat32(),
      intensity: binary.readFloat32(),
      i: binary.readFloat32(),
      exFlicker: binary.readColor(),
      exRadius: binary.readFloat32(),
      exFrequency: binary.readFloat32(),
      exSize: binary.readFloat32(),
      exSpeed: binary.readFloat32(),
      exFlareSize: binary.readFloat32(),
    };

    binary.readFloat32Array(24); // fpad

    data.extras = binary.readInt32();

    binary.readInt32Array(31); // lpad

    return data;
  }

  static accumulateFrom(light) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeVector3(light.pos);
    binary.writeColor(light.rgb);
    binary.writeFloat32(light.fallstart);
    binary.writeFloat32(light.fallend);
    binary.writeFloat32(light.intensity);
    binary.writeFloat32(light.i);
    binary.writeColor(light.exFlicker);
    binary.writeFloat32(light.exRadius);
    binary.writeFloat32(light.exFrequency);
    binary.writeFloat32(light.exSize);
    binary.writeFloat32(light.exSpeed);
    binary.writeFloat32(light.exFlareSize);

    binary.writeFloat32Array(repeat(0, 24));

    binary.writeInt32(light.extras);

    binary.writeInt32Array(repeat(0, 31));

    return buffer;
  }

  static sizeOf() {
    return 296;
  }
}

module.exports = Light;
