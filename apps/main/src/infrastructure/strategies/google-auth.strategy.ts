import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import * as process from 'process'
import { Inject, Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { GoogleAuthValidator } from '../middlewares/auth/validators/google-auth.validator'

dotenv.config()

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('G00GLE_AUTH_VALIDATOR')
		private readonly authValidator: GoogleAuthValidator
	) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID_MY,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET_MY,
			callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URL_VERCEL,
			scope: ['profile', 'email']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authValidator.validateUser({
			email: profile.emails[0].value,
			username: profile.username || profile.displayName
		})

		if (user) {
			return user
		}
	}
}
