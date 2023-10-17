import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"
import { trimValue } from "src/features/auth-main/infrastructure/decorators/trim.decorator"

export class ConfirmationBodyInputModelSql {
  @Transform(({ value }) => trimValue(value, "code"))
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  code: string
}
