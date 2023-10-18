import { PrismaClient, User } from '@prisma/client'
import { Injectable } from '@nestjs/common'

export interface ICreateUser {
	email: string
	username: string
	passwordHash: string
	confirmationCode: string
}

export class UserEntity {
	constructor(private readonly prisma: PrismaClient['user']) {}

	async createUser(data: ICreateUser): Promise<User> {
		// do some custom validation...
		return this.prisma.create({ data })
	}
}
