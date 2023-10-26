import { Injectable } from '@nestjs/common'
import { join } from 'node:path'
import { DeleteObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import { WallpaperNormalTypes } from '../utils/constants'

interface ISavePhoto {
	userId: string;
	fileName: string;
	photoBuffer: Buffer;
}

@Injectable()
export class FilesS3Adapter {
	constructor() {
		this.client = new S3Client({
			region: this.region,
			credentials: {
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey
			}
		})
	}

	client: S3Client
	accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'AKIA4G4XO77CUZPK6PRP'
	secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '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'
	region = process.env.S3_REGION
	bucketName = process.env.S3_BUCKET

	async saveWallpaper({ userId, fileName, photoBuffer }: ISavePhoto) {

		const relativeFolderPath = join('users', userId, 'photos', fileName)

		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: relativeFolderPath,
			Body: photoBuffer,
			ContentType: WallpaperNormalTypes.Jpeg
		})

		let response: PutObjectCommandOutput
		try {
			// response = await this.client.send(command);
			// console.log(response);
		} catch (err) {
			console.error(err)
			throw err
		}

		return relativeFolderPath
	}

	async deleteWallpaper(userId: string, filePath: string) {

		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: filePath
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