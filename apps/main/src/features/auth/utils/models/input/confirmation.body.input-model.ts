import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"
import { trimTransformer } from '../../../../../infrastructure/utils/trim-transformer'

export class ConfirmationBodyInputModel {
  @Transform(({ value }) => trimTransformer(value, "code"))
  @IsString()
  @IsNotEmpty()
  code: string
}
