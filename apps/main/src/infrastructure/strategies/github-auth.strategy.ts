import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { GithubAuthValidator } from '../middlewares/auth/validators/github-auth.validator'
import { Profile, Strategy } from 'passport-github2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GithubAuthStrategy extends PassportStrategy(Strategy, 'github') {
	constructor(
		@Inject('GITHUB_AUTH_VALIDATOR')
		protected readonly authValidator: GithubAuthValidator,
		protected configService: ConfigService
	) {
		super({
			clientID: '52568a88855c473e46da',
			clientSecret: '26217d8fdffb2ebe0e98cb45175e6f9505228af7',
			callbackURL: 'https://inctagram-tau.vercel.app/api/v1/auth/github/login',
			scope: ['user'] // fetches non-public emails as well
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
