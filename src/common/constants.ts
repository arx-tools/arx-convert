import { invert } from './helpers.ts'

/**
 * 1.44f converted from C style float.
 */

export const DANAE_VERSION = 1.440_000_057_220_459

export const LITTLE_ENDIAN = true
export const BIG_ENDIAN = false

export const TRUNCATE_ZERO_BYTES = 'truncate zero bytes'
export const KEEP_ZERO_BYTES = 'keep zero bytes'

export const MAP_WIDTH_IN_CELLS = 160
export const MAP_DEPTH_IN_CELLS = 160

/**
 * ASCII / ISO 8859-1 characters.
 *
 * @see https://cs.stanford.edu/people/miles/iso8859.html
 * @see https://mathiasbynens.be/notes/javascript-escapes
 */
/* eslint-disable unicorn/prefer-unicode-code-point-escapes -- the table mirrors the ISO-8859-1 code
   points, and the fixed width four digit form keeps the columns aligned */
// prettier-ignore
export const CHARS: readonly string[] = [
  '\0', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007', '\b', '\t', '\n', '\v', '\f', '\r', '\u000E', '\u000F',
  '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017', '\u0018', '\u0019', '\u001A', '\u001B', '\u001C', '\u001D', '\u001E', '\u001F',
  ' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
  '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', '\u007F',
  '\u0080', '\u0081', '\u0082', '\u0083', '\u0084', '\u0085', '\u0086', '\u0087', '\u0088', '\u0089', '\u008A', '\u008B', '\u008C', '\u008D', '\u008E', '\u008F',
  '\u0090', '\u0091', '\u0092', '\u0093', '\u0094', '\u0095', '\u0096', '\u0097', '\u0098', '\u0099', '\u009A', '\u009B', '\u009C', '\u009D', '\u009E', '\u009F',
  '\u00A0', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', '­', '®', '¯',
  '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿',
  'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
  'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
  'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
  'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ',
]
/* eslint-enable unicorn/prefer-unicode-code-point-escapes */

export const CODES = invert(CHARS as string[])

export const BYTE_OF_AN_UNKNOWN_CHAR = CHARS.indexOf(' ')

export const CHAR_OF_AN_UNKNOWN_BYTE = ' '
