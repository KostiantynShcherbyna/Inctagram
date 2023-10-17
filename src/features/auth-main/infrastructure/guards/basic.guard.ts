import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { Request } from "express"
import { BasicToken } from "../utils/constants"

@Injectable()
export class BasicGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException("Basic token is required")
    if (token !== BasicToken.token) throw new UnauthorizedException("Basic token is invalid")
    return true
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? []
    return type === "Basic" ? token : null
  }

}