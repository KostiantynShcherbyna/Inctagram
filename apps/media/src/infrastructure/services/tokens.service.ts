import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class TokensService {
	constructor(private jwtService: JwtService) {
	}

	async createToken(newTokenPayload: any, secret: string, expiresIn?: string)
		: Promise<string> {
		return expiresIn
			? await this.jwtService.signAsync(newTokenPayload, { secret, expiresIn })
			: await this.jwtService.signAsync(newTokenPayload, { secret })
	}

	async createTokenPath(newTokenPayload: any, secret: string): Promise<string> {
		return await this.jwtService.signAsync(newTokenPayload, { secret })
	}

	async verifyToken(token: string, secret: string): Promise<null | any> {
		try {
			const result = await this.jwtService.verifyAsync(token, { secret })
			return result
		} catch (err) {
			return null
		}
	}
}