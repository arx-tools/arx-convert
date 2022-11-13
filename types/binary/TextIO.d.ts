export declare class TextIO {
  constructor(charset: string)

  decode(bytes: number[]): string
  encode(str: string): number[]
}
