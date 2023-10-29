import { Injectable } from '@nestjs/common'
import { PhotoNormalTypes } from '../utils/constants'
import { BlobServiceClient } from '@azure/storage-blob'
import { DefaultAzureCredential } from '@azure/identity'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../settings/custom-settings'

export interface ISavePhoto {
	originalname: string
	buffer: Buffer,
	mimetype: PhotoNormalTypes
}

@Injectable()
export class FilesAzureAdapter {
	constructor(protected configService: ConfigService<ConfigType, true>) {
	}

	async uploadUserPhoto(blobName: string, data: ISavePhoto) {
		const containerClient = this.getBlobClient()
		try {
			const blockBlobClient = containerClient.getBlockBlobClient(blobName)
			const uploadBlobResponse = await blockBlobClient.uploadData(data.buffer)
			console.log(`Blob file URL: ${blockBlobClient.url}`)
			console.log(`Upload requestId: ${uploadBlobResponse.requestId}`)
			return blockBlobClient.url
		} catch (err) {
			console.error('uploadUserPhoto', err)
			throw err
		}
	}

	async deleteUserPhoto(filePath: string) {

	}

	private getBlobClient() {
		const accountName = this.configService.get('AZURE_ACCOUNT_NAME', { infer: true })
		const containerName = this.configService.get('AZURE_CONTAINER_NAME', { infer: true })
		const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, new DefaultAzureCredential())
		return blobServiceClient.getContainerClient(containerName)
	}

}