const BinaryIO = require("../binary/BinaryIO.js");
const Header = require("./Header.js");
const Scene = require("./Scene.js");
const InteractiveObject = require("./InteactiveObject.js");
const Light = require("../common/Light.js");
const Fog = require("./Fog.js");
const PathHeader = require("./PathHeader.js");
const Pathways = require("./Pathways.js");
const LightingHeader = require("../common/LightingHeader.js");
const Color = require("../common/Color.js");
const { Buffer } = require("buffer");

class DLF {
  static load(decompressedFile) {
    const file = new BinaryIO(decompressedFile.buffer);

    const {
      numberOfScenes,
      numberOfInteractiveObjects,
      // numberOfNodes,
      // numberOfNodeLinks,
      // numberOfZones,
      numberOfLights,
      numberOfFogs,
      // numberOfBackgroundPolygons,
      // numberOfIgnoredPolygons,
      // numberOfChildPolygons,
      numberOfPaths,
      ...header
    } = Header.readFrom(file);

    const data = {
      meta: {
        type: "dlf",
        numberOfLeftoverBytes: 0,
      },
      header: header,
      scene: numberOfScenes > 0 ? Scene.readFrom(file) : null,
      interactiveObjects: [...Array(numberOfInteractiveObjects)].map(() => {
        return InteractiveObject.readFrom(file);
      }),
    };

    if (header.lighting > 0) {
      // TODO: is this a boolean?
      const { numberOfColors } = LightingHeader.readFrom(file);

      data.colors = [...Array(numberOfColors)].map(() => {
        return Color.readFrom(file, header.version > 1.001);
      });
    } else {
      data.colors = null;
    }

    data.lights = [...Array(header.version < 1.003 ? 0 : numberOfLights)].map(
      () => Light.readFrom(file)
    );

    data.fogs = [...Array(numberOfFogs)].map(() => Fog.readFrom(file));

    if (header.version > 1.001) {
      // waste bytes
      file.readInt8Array(
        header.numberOfNodes * (204 + header.numberOfNodeLinks * 64)
      ); // TODO: what are these magic numbers?
    } else {
      // TODO: read data into data.nodes and data.numberOfNodeLinks
    }

    data.paths = [...Array(numberOfPaths)].map(() => {
      const { numberOfPathways, ...pathHeader } = PathHeader.readFrom(file);

      return {
        header: pathHeader,
        pathways: [...Array(numberOfPathways)].map(
          () => Pathways.readFrom(file),
          numberOfPathways
        ),
      };
    });

    const remainedBytes = decompressedFile.length - file.position;
    if (remainedBytes > 0) {
      data.meta.numberOfLeftoverBytes = remainedBytes;
    }

    return data;
  }

  static save(json) {
    const header = Header.accumulateFrom(json);
    const scene = Scene.accumulateFrom(json);
    const interactiveObjects = Buffer.concat(
      json.interactiveObjects.map(
        InteractiveObject.accumulateFrom.bind(InteractiveObject)
      )
    );

    let lighting;
    if (json.header.lighting > 0) {
      const lightingHeader = LightingHeader.accumulateFrom(json);

      const colors = Buffer.concat(
        json.colors.map((color) =>
          Color.accumulateFrom(color, json.header.version > 1.001)
        )
      );

      lighting = Buffer.concat([lightingHeader, colors]);
    } else {
      lighting = Buffer.from([]);
    }

    const lights = Buffer.concat(
      json.lights.map(Light.accumulateFrom.bind(Light))
    );
    const fogs = Buffer.concat(json.fogs.map(Fog.accumulateFrom.bind(Fog)));

    let nodes;
    if (json.header.version >= 1.001) {
      nodes = Buffer.alloc(
        json.header.numberOfNodes * (204 + json.header.numberOfNodeLinks * 64),
        0
      );
    } else {
      nodes = Buffer.from([]);
    }

    const paths = Buffer.concat(
      json.paths.map((path) => {
        const pathHeader = PathHeader.allocateFrom(path);
        const pathways = Buffer.concat(
          path.pathways.map(Pathways.allocateFrom.bind(Pathways))
        );

        return Buffer.concat([pathHeader, pathways]);
      })
    );

    return Buffer.concat([
      header,
      scene,
      interactiveObjects,
      lighting,
      lights,
      fogs,
      nodes,
      paths,
    ]);
  }
}

module.exports = DLF;
