import { Injectable } from '@nestjs/common'
import { PrismaClient, UserPhoto } from '@prisma/client'
import { PhotoNormalTypes } from '../../../infrastructure/utils/constants'

interface IUploadUserPhoto {
	id: string
	userId: string
	path: string
	contentType: PhotoNormalTypes
}


@Injectable()
export class UserPhotosRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findUserPhotoById(id: string): Promise<UserPhoto> {
		return this.prismaClient.userPhoto.findUnique({ where: { id } })
	}

	async findUserPhotoByPath(path: string): Promise<UserPhoto> {
		return this.prismaClient.userPhoto.findUnique({ where: { path } })
	}

	async uploadUserPhoto(data: IUploadUserPhoto): Promise<UserPhoto> {
		return this.prismaClient.userPhoto.create({ data })
	}

	async deleteUserPhoto(id: string): Promise<UserPhoto> {
		return this.prismaClient.userPhoto.delete({ where: { id } })
	}


}
