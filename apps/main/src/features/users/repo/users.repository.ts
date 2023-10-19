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

	async findUserByConfirmationCode(
		confirmationCode: string
	): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { confirmationCode }
		})
	}

	async createUser(
		userEntity: UserEntity,
		userDTO: ICreateUser
	): Promise<User> {
		return userEntity.createUser(userDTO)
	}

	async updateConfirmation(user: User): Promise<User> {
		return this.prisma.user.update({
			where: { id: user.id },
			data: { confirmationCode: user.confirmationCode, isConfirmed: true }
		})
	}
}
