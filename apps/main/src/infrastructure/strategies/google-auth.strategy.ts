import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { Inject, Injectable } from '@nestjs/common'
import { GoogleAuthValidator } from '../middlewares/auth/validators/google-auth.validator'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('G00GLE_AUTH_VALIDATOR')
		protected readonly authValidator: GoogleAuthValidator,
		protected configService: ConfigService
	) {
		super({
			clientID: "742750804533-hc4t5pt5l7glcm2tqopjhi139q3kalg0.apps.googleusercontent.com",
			clientSecret: "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",
			callbackURL: "https://visualvoyage.ru/api/v1/auth/google/redirect",
			scope: ['profile', 'email']
		})
		// super({
		// 	clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
		// 	clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
		// 	callbackURL: configService.get<string>('GOOGLE_OAUTH_REDIRECT_URL'),
		// 	scope: ['profile', 'email']
		// })
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
