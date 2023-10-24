import { AuthGuard } from '@nestjs/passport'
import { ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class GithubAuthGuard extends AuthGuard('google') {
	async canActivate(context: ExecutionContext) {
		const activate = (await super.canActivate(context)) as boolean
		const request = context.switchToHttp().getRequest()
		await super.logIn(request)
		return activate
	}
}
