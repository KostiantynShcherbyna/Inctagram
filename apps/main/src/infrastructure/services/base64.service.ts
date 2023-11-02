import { Injectable } from '@nestjs/common'
import { ICreateUserPhotoPath } from '../types/create-user-photo-path.interface'
import { ICreatePostImagePath } from '../types/create-post-image-path.interface'

@Injectable()
export class Base64Service {

	async encodeUserPhotoPath(details: ICreateUserPhotoPath)
		: Promise<string> {
		const path = `${details.userId} ${details.photoId}`
		const base64path = Buffer.from(path).toString('base64')
		return `${base64path}${details.originalname}`
	}

	async decodeUserPhotoPath(photoToken: string): Promise<string> {
		const codes = photoToken.split('==')
		return Buffer.from(codes[0], 'base64').toString('utf-8')
	}

	async encodePostImagePath(details: ICreatePostImagePath)
		: Promise<string> {
		const path = `${details.userId} ${details.postId} ${details.imageId}`
		const base64path = Buffer.from(path).toString('base64')
		return `${base64path}${details.originalname}`
	}

	async decodePostImagePath(postImageToken: string)
		: Promise<string> {
		const codes = postImageToken.split('==')
		return Buffer.from(codes[0], 'base64').toString('utf-8')
	}

}