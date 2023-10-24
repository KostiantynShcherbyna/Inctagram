import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github'
import * as process from 'process'
import { GoogleAuthService } from '../../features/auth/app/services/google-auth.service'

@Injectable()
export class GithubAuthStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_SERVICE') private readonly authService: GoogleAuthService
	) {
		super({
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_OAUTH_REDIRECT_URL
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any) {
		// Здесь можно сохранить информацию о пользователе в базе данных
		// И выполнить дополнительные действия, связанные с аутентификацией
		console.log(profile)
		return profile
	}
}
