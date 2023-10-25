import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { ApiExcludeController } from '@nestjs/swagger'

@ApiExcludeController()
@Controller('testing')
export class TestingController {
	constructor(protected prisma: PrismaClient) {
	}

	@Delete('all-data')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteAllData() {
		const tablenames = await this.prisma
			.$queryRaw<Array<{ tablename: string }>>
			`SELECT tablename FROM pg_tables WHERE schemaname='public'`

		const tables = tablenames
			.map(({ tablename }) => tablename)
			.filter((name) => name !== '_prisma_migrations')
			.map((name) => `"public"."${name}"`)
			.join(', ')

		try {
			await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
		} catch (error) {
			console.log({ error })
		}
	}

}
