import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { JwtService } from "@nestjs/jwt"

export class VerifyTokenCommand {
    constructor(
        public token: string,
        public secret: string
    ) { }
}

@CommandHandler(VerifyTokenCommand)
export class VerifyToken implements ICommandHandler<VerifyTokenCommand>{
    constructor(
        private jwtService: JwtService
    ) {
    }

    async execute(command: VerifyTokenCommand): Promise<null | any> {
        try {
            const result = await this.jwtService.verifyAsync(
                command.token,
                { secret: command.secret }
            )
            return result

        } catch (err) {
            return null
        }

    }

}