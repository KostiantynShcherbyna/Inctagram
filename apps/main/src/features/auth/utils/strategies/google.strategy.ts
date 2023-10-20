import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import * as process from 'process'
import { Injectable } from '@nestjs/common'
import * as dotenv from 'dotenv'

dotenv.config()

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor() {
		console.log(process.env.GOOGLE_OAUTH_REDIRECT_URL)
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URL,
			scope: ['profile', 'email']
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log(accessToken)
		console.log(refreshToken)
		console.log(profile)
	}
}
