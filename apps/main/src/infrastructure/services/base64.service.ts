import { Injectable } from '@nestjs/common'
import { ICreateUserPhotoPath } from '../types/create-user-photo-path.interface'

@Injectable()
export class Base64Service {

	async encodeUserPhoto(details: ICreateUserPhotoPath)
		: Promise<string> {
		const text = `${details.userId} ${details.photoId}`
		const base64Text = Buffer.from(text).toString('base64')
		return `${base64Text}${details.originalname}`
	}

	async decodeUserPhoto(photoToken: string): Promise<string> {
		const codes = photoToken.split('==')
		return Buffer.from(codes[0], 'base64').toString('utf-8')
	}

}