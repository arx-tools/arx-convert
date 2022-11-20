import { Buffer } from 'node:buffer'
import { ArxFtsHeader } from './FtsHeader'

export type ArxFTS = {
  meta: {
    type: 'fts'
    numberOfLeftoverBytes: 0
  }
  header: Omit<ArxFtsHeader, 'numberOfUniqueHeaders'>
  // TODO
}

export declare class FTS {
  static load(rawIn: Buffer): ArxFTS
  static save(data: ArxFTS): Buffer
}
