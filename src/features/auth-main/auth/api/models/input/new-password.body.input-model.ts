import { IsNotEmpty, IsString, Length } from "class-validator"
import { Transform, TransformFnParams } from "class-transformer"
import { trimValue } from "src/features/auth-main/infrastructure/decorators/trim.decorator"
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "src/features/auth-main/infrastructure/utils/constants"

export class NewPasswordBodyInputModel {
  @Transform(({ value }) => trimValue(value, "newPassword"))
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  newPassword: string

  @Transform(({ value }) => trimValue(value, "recoveryCode"))
  @IsString()
  @IsNotEmpty()
  recoveryCode: string
}
