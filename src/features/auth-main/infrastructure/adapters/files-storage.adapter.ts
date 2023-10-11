import { UsersDocument } from "src/features/sa/application/entities/mongoose/users.schema"
import { emailService } from "../services/email.service"
import { Injectable } from "@nestjs/common"
import { join } from "node:path"
import { ensureDirExists } from "../utils/ensure-dir-exists.util"
import { saveFileUtil } from "../utils/save-file.util"

interface ISaveWallpaperDto {
  blogId: string
  fileName: string
  wallpaperBuffer: Buffer
}

@Injectable()
export class FilesStorageAdapter {
  async saveWallpaper({ blogId, fileName, wallpaperBuffer }: ISaveWallpaperDto) {
    const relativeFolderPath = join("blogs", "wallpapers", blogId, fileName)
    await ensureDirExists(relativeFolderPath)
    await saveFileUtil(relativeFolderPath, wallpaperBuffer)
  }
}