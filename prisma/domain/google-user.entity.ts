import { GoogleUser, PrismaClient } from '@prisma/client'

export interface ICreateGoogleUser {
	name: string
	email: string
}

export class UserEntity {
	constructor(private readonly prisma: PrismaClient['googleUser']) {}

	async createGoogleUser({
		name,
		email
	}: ICreateGoogleUser): Promise<GoogleUser> {
		return this.prisma.create({
			data: {
				name,
				email
			}
		})
	}
}
