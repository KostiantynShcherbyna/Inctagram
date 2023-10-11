import { Transform, TransformFnParams } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"
import { trimValue } from "src/features/auth-main/infrastructure/decorators/trim.decorator"

export class LoginBodyInputModel {
  @Transform(({ value }) => trimValue(value, "loginOrEmail"))
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string

  @Transform(({ value }) => trimValue(value, "password"))
  @IsNotEmpty()
  @IsString()
  password: string
}
