const BinaryIO = require("../binary/BinaryIO.js");
const { repeat } = require("ramda");

class Fog {
  static readFrom(binary) {
    const data = {
      pos: binary.readVector3(),
      rgb: binary.readColor(),
      size: binary.readFloat32(),
      special: binary.readInt32(),
      scale: binary.readFloat32(),
      move: binary.readVector3(),
      angle: binary.readAnglef(),
      speed: binary.readFloat32(),
      rotateSpeed: binary.readFloat32(),
      toLive: binary.readInt32(),
      blend: binary.readInt32(),
      frequency: binary.readFloat32(),
    };

    binary.readFloat32Array(32); // fpad
    binary.readInt32Array(32); // lpad
    binary.readString(256); // cpad

    return data;
  }

  static accumulateFrom(fog) {
    const buffer = Buffer.alloc(this.sizeOf(), 0);
    const binary = new BinaryIO(buffer.buffer);

    binary.writeVector3(light.pos);
    binary.writeColor(light.rgb);
    binary.writeFloat32(light.size);
    binary.writeInt32(light.special);
    binary.writeFloat32(light.scale);
    binary.writeVector3(light.move);
    binary.writeAnglef(light.angle);
    binary.writeFloat32(light.speed);
    binary.writeFloat32(light.rotateSpeed);
    binary.writeInt32(light.toLive);
    binary.writeInt32(light.blend);
    binary.writeFloat32(light.frequency);

    binary.writeFloat32Array(repeat(0, 32));
    binary.writeInt32Array(repeat(0, 32));
    binary.writeString("", 256);

    return binary;
  }

  static sizeOf() {
    return (
      3 * 4 +
      3 * 4 +
      4 +
      4 +
      4 +
      3 * 4 +
      3 * 4 +
      4 +
      4 +
      4 +
      4 +
      4 +
      32 * 4 +
      32 * 4 +
      256
    );
  }
}

module.exports = Fog;
