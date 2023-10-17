import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { JwtService } from "@nestjs/jwt"

export class CreateTokenCommand {
    constructor(
        public newTokenPayload: any,
        public secret: string,
        public expiresIn: string
    ) { }
}

@CommandHandler(CreateTokenCommand)
export class CreateToken implements ICommandHandler<CreateTokenCommand> {
    constructor(
        private jwtService: JwtService
    ) {
    }

    async execute(comamnd: CreateTokenCommand): Promise<string> {
        const newToken = await this.jwtService.signAsync(
            comamnd.newTokenPayload,
            { secret: comamnd.secret, expiresIn: comamnd.expiresIn }
        )
        return newToken
    }

}