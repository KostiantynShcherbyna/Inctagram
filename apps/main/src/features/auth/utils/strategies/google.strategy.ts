import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import * as process from 'process'
import { Inject, Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { AuthService } from '../../app/services/auth.service'

dotenv.config()

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('AUTH_SERVICE') private readonly authService: AuthService
	) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URL,
			scope: ['profile', 'email']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authService.validateUser({
			email: profile.emails[0].value,
			displayName: profile.displayName
		})

		if (user) {
			return user
		}
	}
}
