import { Injectable } from "@nestjs/common"
import { DataSource, SelectQueryBuilder } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { AccountEntity } from "../../application/entities/sql/account.entity"
import { BanInfoEntity } from "../../application/entities/sql/ban-info.entity"
import { EmailConfirmationEntity } from "../../application/entities/sql/email-confirmation.entity"
import {
  BanStatus,
  PAGE_NUMBER_DEFAULT, PAGE_SIZE_DEFAULT,
  SEARCH_EMAIL_TERM_DEFAULT,
  SEARCH_LOGIN_TERM_DEFAULT, SORT_BY_DEFAULT_SQL, SortDirection, SortDirectionOrm
} from "../../../infrastructure/utils/constants";
import {QueryUserSAInputModel} from "../../models/input/users/get-users.query.input-model";

@Injectable()
export class UsersQueryRepositoryOrm {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findMe(userId) {
    const user = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .select([
        `a.UserId as "userId"`,
        `a.Login as "login"`,
        `a.Email as "email"`
      ])
      .where(`a.UserId = :userId`, { userId })
      .getRawOne()
    return user ? user : null
  }


  async findUsers(query: QueryUserSAInputModel) {
    let banStatus: boolean[] = []
    if (query.banStatus === BanStatus.All) banStatus = [true, false]
    if (query.banStatus === BanStatus.Banned) banStatus = [true]
    if (query.banStatus === BanStatus.NotBanned) banStatus = [false]
    const searchLoginTerm = query.searchLoginTerm || SEARCH_LOGIN_TERM_DEFAULT
    const searchEmailTerm = query.searchEmailTerm || SEARCH_EMAIL_TERM_DEFAULT
    const pageNumber = +query.pageNumber || PAGE_NUMBER_DEFAULT
    const sortBy = query.sortBy.charAt(0).toUpperCase() + query.sortBy.slice(1) || SORT_BY_DEFAULT_SQL
    const sortDirection = query.sortDirection === SortDirection.Asc ? SortDirectionOrm.Asc : SortDirectionOrm.Desc
    const pageSize = +query.pageSize || PAGE_SIZE_DEFAULT
    const offset = (pageNumber - 1) * pageSize


    const totalCount = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .leftJoinAndSelect(BanInfoEntity, "b", `b.UserId = a.UserId`)
      .where(`b.IsBanned in (:...banStatus)`, { banStatus })
      .andWhere(`(a.Login ilike :login or a.Email ilike :email)`, { login: `%${searchLoginTerm}%`, email: `%${searchEmailTerm}%` })
      .getCount()

    const users = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .leftJoinAndSelect(BanInfoEntity, "b", `b.UserId = a.UserId`)
      .where(`b.IsBanned in (:...banStatus)`, { banStatus })
      .andWhere(`(a.Login ilike :login or a.Email ilike :email)`, { login: `%${searchLoginTerm}%`, email: `%${searchEmailTerm}%` })
      .orderBy(`a.${sortBy}`, sortDirection)
      .limit(pageSize)
      .offset(offset)
      .getRawMany()

    const mappedUsers = this.createUsersView(users)

    const pagesCount = Math.ceil(totalCount / pageSize)

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: Number(totalCount),
      items: mappedUsers
    }
  }

  async findUserByUserId(userId: number) {
    const user = await this.dataSource.createQueryBuilder(AccountEntity, "a")
      .select([
        `a.UserId`, `a.Login`, `a.Email`, `a.CreatedAt`,
        `b.IsBanned`, `b.BanDate`, `b.BanReason`,
        `c.ConfirmationCode`, `c.ExpirationDate`, `c.IsConfirmed`
      ])
      .where(`a.UserId = :userId`, { userId })
      .leftJoin(BanInfoEntity, "b", `b.UserId = :userId`, { userId })
      .leftJoin(EmailConfirmationEntity, "c", `c.UserId = :userId`, { userId })
      .getRawOne()
    return user ? this.createUserView(user) : null
  }

  private createUserView(user: any) {
    return {
      id: user.a_UserId,
      login: user.a_Login,
      email: user.a_Email,
      createdAt: user.a_CreatedAt,
      banInfo: {
        isBanned: user.b_IsBanned,
        banDate: user.b_BanDate,
        banReason: user.b_BanReason
      }
    }
  }

  private createUsersView(users: any[]) {
    return users.map(user => {
      return {
        id: user.a_UserId,
        login: user.a_Login,
        email: user.a_Email,
        createdAt: user.a_CreatedAt,
        banInfo: {
          isBanned: user.b_IsBanned,
          banDate: user.b_BanDate,
          banReason: user.b_BanReason
        }
      }
    })
  }

  private joinBanBuilder(qb: SelectQueryBuilder<any>, banStatus: any) {
    return qb.select(`json_agg(to_jsonb("joinBan"))`)
      .from(qb => {
        return qb
          .select([`b.IsBanned`, `b.BanDate`, `b.BanReason`])
          .from(BanInfoEntity, "b")
          .where(`b.UserId = a.UserId`)
          .andWhere(`b.IsBanned in (:...banStatus)`, { banStatus })
          .groupBy(`b.IsBanned, b.BanDate, b.BanReason`)
      }, "joinBan")
  }

  private joinBan(qb, banStatus) {
    return Array.isArray(banStatus) === true
      ? qb.leftJoin(BanInfoEntity, "b", `b.UserId = a.UserId AND b.IsBanned in (:...banStatus)`, { banStatus })
      : qb.leftJoin(BanInfoEntity, "b", `b.UserId = a.UserId AND b.IsBanned = :banStatus`, { banStatus })
  }


}
