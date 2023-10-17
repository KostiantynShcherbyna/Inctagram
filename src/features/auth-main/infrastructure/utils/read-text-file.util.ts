import { readFile } from "node:fs"
import { dirname, join } from "node:path"

export const readTextFile = (relativeFolderPath: string) => {
  return new Promise(async (resolve, reject) => {
    const rootDirPath = dirname(require("main").filename)
    const filePath = join(rootDirPath, relativeFolderPath)

    readFile(filePath, { encoding: "utf-8" }, (err, content) => {
      if (err) {
        console.log(err)
        reject(err)
      } else resolve(content)
    })
  })
}
