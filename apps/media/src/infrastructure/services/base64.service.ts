import { Injectable } from '@nestjs/common'
import { ICreateAvatarPath } from '../types/users.types'
import { ICreatePostImagePath } from '../types/posts.types'

@Injectable()
export class Base64Service {

	async encodeAvatarPath(details: ICreateAvatarPath)
		: Promise<string> {
		const path = `${details.userId} ${details.avatarId}`
		const base64path = Buffer.from(path).toString('base64')
		return `${base64path}${details.originalname}`
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