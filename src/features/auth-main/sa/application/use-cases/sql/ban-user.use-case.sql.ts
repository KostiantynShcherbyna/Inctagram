import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"
import { Contract } from "../../../../../infrastructure/utils/contract"
import { ErrorEnums } from "../../../../../infrastructure/utils/error-enums"
import { UsersRepositoryOrm } from "../../../repository/typeorm/users.repository.orm"

export class BanUserCommandSql {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {
  }
}

@CommandHandler(BanUserCommandSql)
export class BanUserSql implements ICommandHandler<BanUserCommandSql> {
  constructor(
    protected usersSqlRepository: UsersRepositoryOrm,
  ) {
  }

  async execute(command: BanUserCommandSql) {

    const user = await this.usersSqlRepository.findUserByUserId(command.userId)
    if (user === null)
      return new Contract(null, ErrorEnums.USER_NOT_FOUND)
    if (user.isBanned === command.isBanned)
      return new Contract(true, null)

    const result = command.isBanned
      ? await this.usersSqlRepository.updateUserBan(
        command.userId,
        command.isBanned,
        command.banReason,
        new Date(Date.now()).toISOString())
      : await this.usersSqlRepository.updateUserBan(
        command.userId,
        command.isBanned)

    return new Contract(true, null)
  }
}