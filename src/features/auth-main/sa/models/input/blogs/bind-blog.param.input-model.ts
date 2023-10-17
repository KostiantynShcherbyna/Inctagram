import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class BindInputModel {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId: string
}
