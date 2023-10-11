import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator"

export class IdParamInputModelSql {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsUUID()
  id: string
}
