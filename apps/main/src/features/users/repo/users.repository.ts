import { Injectable } from '@nestjs/common'
import { Device, PasswordRecoveryCode, PrismaClient, User } from '@prisma/client'
import { ICreateUser, UserEntity } from '../../../../../../prisma/domain/user.entity'

interface ICreatePasswordRecoveryCode {
	email: string
	recoveryCode: string
	active: boolean
}

@Injectable()
export class UsersRepository {
	constructor(protected prisma: PrismaClient) {
	}

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

	async findUserById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id }
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

	async findActivePasswordRecoveryCodeByEmail(email: string): Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.findUnique({
			where: { email, active: true }
		})
	}

	async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { passwordHash }
		})
	}

	async createPasswordRecoveryCode({ email, recoveryCode, active }: ICreatePasswordRecoveryCode)
		: Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.create({
			data: { email, recoveryCode, active }
		})
	}

	async deactivatePasswordRecoveryCode(id: string): Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.update({
			where: { id },
			data: { active: false }
		})
	}

	async findDeviceById(id: string): Promise<Device> {
		return this.prisma.device.findUnique({
			where: { id }
		})
	}

	async updateActiveDate(id: string, lastActiveDate: Date): Promise<Device> {
		return this.prisma.device.update({
			where: { id },
			data: { lastActiveDate }
		})
	}


}
