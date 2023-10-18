import { Injectable } from '@nestjs/common'
import { PrismaClient, User } from '@prisma/client'
import {
	ICreateUser,
	UserEntity
} from '../../../../../../prisma/domain/user.entity'

@Injectable()
export class UsersRepository {
	constructor(protected prisma: PrismaClient) {}

	async findUserByUserNameOrEmail(
		username: string,
		email: string
	): Promise<User | null> {
		return this.prisma.user.findFirst({
			where: { OR: [{ username }, { email }] }
		})
	}

	async createUser(newUserDTO: ICreateUser): Promise<User> {
		const userEntity = new UserEntity(this.prisma.user)
		return userEntity.createUser(newUserDTO)
	}
}
