import { Injectable } from '@nestjs/common'
import { ConfirmationCode, Device, PasswordRecoveryCode, PrismaClient, User } from '@prisma/client'
import { UserDetails } from '../../../infrastructure/types/user-details.type'
import { generateHashService } from '../../../infrastructure/services/generate-hash.service'

interface ICreatePasswordRecoveryCode {
	email: string
	recoveryCode: string
	active: boolean
}

interface ICreateDeviceDto {
	id: string
	ip: string
	title: string
	userId: string
	lastActiveDate: Date
	expireAt: Date
}


@Injectable()
export class UsersRepository {
	constructor(protected prisma: PrismaClient) {
	}

	async findUserByUserNameOrEmail(username: string, email: string)
		: Promise<User | null> {
		return this.prisma.user.findFirst({
			where: { OR: [{ username }, { email }] }
		})
	}

	async findConfirmationCode(confirmationCode: string)
		: Promise<ConfirmationCode | null> {
		return this.prisma.confirmationCode.findUnique({
			where: { confirmationCode }
		})
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { email } })
	}

	async findUserById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { id }
		})
	}

	async createUser({ username, email, password }) {
		const passwordHash = await generateHashService(password)
		return this.prisma.user.create({ data: { username, email, passwordHash } })
	}

	async createConfirmationCode(userId: string, confirmationCode: string)
		: Promise<ConfirmationCode> {
		return this.prisma.confirmationCode.create({
			data: { userId, confirmationCode }
		})
	}

	async updateConfirmation(id: string, isConfirmed: boolean)
		: Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { isConfirmed }
		})
	}

	async findActivePasswordRecoveryCodeByEmail(email: string)
		: Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.findUnique({
			where: { email, active: true }
		})
	}

	async updatePasswordHash(id: string, passwordHash: string)
		: Promise<User> {
		return this.prisma.user.update({
			where: { id },
			data: { passwordHash }
		})
	}

	async createPasswordRecoveryCode({ email, recoveryCode, active }
																		 : ICreatePasswordRecoveryCode)
		: Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.create({
			data: { email, recoveryCode, active }
		})
	}

	async deactivatePasswordRecoveryCode(id: string)
		: Promise<PasswordRecoveryCode> {
		return this.prisma.passwordRecoveryCode.update({
			where: { id },
			data: { active: false }
		})
	}

	async createDevice(data: ICreateDeviceDto)
		: Promise<Device> {
		return this.prisma.device.create({ data })
	}

	async findDeviceById(id: string)
		: Promise<Device> {
		return this.prisma.device.findUnique({
			where: { id }
		})
	}

	async updateActiveDate(id: string, lastActiveDate: Date)
		: Promise<Device> {
		return this.prisma.device.update({
			where: { id },
			data: { lastActiveDate }
		})
	}

	async createUserFromOAuth(details: UserDetails)
		: Promise<User> {
		return this.prisma.user.create({
			data: {
				email: details.email,
				username: details.displayName,
				passwordHash: 'none',
				isConfirmed: true
			}
		})
	}

}
