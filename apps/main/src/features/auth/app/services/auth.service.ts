import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../../../users/repo/users.repository'

@Injectable()
export class AuthService {
	constructor(private readonly userRepository: UsersRepository) {}

	async validateUser(details: any) {
		const user = await this.userRepository.findUserByEmail(details.email)

		if (user) {
			return user
		}
		const newUser = await this.userRepository.createUserFromOAuth(details)

		return newUser || null
	}
}
