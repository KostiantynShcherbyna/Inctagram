import { PassportSerializer } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { GoogleUser } from '@prisma/client'
import { UsersRepository } from '../../users/repo/users.repository'

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(
		//@Inject('AUTH_SERVICE') private readonly authService: AuthService
		private readonly usersRepository: UsersRepository
	) {
		super()
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	serializeUser(user: GoogleUser, done: Function): any {
		console.log('Serialized User')
		done(null, user)
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	async deserializeUser(payload: any, done: Function): Promise<any> {
		const user = await this.usersRepository.findUserByEmail(payload.email)
		console.log('Deserialized User')
		console.log(user)
		return user ? done(null, user) : done(null, null)
	}
}
