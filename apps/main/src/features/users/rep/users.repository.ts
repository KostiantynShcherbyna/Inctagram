import { Injectable } from '@nestjs/common'
import { ConfirmationCode, Device, PasswordRecoveryCode, PrismaClient, User } from '@prisma/client'
import { UserDetails } from '../../../infrastructure/types/auth.types'

interface ICreatePasswordRecoveryCode {
	email: string
	recoveryCode: string
	active: boolean
}

interface ICreateDevice {
	id: string
	ip: string
	title: string
	userId: string
	lastActiveDate: Date
	expireAt: Date
}

type FillProfile = {
	firstname: string
	lastname: string
	birthDate: string
	city: string
	aboutMe: string
}

type EditProfile = Partial<FillProfile>

@Injectable()
export class UsersRepository {
	constructor(protected prismaClient: PrismaClient) {
	}

	async findUserByUserNameOrEmail(username: string, email: string)
		: Promise<User | null> {
		return this.prismaClient.user.findFirst({
			where: { OR: [{ username }, { email }] }
		})
	}

	async findConfirmationCode(confirmationCode: string)
		: Promise<ConfirmationCode | null> {
		return this.prismaClient.confirmationCode.findUnique({
			where: { confirmationCode }
		})
	}

	async findUserByEmail(email: string): Promise<User | null> {
		return this.prismaClient.user.findUnique({ where: { email } })
	}

	async findUserById(id: string): Promise<User | null> {
		return this.prismaClient.user.findUnique({ where: { id } })
	}

	async createUser({ username, email, passwordHash }): Promise<User> {
		return this.prismaClient.user.create({ data: { username, email, passwordHash } })
	}

	async createConfirmationCode(userId: string, confirmationCode: string)
		: Promise<ConfirmationCode> {
		return this.prismaClient.confirmationCode.create({
			data: { userId, confirmationCode }
		})
	}

	async updateConfirmation(id: string, isConfirmed: boolean): Promise<User> {
		return this.prismaClient.user.update({
			where: { id },
			data: { isConfirmed }
		})
	}

	async findActivePasswordRecoveryCodeByEmail(email: string)
		: Promise<PasswordRecoveryCode> {
		return this.prismaClient.passwordRecoveryCode.findFirst({
			where: { email, active: true }
		})
	}

	async updatePasswordHash(id: string, passwordHash: string): Promise<User> {
		return this.prismaClient.user.update({
			where: { id },
			data: { passwordHash }
		})
	}

	async createPasswordRecoveryCode(
		{ email, recoveryCode, active }: ICreatePasswordRecoveryCode)
		: Promise<PasswordRecoveryCode> {
		return this.prismaClient.passwordRecoveryCode.create({
			data: { email, recoveryCode, active }
		})
	}

	async deactivatePasswordRecoveryCode(id: string)
		: Promise<PasswordRecoveryCode> {
		return this.prismaClient.passwordRecoveryCode.update({
			where: { id },
			data: { active: false }
		})
	}

	async createDevice(data: ICreateDevice): Promise<Device> {
		return this.prismaClient.device.create({ data })
	}

	async findDeviceById(id: string): Promise<Device> {
		return this.prismaClient.device.findUnique({
			where: { id }
		})
	}

	async updateActiveDate(id: string, lastActiveDate: any): Promise<Device> {
		return this.prismaClient.device.update({
			where: { id },
			data: { lastActiveDate }
		})
	}

	async createUserFromOAuth(details: UserDetails): Promise<User> {
		return this.prismaClient.user.create({
			data: {
				email: details.email,
				username: details.username,
				passwordHash: null,
				isConfirmed: true
			}
		})
	}


	async updateUserInfo(id: string, data: EditProfile): Promise<User> {
		return this.prismaClient.user.update({ where: { id }, data })
	}

	async deleteUser(id: string): Promise<User> {
		return this.prismaClient.user.delete({ where: { id } })
	}

}
