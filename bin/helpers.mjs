import fs from 'fs'
import path from 'path'

export const fileExists = async filename => {
  try {
    await fs.promises.access(filename, fs.constants.R_OK)
    return true
  } catch (error) {
    return false
  }
}

export const getPackageVersion = async () => {
  const packageRootDir = path.dirname(path.dirname(import.meta.url.replace('file:///', '')))
  try {
    const { version } = JSON.parse(await fs.promises.readFile(path.resolve(packageRootDir, './package.json')))
    return version
  } catch (error) {
    return 'unknown'
  }
}

export const streamToBuffer = input => new Promise((resolve, reject) => {
  const chunks = []
  input.on('data', chunk => {
    chunks.push(chunk)
  })
  input.on('end', () => {
    resolve(Buffer.concat(chunks))
  })
  input.on('error', e => {
    reject(e)
  })
})

export const stringifyJSON = (json, prettify = false) => {
  if (prettify) {
    return JSON.stringify(json, null, '\t')
  } else {
    return JSON.stringify(json)
  }
}
