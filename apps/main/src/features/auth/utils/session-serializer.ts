import { PassportSerializer } from '@nestjs/passport'
import { Inject } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { GoogleUser } from '@prisma/client'

export class SessionSerializer extends PassportSerializer {
	constructor(
		@Inject('AUTH_SERVICE') private readonly authService: AuthService
	) {
		super()
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	serializeUser(user: GoogleUser, done: Function): any {
		done(null, user)
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	deserializeUser(payload: any, done: Function): any {}
}
