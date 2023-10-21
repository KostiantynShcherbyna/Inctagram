import { Injectable } from '@nestjs/common'
import { UserDetails } from './user-details.type'
import { UsersRepository } from '../users/repo/users.repository'

@Injectable()
export class AuthService {
	constructor(private readonly userRepository: UsersRepository) {}

	async validateUser(details: UserDetails) {
		console.log('AuthService', details)

		const user = await this.userRepository.findUserByEmail(details.email)
		console.log('user', user)
		if (user) return user

		return await this.userRepository.createGoogleUser(details)
	}
}
