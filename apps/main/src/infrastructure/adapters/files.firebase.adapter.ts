import { Injectable } from '@nestjs/common'
import { PhotoNormalTypes } from '../utils/constants'
import { getStorage, ref, uploadBytes } from 'firebase/storage'

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

		try {
			const storage = getStorage()
			const storageRef = ref(storage, folderPath)
			const bytes = new Uint8Array(data.buffer)
			await uploadBytes(storageRef, bytes)
			return storageRef
		} catch (err) {
			console.error(err)
			throw err
		}

	}

	async deleteUserPhoto(filePath: string) {

	}
}