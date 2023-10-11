import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength, matches } from "class-validator";
import {trimValue} from "../../../../infrastructure/decorators/trim.decorator";
import {BAN_REASON_MIN_LENGTH} from "../../../../infrastructure/utils/constants";

export class BanUserBodyInputModel {
  // @Transform(({ value }) => trimValue(value, "isBanned"))
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean

  @Transform(({ value }) => trimValue(value, "banReason"))
  @IsString()
  @IsNotEmpty()
  @MinLength(BAN_REASON_MIN_LENGTH)
  banReason: string

}

