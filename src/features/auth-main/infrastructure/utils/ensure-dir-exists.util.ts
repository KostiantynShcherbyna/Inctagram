import { writeFile } from "node:fs"
import { dirname, join } from "node:path"
import * as Buffer from "buffer"
import { promises as fs } from "fs"

export const ensureDirExists = (relativeFolderPath: string) => {
  return new Promise<void>(async (resolve, reject) => {
    const rootDirPath = dirname(require("main").filename)
    const dirPath = join(rootDirPath, relativeFolderPath)

    const fs = require("fs").promises // Импортируем модуль fs.promises

    await (async () => {
      try {
        if (!await fs.exists(dirPath)) { // Используем fs.exists для проверки существования папки
          await fs.mkdir(dirPath, { recursive: true }) // Используем fs.promises.mkdir для асинхронного создания папки
        }
      } catch (err) {
        console.error(err)
      }
    })()
  })
}
