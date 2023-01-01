export const SUPPORTED_ARX_FORMATS = ['dlf', 'fts', 'llf', 'ftl', 'tea'] as const
export const SUPPORTED_DATA_FORMATS = ['json', 'yaml', 'yml'] as const
export const SUPPORTED_FORMATS = [...SUPPORTED_ARX_FORMATS, ...SUPPORTED_DATA_FORMATS] as const

export type SupportedArxFormat = typeof SUPPORTED_ARX_FORMATS[number]
export type SupportedDataFormat = typeof SUPPORTED_DATA_FORMATS[number]
export type SupportedFormat = typeof SUPPORTED_FORMATS[number]
