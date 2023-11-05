import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'


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


}
