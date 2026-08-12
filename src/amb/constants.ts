/**
 * 0x03 0x00 0x00 0x01
 * Used in the majority of amb files, for example in `sfx/ambience/ambient_blackthing.amb`
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L78
 */
export const AMB_VERSION_1003 = 16_777_219

/**
 * 0x02 0x00 0x00 0x01
 * Used in 7 amb files, for example in `sfx/ambience/ambient_crypt_e.amb`
 *
 * @see https://github.com/arx/ArxLibertatis/blob/1.2.1/src/audio/Ambiance.cpp#L77
 */
export const AMB_VERSION_1002 = 16_777_218

/**
 * 0x01 0x00 0x00 0x01
 * Used only in one place, in `ambient_gob_intro.amb`
 *
 * This isn't mentioned explicitly anwyhere in Arx Fatalis/Arx Libertatis code
 */
export const AMB_VERSION_1001 = 16_777_217

export type AMB_VERSIONS = typeof AMB_VERSION_1001 | typeof AMB_VERSION_1002 | typeof AMB_VERSION_1003
