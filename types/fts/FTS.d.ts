import { Buffer } from 'node:buffer'

export type ArxFTS = {
  meta: {
    type: 'fts'
    numberOfLeftoverBytes: 0
  }
  // TODO
}

export declare class FTS {
  static load(rawIn: Buffer): ArxFTS
  static save(data: ArxFTS): Buffer
}
