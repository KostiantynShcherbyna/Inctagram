// import { Injectable } from '@nestjs/common'
// import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
// import { PhotoNormalTypes } from '../utils/constants'
//
// export interface IFile {
// 	originalname: string
// 	buffer: Buffer,
// 	mimetype: PhotoNormalTypes
// }
//
// @Injectable()
// export class FilesS3Adapter {
// 	client: S3Client
// 	accessKeyId = process.env.AWS_ACCESS_KEY_ID || 'AKIA4G4XO77CUZPK6PRP'
// 	secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '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'
// 	region = process.env.S3_REGION
// 	bucketName = process.env.S3_BUCKET
//
// 	constructor() {
// 		this.client = new S3Client({
// 			region: this.region,
// 			credentials: {
// 				accessKeyId: this.accessKeyId,
// 				secretAccessKey: this.secretAccessKey
// 			}
// 		})
// 	}
//
// 	async uploadUserPhoto(folderPath: string, data: IFile) {
//
// 		const command = new PutObjectCommand({
// 			Bucket: this.bucketName,
// 			Key: folderPath,
// 			Body: data.buffer,
// 			ContentType: data.mimetype
// 		})
//
// 		try {
// 			// response = await this.client.send(command);
// 			// console.log(response);
// 		} catch (err) {
// 			console.error(err)
// 			throw err
// 		}
//
// 	}
//
// 	async deleteUserPhoto(filePath: string): Promise<boolean> {
//
// 		const command = new DeleteObjectCommand({
// 			Bucket: this.bucketName,
// 			Key: filePath
// 		})
//
// 		try {
// 			const response = await this.client.send(command)
// 			console.log(response)
// 			return true
// 		} catch (err) {
// 			console.error(err)
// 			throw err
// 		}
// 	}
// }