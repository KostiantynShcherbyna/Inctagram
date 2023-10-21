import { IsNotEmpty, IsString, Length } from "class-validator"
import { Transform, TransformFnParams } from "class-transformer"
import { trimTransformer } from '../../../../../../../infrastructure/utils/trim-transformer'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../../../../../../infrastructure/utils/constants'

export class NewPasswordBodyInputModel {
  @Transform(({ value }) => trimTransformer(value, "newPassword"))
  @IsString()
  @Length(PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)
  newPassword: string

  @Transform(({ value }) => trimTransformer(value, "recoveryCode"))
  @IsString()
  @IsNotEmpty()
  recoveryCode: string
}
