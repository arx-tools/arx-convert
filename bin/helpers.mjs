import fs from 'fs'
import path from 'path'

export const fileExists = (filename, flags = fs.constants.R_OK) => {
  try {
    fs.accessSync(filename, flags)
    return true
  } catch (err) {
    return false
  }
}

export const getPackageVersion = () => {
  const packageRootDir = path.dirname(path.dirname(import.meta.url.replace('file:///', '')))
  const { version } = JSON.parse(fs.readFileSync(path.resolve(packageRootDir, './package.json')))
  return version
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