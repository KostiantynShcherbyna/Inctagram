import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { Inject, Injectable } from '@nestjs/common'
import { GoogleAuthValidator } from '../middlewares/auth/validators/google-auth.validator'
import { ConfigService } from '@nestjs/config'
import { EnvConfigEnum } from '../utils/constants'

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		@Inject('G00GLE_AUTH_VALIDATOR')
		protected readonly authValidator: GoogleAuthValidator,
		protected configService: ConfigService
	) {
		// super({
		// 	clientID: process.env.GOOGLE_CLIENT_ID,
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		// 	callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
		// 	scope: ['profile', 'email']
		// })
		super({
			clientID: configService.get<string>('GOOGLE_CLIENT_ID'
				, EnvConfigEnum.GOOGLE_CLIENT_ID),
			clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'
				, EnvConfigEnum.GOOGLE_CLIENT_SECRET),
			callbackURL: configService.get<string>('GOOGLE_OAUTH_CALLBACK_URL'
				, EnvConfigEnum.GOOGLE_OAUTH_CALLBACK_URL_PRD),
			scope: ['profile', 'email']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authValidator.validateUser({
			email: profile.emails[0].value,
			username: profile.username || profile.displayName
		})
		return user ? user : profile
	}
}
