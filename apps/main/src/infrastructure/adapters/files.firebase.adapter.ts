import { Injectable } from '@nestjs/common'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

@Injectable()
export class FilesFirebaseAdapter {

	constructor() {
	}

	async uploadUserPhoto(folderPath: string, data: Buffer) {
		const storage = getStorage()
		const storageRef = ref(storage, folderPath)
		const bytes = new Uint8Array(data.buffer)
		const up = await uploadBytes(storageRef, bytes)
		console.log('up', up)
		console.log('storageRef', storageRef)
		return await getDownloadURL(storageRef)
	}

	async downloadUserPhoto(folderPath: string): Promise<string> {
		const storage = getStorage()
		const starsRef = ref(storage, folderPath)
		return await getDownloadURL(starsRef)
	}

	async deleteUserPhoto(filePath: string) {
		const storage = getStorage()
		const desertRef = ref(storage, filePath)
		await deleteObject(desertRef)
	}
}