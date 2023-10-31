import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../../../../features/users/rep/users.repository'

@Injectable()
export class GoogleAuthValidator {
	constructor(private readonly userRepository: UsersRepository) {
	}

	async validateUser(details: any) {
		const user = await this.userRepository.findUserByEmail(details.email)
		if (user) return user
		const newUser = await this.userRepository.createUserFromOAuth(details)
		return newUser || null
	}
}
