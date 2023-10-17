import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class IdParamInputModel {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
