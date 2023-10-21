import { IsEmail, IsString, Matches } from "class-validator"
import { EMAIL_REGISTRATION_REGEX } from "../../../../../infrastructure/utils/constants"
import { Transform, TransformFnParams } from "class-transformer"
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'

export class EmailConfirmationResendBodyInputModel {
  @Transform(({ value }) => trimTransformer(value, "email"))
  @IsString()
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string
}
