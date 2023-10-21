import { Injectable } from '@nestjs/common'
import { Device, PrismaClient } from '@prisma/client'

@Injectable()
export class DevicesRepository {
	constructor(protected prisma: PrismaClient) {}

	async findDeviceById(id: string): Promise<Device | null> {
		return
	}
}
