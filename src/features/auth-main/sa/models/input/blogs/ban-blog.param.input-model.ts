import { IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class BanBlogParamInputModel {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
