import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { DataSource } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { RecoveryCodeEntityCopy } from "../../application/entities/sql/recovery-code.entity"

@Injectable()
export class AuthRepositoryOrmCopy {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) {
  }

  async findLastRecoveryCodeByEmail(email: string) {
    const builderResult = this.dataSource.createQueryBuilder()
      .select([
        `r.RecoveryCodeId as recoveryCodeId`,
        `r.Email as email`,
        `r.RecoveryCode as recoveryCode`,
        `r.Active as active`
      ])
      .from(RecoveryCodeEntityCopy, "r")
      .where("r.Email = :email", { email })
    const result = await builderResult.getRawMany()
    return result.length ? result[result.length - 1] : null
    // return recoveryCodes.length ? recoveryCodes[recoveryCodes.length - 1] : null
  }

  async createPasswordRecoveryCode({ email, recoveryCode, active }) {
    const result = await this.dataSource.createQueryBuilder()
      .insert()
      .into(RecoveryCodeEntityCopy)
      .values({
        Email: email,
        RecoveryCode: recoveryCode,
        Active: active
      })
      .execute()
    return result.identifiers[0].RecoveryCodeId
  }

  async deactivatePasswordRecoveryCode(recoveryCodeId: number) {
    const result = await this.dataSource.createQueryBuilder()
      .update(RecoveryCodeEntityCopy)
      .set({ Active: false })
      .where(`RecoveryCodeId = :recoveryCodeId`, { recoveryCodeId })
      .execute()
    return result.raw.length ? result.raw[0] : null
  }


}
