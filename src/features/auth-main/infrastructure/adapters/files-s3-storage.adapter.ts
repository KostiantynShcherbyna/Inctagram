import { Injectable } from "@nestjs/common"
import { join } from "node:path"
import { DeleteObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3"

interface ISaveWallpaperTO {
  userId: string
  blogId: string
  fileName: string
  wallpaperBuffer: Buffer
}

@Injectable()
export class FilesS3StorageAdapter {
  constructor() {
    this.client = new S3Client({})
  }

  client: S3Client
  bucketName: "nest-proj-bucket"

  async saveWallpaper({ userId, blogId, fileName, wallpaperBuffer }: ISaveWallpaperTO) {
    const relativeFolderPath = join("users", userId, "blogs", blogId, "wallpapers", `${fileName}.png`)

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: relativeFolderPath,
      Body: wallpaperBuffer,
      ContentType: "image/png",
      ACL: "public-read",
    })

    let response: PutObjectCommandOutput
    try {
      response = await this.client.send(command)
      console.log(response)
    } catch (err) {
      console.error(err)
      throw err
    }

    return relativeFolderPath

  }

  async deleteWallpaper(userId: string, filePath: string) {

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    })

    try {
      const response = await this.client.send(command)
      console.log(response)
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}