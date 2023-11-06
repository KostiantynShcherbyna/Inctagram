import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { TokensService } from '../services/tokens.service'

@Injectable()
export class AccessGuard implements CanActivate {
	constructor(
		protected jwtCustomService: TokensService,
		protected configService: ConfigService
	) {
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const accessJwtSecret = this.configService.get<string>('ACCESS_JWT_SECRET')
		const request = context.switchToHttp().getRequest()
		const token = this.extractTokenFromHeader(request)
		if (!token) throw new UnauthorizedException()

		const payload = await this.jwtCustomService.verifyToken(token, accessJwtSecret)
		if (payload === null) throw new UnauthorizedException()
		request['deviceSession'] = payload
		return true
	}

	private extractTokenFromHeader(request: Request): string | null {
		const [type, token] = request.headers.authorization?.split(' ') ?? []
		return type === 'Bearer' ? token : null
	}


}