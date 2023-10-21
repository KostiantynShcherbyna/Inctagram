import { Injectable } from '@nestjs/common'
import { PrismaClient, User } from '@prisma/client'
import { UserDetails } from '../../auth/user-details.type'
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
		return this.prisma.user.findFirst({
			where: {
				confirmationCodes: { has: confirmationCode }
			}
		})
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { email }
		})
	}

	async createUser(
		userEntity: UserEntity,
		userDTO: ICreateUser
	): Promise<User> {
		return userEntity.createUser(userDTO)
	}

	async addConfirmationCode(
		id: string,
		confirmationCode: string
	): Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { confirmationCodes: { push: confirmationCode } }
		})
	}

	async updateConfirmation(id: string, isConfirmed: boolean): Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { isConfirmed }
		})
	}

	async createGoogleUser(details: UserDetails) {
		return await this.prisma.googleUser.create({
			data: {
				email: details.email,
				name: details.displayName
			}
		})
	}
}
