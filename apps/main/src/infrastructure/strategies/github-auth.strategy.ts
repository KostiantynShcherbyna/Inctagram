import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as process from 'process'
import { GithubAuthValidator } from '../middlewares/auth/validators/github-auth.validator'
import { Profile, Strategy } from 'passport-github2'


@Injectable()
export class GithubAuthStrategy
	extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_VALIDATOR')
		private readonly authValidator: GithubAuthValidator
	) {
		super({
			clientID: process.env.GITHUB_CLIENT_ID_2,
			clientSecret: process.env.GITHUB_CLIENT_SECRET_2,
			callbackURL: process.env.GITHUB_OAUTH_REDIRECT_URL_2,
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
