import { writeFile } from "node:fs"
import { dirname, join } from "node:path"
import * as Buffer from "buffer"

export const saveFileUtil = (relativePath: string, data: Buffer) => {
  return new Promise<void>((resolve, reject) => {
    const rootDirPath = dirname(require("main").filename)
    const filePath = join(rootDirPath, relativePath)

    try {
      writeFile(filePath, data, err => {
        if (err) {
          console.log(err)
          reject(err)
        }
        resolve()
      })
    } catch (err) {
      console.log(err)
    }
  })
}
