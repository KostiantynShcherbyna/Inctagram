import { Injectable } from '@nestjs/common'
import { Device, PrismaClient } from '@prisma/client'

@Injectable()
export class DevicesRepository {
	constructor(protected prisma: PrismaClient) {}

	async findDeviceById(id: string): Promise<Device | null> {
		return this.prisma.device.findUnique({ where: { id } })
	}

	async deleteDeviceById(id: string): Promise<Device | null> {
		return this.prisma.device.delete({ where: { id } })
	}
}
