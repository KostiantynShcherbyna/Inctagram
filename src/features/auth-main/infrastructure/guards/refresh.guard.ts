import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common"
import { TokensService } from "../services/tokens.service"
import { Request } from "express"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(
    protected tokensService: TokensService,
    protected configService: ConfigService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const refreshJwtSecret = this.configService.get('REFRESH_JWT_SECRET')

    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException("Not found token in request")

    const payload = await this.tokensService.verifyToken(token, refreshJwtSecret)
    if (payload === null) throw new UnauthorizedException("Not verify token")
    request["deviceSession"] = payload
    return true
  }

  private extractTokenFromHeader(request: Request): string {
    return request.cookies.refreshToken
  }
}
