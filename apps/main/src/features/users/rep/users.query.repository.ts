import { Injectable, NotFoundException } from '@nestjs/common'
import { Avatar, PrismaClient, User } from '@prisma/client'


@Injectable()
export class UsersQueryRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findMe(id: string) {
		return this.prismaClient.user.findUnique({
			where: { id },
			select: { id: true, username: true, email: true }
		})
	}

	async findProfile(id: string) {
		console.log("id", id)
		const user = await this.prismaClient.user
			.findUnique({ where: { id } })
		if (!user)
			throw new NotFoundException()
		const avatars = await this.prismaClient.avatar
			.findMany({ where: { userId: user.id } })

		return this.mapProfile(user, avatars)
	}

	private mapProfile(user: User, avatars: Avatar[]) {
		return {
			id: user.id,
			username: user.username,
			firstname: user.firstname,
			lastname: user.lastname,
			city: user.city,
			dateOfBirth: user.birthDate,
			aboutMe: user.aboutMe,
			avatars: avatars.length
				? avatars.map(i => ({
					url: i.url,
					width: i.width,
					height: i.height,
					fileSize: i.size
				}))
				: [],
			createdAt: user.createdAt
		}
	}

}
