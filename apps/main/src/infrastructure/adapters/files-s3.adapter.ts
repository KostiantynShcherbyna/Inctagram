import { Injectable } from '@nestjs/common'
import { join } from 'node:path'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { PhotoNormalTypes } from '../utils/constants'

export interface ISavePhoto {
	originalname: string
	buffer: Buffer,
	mimetype: PhotoNormalTypes
}

@Injectable()
export class FilesS3Adapter {
	client: S3Client
	accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'AKIA4G4XO77CUZPK6PRP'
	secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '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'
	region = process.env.S3_REGION
	bucketName = process.env.S3_BUCKET

	constructor() {
		this.client = new S3Client({
			region: this.region,
			credentials: {
				accessKeyId: this.accessKeyId,
				secretAccessKey: this.secretAccessKey
			}
		})
	}

	async uploadUserPhoto(userId: string, data: ISavePhoto) {

		const relativeFolderPath = join('users', userId, 'photos', data.originalname)

		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: relativeFolderPath,
			Body: data.buffer,
			ContentType: data.mimetype
		})

		try {
			// response = await this.client.send(command);
			// console.log(response);
		} catch (err) {
			console.error(err)
			throw err
		}

		return relativeFolderPath
	}

	async deletePhoto(filePath: string): Promise<boolean> {

		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: filePath
		})

		try {
			const response = await this.client.send(command)
			console.log(response)
			return true
		} catch (err) {
			console.error(err)
			throw err
		}
	}
}