import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { GithubAuthValidator } from '../middlewares/auth/validators/github-auth.validator'
import { Profile, Strategy } from 'passport-github2'
import { ConfigService } from '@nestjs/config'


@Injectable()
export class GithubAuthStrategy
	extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_VALIDATOR')
		private readonly authValidator: GithubAuthValidator,
		private configService: ConfigService
	) {
		super({
			clientID: configService.get<string>('GITHUB_CLIENT_ID'),
			clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
			callbackURL: configService.get<string>('GITHUB_OAUTH_REDIRECT_URL'),
			scope: ['user'] // fetches non-public emails as well
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authValidator.validateUser({
			email: profile.emails[0].value,
			username: profile.username || profile.displayName
		})

		if (user) return user
		console.log(profile)
		return profile
	}
}
