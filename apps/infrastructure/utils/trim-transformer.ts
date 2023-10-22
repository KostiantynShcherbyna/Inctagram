import { BadRequestException } from '@nestjs/common'

export const trimTransformer = (value: any, field: string) => {
	try {
		return value.trim()
	} catch {
		throw new BadRequestException({
			message: 'Value is not a string type',
			field: field
		})
	}
}
