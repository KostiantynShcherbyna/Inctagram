import { GoogleUser, PrismaClient } from '@prisma/client'

export interface ICreateGoogleUser {
	name: string
	email: string
}

export class GoogleUserEntity {
	constructor(private readonly prisma: PrismaClient['googleUser']) {}

	async createUser({ name, email }: ICreateGoogleUser): Promise<GoogleUser> {
		return this.prisma.create({
			data: {
				email,
				name
			}
		})
	}
}
