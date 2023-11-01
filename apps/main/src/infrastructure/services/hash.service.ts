import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class HashService {

	async encryption(dto: string): Promise<string> {
		const salt = await bcrypt.genSalt(10)
		return bcrypt.hash(dto, salt)
	}

	async comparison(hash: string, dto: string): Promise<boolean> {
		const isCompare = await bcrypt.compare(dto, hash)
		return isCompare ? isCompare : false
	}


}