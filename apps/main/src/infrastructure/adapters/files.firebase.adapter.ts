import { Injectable } from '@nestjs/common'
import { PhotoNormalTypes } from '../utils/constants'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

export interface ISavePhoto {
	originalname: string
	buffer: Buffer,
	mimetype: PhotoNormalTypes
}

@Injectable()
export class FilesFirebaseAdapter {

	constructor() {
	}

	async uploadUserPhoto(folderPath: string, data: ISavePhoto) {
		const storage = getStorage()
		const storageRef = ref(storage, folderPath)
		const bytes = new Uint8Array(data.buffer)
		await uploadBytes(storageRef, bytes)
		return await getDownloadURL(storageRef)
	}

	async downloadUserPhoto(folderPath: string): Promise<string> {
		const storage = getStorage()
		const starsRef = ref(storage, folderPath)
		return await getDownloadURL(starsRef)
	}

	async deleteUserPhoto(filePath: string) {
	}
}