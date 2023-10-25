import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { Inject, Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { GoogleAuthService } from '../../features/auth/app/services/google-auth.service'
import { customSettings } from '../settings/custom-settings'

dotenv.config()

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('G00GLE_AUTH_SERVICE')
		private readonly authService: GoogleAuthService
	) {
		super({
			clientID: customSettings().GOOGLE_CLIENT_ID,
			clientSecret: customSettings().GOOGLE_CLIENT_SECRET,
			callbackURL: customSettings().GOOGLE_OAUTH_REDIRECT_URL,
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
