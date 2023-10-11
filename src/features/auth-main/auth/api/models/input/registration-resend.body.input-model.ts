import { IsEmail, IsString, Matches } from "class-validator"
import { Transform, TransformFnParams } from "class-transformer"
import { trimValue } from "src/features/auth-main/infrastructure/decorators/trim.decorator"
import { EMAIL_REGISTRATION_REGEX } from "src/features/auth-main/infrastructure/utils/constants"

export class BodyConfirmationResendInputModel {
  @Transform(({ value }) => trimValue(value, "email"))
  @IsString()
  @IsEmail()
  @Matches(EMAIL_REGISTRATION_REGEX)
  email: string
}
