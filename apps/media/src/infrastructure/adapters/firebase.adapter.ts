import { Injectable } from '@nestjs/common'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

@Injectable()
export class FirebaseAdapter {

	constructor() {
	}

	async upload(filePath: string, data: Buffer) {
		const storage = getStorage()
		const storageRef = ref(storage, filePath)
		console.log('storageRef', storageRef)
		const bytes = new Uint8Array(data.buffer)
		await uploadBytes(storageRef, bytes)
		return await getDownloadURL(storageRef)
	}

	async downloadAvatar(folderPath: string): Promise<string> {
		const storage = getStorage()
		const starsRef = ref(storage, folderPath)
		return await getDownloadURL(starsRef)
	}

	async delete(filePath: string) {
		const storage = getStorage()
		const desertRef = ref(storage, filePath)
		await deleteObject(desertRef)
	}

}