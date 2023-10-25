import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { GitHubAuthService } from '../../features/auth/app/services/github-auth.service'
import { Strategy } from 'passport-github2'
import { customSettings } from '../settings/custom-settings'


@Injectable()
export class GithubAuthStrategy
	extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_SERVICE')
		private readonly authService: GitHubAuthService
	) {
		super({
			clientID: customSettings().GITHUB_CLIENT_ID,
			clientSecret: customSettings().GITHUB_CLIENT_SECRET,
			callbackURL: customSettings().GITHUB_OAUTH_REDIRECT_URL,
			scope: ['user'] // fetches non-public emails as well
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
