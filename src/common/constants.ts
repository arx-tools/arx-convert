export const DANAE_VERSION = 1.440000057220459 // 1.44f

export const LITTLE_ENDIAN = true
export const BIG_ENDIAN = false

export const TRUNCATE_ZERO_BYTES = 'truncate zero bytes'
export const KEEP_ZERO_BYTES = 'keep zero bytes'

export const MAP_WIDTH_IN_CELLS = 160
export const MAP_DEPTH_IN_CELLS = 160

// source: https://cs.stanford.edu/people/miles/iso8859.html
// source: https://mathiasbynens.be/notes/javascript-escapes

// prettier-ignore
export const CHARS = [
  '\0', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\b', '\t', '\n', '\v', '\f', '\r', '\x0e', '\x0f',
  '\0x10', '\0x11', '\0x12', '\0x13', '\0x14', '\0x15', '\0x16', '\0x17', '\0x18', '\0x19', '\0x1a', '\0x1b', '\0x1c', '\0x1d', '\0x1e', '\0x1f',
  ' ', '!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
  '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', '\x7f',
  '\x80', '\x81', '\x82', '\x83', '\x84', '\x85', '\x86', '\x87', '\x88', '\x89', '\x8a', '\x8b', '\x8c', '\x8d', '\x8e', '\x8f',
  '\x90', '\x91', '\x92', '\x93', '\x94', '\x95', '\x96', '\x97', '\x98', '\x99', '\x9a', '\x9b', '\x9c', '\x9d', '\x9e', '\x9f',
  '\xa0', '¡', '¢', '£', '¤', '¥', '¦', '§', '¨', '©', 'ª', '«', '¬', '\xad', '®', '¯',
  '°', '±', '²', '³', '´', 'µ', '¶', '·', '¸', '¹', 'º', '»', '¼', '½', '¾', '¿',
  'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï',
  'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', '×', 'Ø', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'Þ', 'ß',
  'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï',
  'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', '÷', 'ø', 'ù', 'ú', 'û', 'ü', 'ý', 'þ', 'ÿ'
]

export const CODES: Record<string, number> = {}
CHARS.forEach((value, idx) => {
  CODES[value] = idx
})

export const BYTE_OF_AN_UNKNOWN_CHAR = CODES[' ']

export const CHAR_OF_AN_UNKNOWN_BYTE = ' '
