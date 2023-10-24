import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as process from 'process'
import { GitHubAuthService } from '../../features/auth/app/services/github-auth.service'
import { Strategy } from 'passport-github2'


@Injectable()
export class GithubAuthStrategy
	extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_SERVICE')
		private readonly authService: GitHubAuthService
	) {
		super({
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_OAUTH_REDIRECT_URL
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any) {
		const user = await this.authService.validateUser({
			email: profile.emails[0].value,
			displayName: profile.displayName
		})

		if (user) return user
		console.log(profile)
		return profile
	}
}
